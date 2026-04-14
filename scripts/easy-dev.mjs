import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const pnpmCjs = isWindows && process.env.APPDATA
  ? path.join(process.env.APPDATA, 'npm', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs')
  : '';
const pnpmCommand = pnpmCjs && existsSync(pnpmCjs) ? process.execPath : 'pnpm';
const pnpmArgs = pnpmCjs && existsSync(pnpmCjs) ? [pnpmCjs] : [];

const quoteCmd = (cmd) => isWindows && cmd.includes(' ') && !cmd.startsWith('"') ? `"${cmd}"` : cmd;

function run(command, args, options = {}) {
  const finalCommand = quoteCmd(command);
  console.log(`\n> ${finalCommand} ${args.join(' ')}`);
  const result = spawnSync(finalCommand, args, {
    stdio: 'inherit',
    shell: isWindows,
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function canRun(command, args) {
  const result = spawnSync(quoteCmd(command), args, { stdio: 'ignore', shell: isWindows });
  return result.status === 0;
}

function getDockerComposeCommand() {
  if (canRun('docker', ['compose', 'version'])) {
    return { command: 'docker', args: ['compose'] };
  }

  const dockerCompose = isWindows ? 'docker-compose.exe' : 'docker-compose';
  if (canRun(dockerCompose, ['version'])) {
    return { command: dockerCompose, args: [] };
  }

  console.error('\nDocker Compose was not found. Install Docker Desktop, start it, then run pnpm easy again.');
  process.exit(1);
}

function waitForPort(host, port, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host, port });

      socket.once('connect', () => {
        socket.end();
        resolve();
      });

      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 1000);
      });
    };

    tryConnect();
  });
}

async function main() {
  console.log('SMS Relay easy start');
  console.log('This starts PostgreSQL, Redis, the API, and the web dashboard.');

  if (!existsSync('node_modules')) {
    run(pnpmCommand, [...pnpmArgs, 'install']);
  }

  const compose = getDockerComposeCommand();
  run(compose.command, [...compose.args, 'up', '-d', 'redis', 'postgres']);

  console.log('\nWaiting for PostgreSQL on localhost:5432...');
  await waitForPort('127.0.0.1', 5432, 60000);
  console.log('PostgreSQL is reachable.');

  console.log('\nFreeing old repo dev servers on ports 3000 and 3001...');
  run(process.execPath, ['scripts/stop-dev.mjs']);

  console.log('\nStarting development servers...');
  console.log('Web dashboard: http://localhost:3000');
  console.log('API: http://localhost:3001');
  console.log('Press Ctrl+C to stop the app.\n');

  const dev = spawn(quoteCmd(pnpmCommand), [...pnpmArgs, 'exec', 'turbo', 'run', 'dev'], {
    stdio: 'inherit',
    shell: isWindows,
  });

  dev.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
