import { AppButton } from '@/components/ui/AppButton';
import { getReadingPlanDay } from '@/data/readingPlan';
import { useBibleProgressMap } from '@/hooks/useBibleProgress';
import { palette, spacing } from '@/constants/theme';
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
        <Text allowFontScaling>Carregando…</Text>
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
          • {line}
        </Text>
      ))}
      <Text style={styles.note} allowFontScaling>
        Substitua estas referências pelo seu roteiro NVT 365 / Ave-Maria licenciado.
        O campo de texto integral abaixo fica vazio até você importar conteúdo
        autorizado.
      </Text>
      <View style={styles.bodyBox}>
        {plan.body ? (
          <Text style={styles.body} allowFontScaling>
            {plan.body}
          </Text>
        ) : (
          <Text style={styles.placeholder} allowFontScaling>
            Nenhum texto embutido para este dia. Adicione via JSON/CMS quando tiver
            direitos de uso.
          </Text>
        )}
      </View>
      <AppButton
        title={done ? 'Desmarcar leitura' : 'Leitura concluída'}
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
