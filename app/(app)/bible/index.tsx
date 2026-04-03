import { useBibleProgressMap } from '@/hooks/useBibleProgress';
import { palette, spacing, touchMin } from '@/constants/theme';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export const options = { title: 'Leitura em 365 dias' };

const COLS = 7;

export default function BiblePlanScreen() {
  const { hydrated, completedCount, isDayDone } = useBibleProgressMap();

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Carregando…</Text>
      </View>
    );
  }

  const rows: number[][] = [];
  for (let r = 0; r < Math.ceil(365 / COLS); r++) {
    rows.push(
      Array.from({ length: COLS }, (_, c) => r * COLS + c + 1).filter((d) => d <= 365)
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.head} allowFontScaling>
        Plano de 365 dias
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / 365) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressTxt} allowFontScaling>
          {completedCount} de 365 dias concluídos
        </Text>
      </View>
      <Text style={styles.sub} allowFontScaling>
        Toque no dia para ler e marcar. Dias anteriores permanecem acessíveis.
      </Text>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day) => {
            const done = isDayDone(day);
            return (
              <Link key={day} href={`/(app)/bible/${day}`} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Dia ${day}${done ? ', concluído' : ''}`}
                  style={[styles.cell, done && styles.cellDone]}
                >
                  <Text
                    style={[styles.cellTxt, done && styles.cellTxtDone]}
                    allowFontScaling
                  >
                    {day}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 80,
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
    marginBottom: spacing.md,
  },
  progressRow: { marginBottom: spacing.md },
  progressBar: {
    height: 10,
    backgroundColor: palette.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.success,
  },
  progressTxt: { fontSize: 15, color: palette.textSecondary, fontWeight: '600' },
  sub: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  cell: {
    minWidth: (touchMin * 7) / 8,
    minHeight: (touchMin * 7) / 8,
    flex: 1,
    maxWidth: '14.28%',
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cellDone: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  cellTxt: { fontSize: 13, fontWeight: '600', color: palette.text },
  cellTxtDone: { color: palette.surface },
});
