import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const pnpmCjs = isWindows && process.env.APPDATA
  ? path.join(process.env.APPDATA, 'npm', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs')
  : '';
const pnpmCommand = pnpmCjs && existsSync(pnpmCjs) ? process.execPath : 'pnpm';
const pnpmArgs = pnpmCjs && existsSync(pnpmCjs) ? [pnpmCjs] : [];

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: isWindows });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
  };
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      resolve({ ok: false, error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false, error: 'Timed out' });
    });
  });
}

function print(ok, label, detail = '') {
  const prefix = ok ? '[OK]' : '[FAIL]';
  console.log(`${prefix} ${label}${detail ? ` - ${detail}` : ''}`);
}

async function main() {
  console.log('SMS Relay doctor\n');

  const pnpmCheck = run(pnpmCommand, [...pnpmArgs, '--version']);
  print(pnpmCheck.ok, 'pnpm', pnpmCheck.output);

  const dockerCompose = run('docker', ['compose', 'version']);
  const legacyCompose = isWindows ? run('docker-compose.exe', ['version']) : run('docker-compose', ['version']);
  print(dockerCompose.ok || legacyCompose.ok, 'Docker Compose', dockerCompose.output || legacyCompose.output);

  const api = await checkUrl('http://127.0.0.1:3001/system/health');
  print(api.ok, 'API health', api.ok ? api.body : api.error || `HTTP ${api.status}`);

  if (!api.ok) {
    console.log('\nRun this from the repo root:');
    console.log('pnpm easy');
  }
}

main();
