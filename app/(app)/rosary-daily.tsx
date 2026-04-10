import { AudioBar } from '@/components/AudioBar';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import {
  getDailyRosaryIds,
  getMysterySetForWeekday,
  INTRO_TEXT,
  labelForId,
  MYSTERY_TITLES,
} from '@/data/rosary';
import { MYSTERY_LABELS } from '@/types/progress';
import { useRosaryProgress } from '@/hooks/useRosaryProgress';
import { palette, spacing } from '@/constants/theme';
import { useMemo } from 'react';

export const options = { title: 'Terço do dia' };
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RosaryDailyScreen() {
  const today = useMemo(() => new Date(), []);
  const mysterySet = useMemo(() => getMysterySetForWeekday(today), [today]);
  const allIds = useMemo(() => getDailyRosaryIds(mysterySet), [mysterySet]);
  const { hydrated, toggle, isChecked, checkedCount, total } = useRosaryProgress(
    'daily',
    allIds
  );

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
        {MYSTERY_LABELS[mysterySet]}
      </Text>
      <Text style={styles.sub} allowFontScaling>
        {today.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${(checkedCount / total) * 100}%` }]}
        />
      </View>
      <Text style={styles.progressTxt} allowFontScaling>
        {checkedCount} de {total} passos
      </Text>

      <AudioBar title={`Terço — ${MYSTERY_LABELS[mysterySet]}`} queueId="rosary-daily" />

      <Text style={styles.section} allowFontScaling>
        Início
      </Text>
      <Text style={styles.hint} allowFontScaling>
        {INTRO_TEXT.cross}
      </Text>

      {allIds.map((id) => {
        const meta = labelForId(id, { mode: 'daily', mysterySet });
        const dec = id.match(/:d(\d+):mystery$/);
        const extra =
          dec && id.endsWith(':mystery')
            ? MYSTERY_TITLES[mysterySet][parseInt(dec[1], 10)]
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
                      : id.endsWith(':mystery') && extra
                        ? INTRO_TEXT.decadeBlock(extra)
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
    marginTop: 4,
    color: palette.textSecondary,
    textTransform: 'capitalize',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
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
