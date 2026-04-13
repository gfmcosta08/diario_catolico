import { spawn } from 'node:child_process';

const runningOnRender =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  (Boolean(process.env.DATABASE_URL) && Boolean(process.env.PORT));

function runStep(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed with code ${code}`));
    });
  });
}

async function runOptionalStep(label: string, cmd: string, args: string[]) {
  try {
    await runStep(cmd, args);
  } catch (error) {
    console.warn(`[WARN] ${label} falhou; seguindo startup.`);
    console.warn(String(error));
  }
}

async function main() {
  if (!runningOnRender) {
    // Local Expo workflow (native/web) keeps platform-specific registerPlayer.
    // @ts-ignore Metro/Expo resolves registerPlayer.web.ts or registerPlayer.native.ts.
    await import('./registerPlayer');
    // @ts-ignore expo-router/entry is provided at runtime by Expo Router.
    await import('expo-router/entry');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error(
      '[ERRO] DATABASE_URL não configurada. Defina a variável no serviço Render.'
    );
    process.exit(1);
  }

  try {
    await runOptionalStep('prisma:migrate', 'npm', [
      '--prefix',
      'backend',
      'run',
      'prisma:migrate',
    ]);

    const shouldRunPrismaPush = process.env.AUTO_PRISMA_PUSH === 'true';
    if (shouldRunPrismaPush) {
      const pushArgs = ['--prefix', 'backend', 'run', 'prisma:push'];
      if (process.env.PRISMA_PUSH_ACCEPT_DATA_LOSS === 'true') {
        pushArgs.push('--', '--accept-data-loss');
      }
      await runOptionalStep('prisma:push', 'npm', pushArgs);
    } else {
      console.log(
        '[INFO] AUTO_PRISMA_PUSH!=true: pulando prisma:push no startup para evitar bloqueio do deploy.'
      );
    }

    const child = spawn('npm', ['--prefix', 'backend', 'run', 'start'], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      process.exit(code ?? 1);
    });
  } catch (error) {
    console.error('[ERRO] Falha no bootstrap Render:', error);
    process.exit(1);
  }
}

main();
