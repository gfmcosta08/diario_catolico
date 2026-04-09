import { AppButton } from '@/components/ui/AppButton';
import { palette, spacing } from '@/constants/theme';
import { getReadingPlanDay } from '@/data/readingPlan';
import { useBibleProgressMap } from '@/hooks/useBibleProgress';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BibleDayScreen() {
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const navigation = useNavigation();
  const dayNum = useMemo(() => {
    const n = parseInt(String(dayParam), 10);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > 365) return 365;
    return n;
  }, [dayParam]);

  const plan = useMemo(() => getReadingPlanDay(dayNum), [dayNum]);
  const { hydrated, isDayDone, setDayDone } = useBibleProgressMap();
  const done = isDayDone(dayNum);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Dia ${dayNum}` });
  }, [dayNum, navigation]);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.refTitle} allowFontScaling>
        Leituras sugeridas
      </Text>
      {plan.references.map((line, i) => (
        <Text key={i} style={styles.refLine} allowFontScaling>
          - {line}
        </Text>
      ))}

      {plan.bodySource === 'licensed' ? (
        <Text style={styles.note} allowFontScaling>
          Texto integral oficial/licenciado carregado para este dia.
        </Text>
      ) : (
        <Text style={styles.warning} allowFontScaling>
          Para garantir fidelidade a Biblia Catolica Apostolica Romana, este app exibe
          texto integral somente de fonte oficial/licenciada.
        </Text>
      )}

      <View style={styles.bodyBox}>
        {plan.body ? (
          <Text style={styles.body} allowFontScaling>
            {plan.body}
          </Text>
        ) : (
          <Text style={styles.placeholder} allowFontScaling>
            Texto integral ainda nao disponivel para este dia. Siga as referencias acima.
          </Text>
        )}
      </View>

      <AppButton
        title={done ? 'Desmarcar leitura' : 'Leitura concluida'}
        variant={done ? 'outline' : 'primary'}
        onPress={() => setDayDone(dayNum, !done)}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: 100,
    backgroundColor: palette.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  refTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.sm,
  },
  refLine: {
    fontSize: 16,
    color: palette.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  note: {
    marginTop: spacing.md,
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  warning: {
    marginTop: spacing.md,
    fontSize: 14,
    color: palette.error,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bodyBox: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
    minHeight: 120,
  },
  body: { fontSize: 17, lineHeight: 28, color: palette.text },
  placeholder: { fontSize: 15, color: palette.textSecondary, fontStyle: 'italic' },
  btn: { marginTop: spacing.sm },
});
