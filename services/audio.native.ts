import TrackPlayer, { Capability, State } from 'react-native-track-player';

/** URL de exemplo — substitua por áudio guiado licenciado em produção. */
export const PLACEHOLDER_AUDIO_URL =
  'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kevin_MacLeod/Kevin_MacLeod_-_Royalty_Free/Kevin_MacLeod_-_Monkeys_Spinning_Monkeys.mp3';

let setupPromise: Promise<void> | null = null;

export async function ensureAudioReady(): Promise<boolean> {
  if (!setupPromise) {
    setupPromise = TrackPlayer.setupPlayer({
      waitForBuffer: true,
    }).catch(() => {
      setupPromise = null;
      throw new Error('Audio não disponível neste ambiente');
    });
  }
  await setupPromise;
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    progressUpdateEventInterval: 1,
  });
  return true;
}

export async function loadQueue(tracks: { id: string; title: string; url: string }[]) {
  const ok = await ensureAudioReady();
  if (!ok) return;
  await TrackPlayer.reset();
  await TrackPlayer.add(
    tracks.map((t) => ({
      id: t.id,
      url: t.url,
      title: t.title,
      artist: 'Agenda Católica',
    }))
  );
}

export async function playAudio() {
  await TrackPlayer.play();
}

export async function pauseAudio() {
  await TrackPlayer.pause();
}

export async function skipNext() {
  await TrackPlayer.skipToNext();
}

export async function skipPrevious() {
  await TrackPlayer.skipToPrevious();
}

export async function getProgress() {
  return TrackPlayer.getProgress();
}

export async function stopAndReset() {
  try {
    await TrackPlayer.reset();
  } catch {
    /* noop */
  }
}

export { State };
