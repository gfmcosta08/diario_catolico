import { HomeCard } from '@/components/ui/HomeCard';

export const options = { title: 'Início' };
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { configured, session } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greet} allowFontScaling>
        Paz e bem
      </Text>
      <Text style={styles.lead} allowFontScaling>
        Escolha uma prática para hoje. Seu progresso é salvo na nuvem quando você
        está autenticado.
      </Text>
      {!configured ? (
        <Text style={styles.banner} allowFontScaling>
          Modo local: configure o Supabase para login e sincronização entre
          dispositivos.
        </Text>
      ) : null}
      {configured && !session ? (
        <Link href="/(auth)/login" style={styles.linkBanner}>
          <Text style={styles.linkTxt} allowFontScaling>
            Entrar para sincronizar o progresso
          </Text>
        </Link>
      ) : null}
      <View style={styles.cards}>
        <Link href="/(app)/rosary-daily" asChild>
          <HomeCard
            title="Terço do dia"
            subtitle="Mistérios do dia da semana, passo a passo com checklist."
            icon="circle"
          />
        </Link>
        <Link href="/(app)/rosary-full" asChild>
          <HomeCard
            title="O Rosário"
            subtitle="Quatro terços em sequência — contemplação completa."
            icon="dot-circle-o"
          />
        </Link>
        <Link href="/(app)/bible" asChild>
          <HomeCard
            title="Leitura bíblica anual"
            subtitle="Plano de 365 dias com referências e progresso."
            icon="book"
          />
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    backgroundColor: palette.background,
  },
  greet: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  lead: {
    fontSize: 16,
    color: palette.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: palette.accentSoft,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
  linkBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  linkTxt: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  cards: { marginTop: spacing.sm },
});
