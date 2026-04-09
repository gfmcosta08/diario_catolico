const runningOnRender =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  (Boolean(process.env.DATABASE_URL) && Boolean(process.env.PORT));

if (runningOnRender) {
  const { spawn } = await import('node:child_process');

  const child = spawn('npm', ['--prefix', 'backend', 'run', 'start'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
} else {
  await import('./registerPlayer');
  await import('expo-router/entry');
}
