import { palette, spacing } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
  selectedDay: number | null;
  /** chave yyyy-mm-dd -> quantidade de eventos */
  countsByDay: Record<string, number>;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function keyFor(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function MonthCalendar({
  month,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  selectedDay,
  countsByDay,
}: Props) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const label = month.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} style={styles.navBtn} accessibilityRole="button">
          <Text style={styles.navTxt} allowFontScaling>
            ‹
          </Text>
        </Pressable>
        <Text style={styles.monthLabel} allowFontScaling>
          {label}
        </Text>
        <Pressable onPress={onNextMonth} style={styles.navBtn} accessibilityRole="button">
          <Text style={styles.navTxt} allowFontScaling>
            ›
          </Text>
        </Pressable>
      </View>
      <View style={styles.dowRow}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <Text key={d} style={styles.dow} allowFontScaling>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day == null) {
            return <View key={`e-${idx}`} style={styles.cell} />;
          }
          const k = keyFor(y, m, day);
          const n = countsByDay[k] ?? 0;
          const selected = selectedDay === day;
          return (
            <Pressable
              key={k}
              style={[styles.cell, selected && styles.cellSelected]}
              onPress={() => onSelectDay(day)}
              accessibilityRole="button"
              accessibilityLabel={`Dia ${day}`}
            >
              <Text style={[styles.dayNum, selected && styles.dayNumSelected]} allowFontScaling>
                {day}
              </Text>
              {n > 0 ? (
                <View style={styles.dotWrap}>
                  <Text style={styles.dotCount} allowFontScaling>
                    {n > 9 ? '9+' : n}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minWidth: 44 },
  navTxt: { fontSize: 22, color: palette.primary, fontWeight: '700' },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
    textTransform: 'capitalize',
  },
  dowRow: { flexDirection: 'row', marginBottom: spacing.xs },
  dow: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    maxHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  cellSelected: {
    backgroundColor: palette.accentSoft,
    borderRadius: 8,
  },
  dayNum: { fontSize: 15, color: palette.text, fontWeight: '600' },
  dayNumSelected: { color: palette.primary },
  dotWrap: { position: 'absolute', bottom: 2 },
  dotCount: { fontSize: 9, color: palette.primary, fontWeight: '700' },
});
