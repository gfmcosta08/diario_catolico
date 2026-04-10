const isServerRuntime = typeof window === 'undefined';
const runningOnRender =
  isServerRuntime &&
  (Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    (Boolean(process.env.DATABASE_URL) && Boolean(process.env.PORT)));

async function start() {
  if (runningOnRender) {
    const { spawn } = await import('node:child_process');
    const runStep = (cmd, args) =>
      new Promise((resolve, reject) => {
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

    if (!process.env.DATABASE_URL) {
      console.error(
        '[ERRO] DATABASE_URL não configurada. Acesse o dashboard do Render e adicione a variável de ambiente DATABASE_URL apontando para o seu banco PostgreSQL.'
      );
      process.exit(1);
    }

    try {
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
    return;
  }

  await import('./registerPlayer');
  await import('expo-router/entry');
}

start().catch((error) => {
  console.error(error);
  process.exit?.(1);
});
