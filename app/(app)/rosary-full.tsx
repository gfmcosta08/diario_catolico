import { AudioBar } from '@/components/AudioBar';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import {
  FULL_ROSARY_ORDER,
  getDecadeMeta,
  getFullRosaryIds,
  INTRO_TEXT,
  labelForId,
  MYSTERY_TITLES,
} from '@/data/rosary';
import { MYSTERY_LABELS } from '@/types/progress';
import { useRosaryProgress } from '@/hooks/useRosaryProgress';
import { palette, spacing } from '@/constants/theme';
import { useMemo } from 'react';

export const options = { title: 'Rosário completo' };
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RosaryFullScreen() {
  const allIds = useMemo(() => getFullRosaryIds(), []);
  const { hydrated, toggle, isChecked, checkedCount, total } = useRosaryProgress(
    'full',
    allIds
  );

  const firstUnchecked = useMemo(() => {
    return allIds.find((id) => !isChecked(id)) ?? null;
  }, [allIds, isChecked, checkedCount]);

  const positionLabel = useMemo(() => {
    if (!firstUnchecked || firstUnchecked.startsWith('intro:')) {
      return 'Introdução';
    }
    if (firstUnchecked === 'outro:closing') {
      return 'Encerramento';
    }
    const meta = getDecadeMeta(firstUnchecked, { mode: 'full' });
    if (meta?.globalDecade === undefined) return 'Rosário';
    const g = meta.globalDecade;
    const setIdx = Math.floor(g / 5);
    const inSet = g % 5;
    const set = FULL_ROSARY_ORDER[setIdx];
    return `${MYSTERY_LABELS[set]} — Mistério ${inSet + 1}/5 (dezena ${g + 1}/20)`;
  }, [firstUnchecked]);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Carregando progresso…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.head} allowFontScaling>
        Rosário completo
      </Text>
      <Text style={styles.sub} allowFontScaling>
        Quatro terços, vinte mistérios. Reserve tempo calmo; use a barra e o áudio
        para acompanhar.
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${(checkedCount / total) * 100}%` }]}
        />
      </View>
      <Text style={styles.progressTxt} allowFontScaling>
        {checkedCount} de {total} passos · {positionLabel}
      </Text>

      <AudioBar title="Rosário completo (áudio exemplo)" queueId="rosary-full" />

      <Text style={styles.section} allowFontScaling>
        Orações iniciais
      </Text>
      <Text style={styles.hint} allowFontScaling>
        {INTRO_TEXT.cross}
      </Text>

      {allIds.map((id) => {
        const meta = labelForId(id, { mode: 'full' });
        const dm = getDecadeMeta(id, { mode: 'full' });
        const mysteryTitle =
          dm && id.endsWith(':mystery')
            ? MYSTERY_TITLES[dm.set][dm.decadeInSet]
            : undefined;
        return (
          <AppCheckbox
            key={id}
            checked={isChecked(id)}
            onToggle={() => toggle(id)}
            label={meta}
            description={
              id === 'intro:offering'
                ? INTRO_TEXT.offering.slice(0, 120) + '…'
                : id === 'intro:pai'
                  ? INTRO_TEXT.paiNossoInicial
                  : id.startsWith('intro:ave:')
                    ? INTRO_TEXT.aveIntentions[parseInt(id.split(':')[2], 10) - 1]
                    : id === 'intro:gloria'
                      ? INTRO_TEXT.gloriaIntro
                      : mysteryTitle
                        ? INTRO_TEXT.decadeBlock(mysteryTitle)
                        : id === 'outro:closing'
                          ? INTRO_TEXT.closing.slice(0, 140) + '…'
                          : undefined
            }
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 120,
    backgroundColor: palette.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  head: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
  },
  sub: {
    marginTop: 6,
    color: palette.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 10,
    backgroundColor: palette.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.accent,
  },
  progressTxt: { fontSize: 14, color: palette.textSecondary, marginBottom: spacing.md },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
