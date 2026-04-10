/** Stubs na web — evita puxar shaka-player / react-native-track-player no bundle. */

export const PLACEHOLDER_AUDIO_URL = '';

export async function ensureAudioReady(): Promise<boolean> {
  return false;
}

export async function loadQueue(_tracks: { id: string; title: string; url: string }[]) {
  /* noop */
}

export async function playAudio() {
  /* noop */
}

export async function pauseAudio() {
  /* noop */
}

export async function skipNext() {
  /* noop */
}

export async function skipPrevious() {
  /* noop */
}

export async function getProgress() {
  return { position: 0, duration: 0 };
}

export async function stopAndReset() {
  /* noop */
}

export enum State {
  None = 'none',
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
  Buffering = 'buffering',
  Loading = 'loading',
}
