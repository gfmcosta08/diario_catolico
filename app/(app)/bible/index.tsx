import { useBibleProgressMap } from '@/hooks/useBibleProgress';
import { palette, spacing, touchMin } from '@/constants/theme';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export const options = { title: 'Leia a Bíblia em 365 dias' };

const COLS = 7;
const TOTAL_DAYS = 365;
const WEEKLY_GOAL = 7;

type FilterMode = 'all' | 'pending' | 'done' | 'today';

export default function BiblePlanScreen() {
  const { hydrated, completedCount, completedDays, isDayDone } = useBibleProgressMap();
  const [filter, setFilter] = useState<FilterMode>('all');

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Carregando…</Text>
      </View>
    );
  }

  const percentage = Math.round((completedCount / TOTAL_DAYS) * 100);
  const dayOfYear = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const diff = today.getTime() - start.getTime();
    return Math.max(1, Math.min(TOTAL_DAYS, Math.floor(diff / 86400000) + 1));
  }, []);

  const weeklyProgress = Math.min(WEEKLY_GOAL, completedDays.filter((d) => d >= dayOfYear - 6).length);
  const visibleDays = useMemo(() => {
    switch (filter) {
      case 'done':
        return Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => isDayDone(d));
      case 'pending':
        return Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).filter((d) => !isDayDone(d));
      case 'today':
        return [dayOfYear];
      default:
        return Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
    }
  }, [dayOfYear, filter, isDayDone]);

  const rows: number[][] = [];
  for (let r = 0; r < Math.ceil(visibleDays.length / COLS); r++) {
    rows.push(
      visibleDays.slice(r * COLS, r * COLS + COLS)
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.head} allowFontScaling>
        Leia a Bíblia em 365 dias
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / TOTAL_DAYS) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressTxt} allowFontScaling>
          {completedCount} de {TOTAL_DAYS} dias concluídos ({percentage}%)
        </Text>
        <Text style={styles.metaTxt} allowFontScaling>
          Meta semanal: {weeklyProgress}/{WEEKLY_GOAL} dias
        </Text>
      </View>
      <View style={styles.filters}>
        <FilterButton title="Todos" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterButton title="Não lidos" active={filter === 'pending'} onPress={() => setFilter('pending')} />
        <FilterButton title="Lidos" active={filter === 'done'} onPress={() => setFilter('done')} />
        <FilterButton title="Hoje" active={filter === 'today'} onPress={() => setFilter('today')} />
      </View>
      <Text style={styles.sub} allowFontScaling>
        Toque no dia para ler e marcar. Dias anteriores permanecem acessíveis.
      </Text>
      {visibleDays.length === 0 ? (
        <Text style={styles.emptyState} allowFontScaling>
          Nenhum dia encontrado para este filtro.
        </Text>
      ) : null}
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

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.filterBtn, active && styles.filterBtnActive]} onPress={onPress}>
      <Text style={[styles.filterTxt, active && styles.filterTxtActive]} allowFontScaling>
        {title}
      </Text>
    </Pressable>
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
  metaTxt: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: palette.textSecondary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
  },
  filterBtnActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.text,
  },
  filterTxtActive: {
    color: palette.surface,
  },
  sub: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emptyState: {
    fontSize: 14,
    color: palette.textSecondary,
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
