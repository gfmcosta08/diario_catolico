import { HomeCard } from '@/components/ui/HomeCard';

export const options = { title: 'InÃ­cio' };
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
        Escolha uma prÃ¡tica para hoje. Seu progresso Ã© salvo na nuvem quando vocÃª
        estÃ¡ autenticado.
      </Text>
      {!configured ? (
        <Text style={styles.banner} allowFontScaling>
          Modo local: configure o Supabase para login e sincronizaÃ§Ã£o entre
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
            title="TerÃ§o do dia"
            subtitle="MistÃ©rios do dia da semana, passo a passo com checklist."
            icon="circle"
          />
        </Link>
        <Link href="/(app)/rosary-full" asChild>
          <HomeCard
            title="O RosÃ¡rio"
            subtitle="Quatro terÃ§os em sequÃªncia â€” contemplaÃ§Ã£o completa."
            icon="dot-circle-o"
          />
        </Link>
        <Link href="/(app)/bible" asChild>
          <HomeCard
            title="Leia a BÃ­blia em 365 dias"
            subtitle="Plano de 365 dias com referÃªncias e progresso."
            icon="book"
          />
        </Link>
        {configured && session ? (
          <Link href="/(app)/settings" asChild>
            <HomeCard
              title="ConfiguraÃ§Ãµes e ministÃ©rios"
              subtitle="Seu ID, perfil, criar ministÃ©rio e convites."
              icon="users"
            />
          </Link>
        ) : null}
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

