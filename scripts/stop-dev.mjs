import { spawnSync } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const repoRoot = process.cwd().toLowerCase();
const ports = [3000, 3001];

function runPowerShell(script) {
  return spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    encoding: 'utf8',
    shell: false,
  });
}

function stopWindowsPortOwners() {
  const script = `
    $ports = @(${ports.join(',')})
    $repoRoot = '${repoRoot.replaceAll("'", "''")}'
    $connections = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
    $stopped = @()
    foreach ($connection in $connections) {
      $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" -ErrorAction SilentlyContinue
      if ($null -eq $process) { continue }
      $commandLine = ($process.CommandLine + '').ToLower()
      if ($commandLine.Contains($repoRoot)) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        $stopped += [PSCustomObject]@{
          port = $connection.LocalPort
          pid = $process.ProcessId
          name = $process.Name
        }
      } else {
        Write-Host "Port $($connection.LocalPort) is used by PID $($process.ProcessId) ($($process.Name)), but it does not look like this repo. Stop it manually if needed."
      }
    }
    $stopped | ConvertTo-Json -Compress
  `;

  const result = runPowerShell(script);
  if (result.error || result.status !== 0) {
    console.log('Could not inspect Windows ports automatically.');
    if (result.stderr) console.log(result.stderr.trim());
    return;
  }

  const output = result.stdout.trim();
  if (!output) {
    console.log('No existing repo dev servers found on ports 3000 or 3001.');
    return;
  }

  console.log(`Stopped old repo dev server process(es): ${output}`);
}

function stopUnixPortOwners() {
  for (const port of ports) {
    const result = spawnSync('sh', ['-lc', `lsof -ti tcp:${port}`], { encoding: 'utf8' });
    const pids = result.stdout.split(/\s+/).filter(Boolean);
    for (const pid of pids) {
      const command = spawnSync('sh', ['-lc', `ps -p ${pid} -o command=`], { encoding: 'utf8' }).stdout.toLowerCase();
      if (command.includes(repoRoot)) {
        spawnSync('kill', ['-9', pid], { stdio: 'ignore' });
        console.log(`Stopped old repo process ${pid} on port ${port}.`);
      } else {
        console.log(`Port ${port} is used by PID ${pid}, but it does not look like this repo. Stop it manually if needed.`);
      }
    }
  }
}

if (isWindows) {
  stopWindowsPortOwners();
} else {
  stopUnixPortOwners();
}
