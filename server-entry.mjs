import { spawn } from 'node:child_process';

const runningOnRender =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  (Boolean(process.env.DATABASE_URL) && Boolean(process.env.PORT));

function runStep(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(${cmd}  failed with code ));
    });
  });
}

async function main() {
  if (!runningOnRender) {
    // Outside Render, keep behavior aligned with local Expo usage.
    await import('./index.ts');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error(
      '[ERRO] DATABASE_URL não configurada. Adicione a variável no Render apontando para o PostgreSQL.'
    );
    process.exit(1);
  }

  try {
    await runStep('npm', ['--prefix', 'backend', 'run', 'prisma:generate']);
    await runStep('npm', ['--prefix', 'backend', 'run', 'prisma:migrate']);

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