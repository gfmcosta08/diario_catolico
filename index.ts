import { spawn } from 'node:child_process';

const runningOnRender =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  (Boolean(process.env.PORT) && Boolean(process.env.DATABASE_URL));

function runStep(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

async function main() {
  if (!runningOnRender) {
    await import('./registerPlayer');
    await import('expo-router/entry');
    return;
  }

  try {
    await runStep('npm', ['--prefix', 'backend', 'install', '--include=dev']);
    try {
      await runStep('npm', ['--prefix', 'backend', 'run', 'prisma:migrate']);
    } catch (error) {
      console.warn('[WARN] prisma:migrate falhou; seguindo com prisma:push');
      console.warn(String(error));
    }
    await runStep('npm', ['--prefix', 'backend', 'run', 'prisma:push']);

    const child = spawn('npm', ['--prefix', 'backend', 'run', 'start'], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      process.exit(code ?? 1);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
