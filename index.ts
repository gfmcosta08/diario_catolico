const runningOnRender =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  (Boolean(process.env.DATABASE_URL) && Boolean(process.env.PORT));

if (runningOnRender) {
  const { spawn } = await import('node:child_process');
  const runStep = (cmd: string, args: string[]) =>
    new Promise<void>((resolve, reject) => {
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

  try {
    await runStep('npm', ['--prefix', 'backend', 'install', '--include=dev']);
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
} else {
  await import('./registerPlayer');
  await import('expo-router/entry');
}
