import { palette, radii, spacing, touchMin } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  loadQueue,
  pauseAudio,
  PLACEHOLDER_AUDIO_URL,
  playAudio,
  skipNext,
  skipPrevious,
} from '@/services/audio';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { State, usePlaybackState } from 'react-native-track-player';

type Props = {
  title: string;
  queueId: string;
};

export function AudioBar({ title, queueId }: Props) {
  const playback = usePlaybackState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPlaying = playback.state === State.Playing;
  const isBuffering =
    playback.state === State.Buffering || playback.state === State.Loading;

  async function prepare() {
    setBusy(true);
    setError(null);
    try {
      await loadQueue([
        {
          id: queueId,
          title,
          url: PLACEHOLDER_AUDIO_URL,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar áudio');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.bar}>
      <Text style={styles.barTitle} allowFontScaling maxFontSizeMultiplier={1.5}>
        Áudio guiado (exemplo)
      </Text>
      <Text style={styles.barHint} allowFontScaling maxFontSizeMultiplier={1.4}>
        Substitua a URL em services/audio.native.ts por faixas licenciadas. Use
        development build (expo prebuild) para segundo plano e controles na tela
        de bloqueio.
      </Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel="Carregar fila de áudio"
          accessibilityHint="Prepara a faixa de exemplo na fila do player"
          style={styles.iconBtn}
          onPress={prepare}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={palette.primary} />
          ) : (
            <FontAwesome name="download" size={22} color={palette.primary} />
          )}
        </Pressable>
        <Pressable
          accessibilityLabel="Faixa anterior"
          style={styles.iconBtn}
          onPress={() => skipPrevious()}
        >
          <FontAwesome name="backward" size={22} color={palette.primary} />
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}
          style={styles.playBtn}
          onPress={async () => {
            if (playback.state === State.None) await prepare();
            if (isPlaying) await pauseAudio();
            else await playAudio();
          }}
        >
          <FontAwesome
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color={palette.surface}
          />
        </Pressable>
        <Pressable
          accessibilityLabel="Próxima faixa"
          style={styles.iconBtn}
          onPress={() => skipNext()}
        >
          <FontAwesome name="forward" size={22} color={palette.primary} />
        </Pressable>
      </View>
      {isBuffering ? (
        <Text style={styles.status} allowFontScaling>
          Carregando…
        </Text>
      ) : null}
      {error ? (
        <Text style={styles.err} allowFontScaling>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  barTitle: { fontWeight: '700', color: palette.text, fontSize: 16 },
  barHint: {
    marginTop: 4,
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    minWidth: touchMin,
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  status: { marginTop: 8, textAlign: 'center', color: palette.textSecondary },
  err: { marginTop: 8, color: palette.error, textAlign: 'center' },
});
