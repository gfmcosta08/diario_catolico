import { HomeCard } from '@/components/ui/HomeCard';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const options = { title: 'Início', headerShown: false };

export default function HomeScreen() {
  const { configured, session } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#3A6EA5', '#1E4A78', '#0D2136']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.xl),
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.greet} allowFontScaling>
            Paz e bem
          </Text>
          <Text style={styles.lead} allowFontScaling>
            Escolha uma prática para hoje. Dê um passo em sua jornada diária com Cristo.
          </Text>
        </View>

        {!configured ? (
          <Text style={styles.banner} allowFontScaling>
            Aviso: O app está rodando localmente sem sincronização habilitada.
          </Text>
        ) : null}
        
        {configured && !session ? (
          <Link href="/(auth)/login" asChild>
            <View style={styles.linkBanner}>
              <Text style={styles.linkTxt} allowFontScaling>
                Acessar minha conta para salvar avanços
              </Text>
            </View>
          </Link>
        ) : null}
        
        <View style={styles.cards}>
          <Link href="/(app)/rosary-player-daily" asChild>
            <HomeCard
              title="Terço Mariano"
              subtitle="Oração imersiva no conjunto do dia (5 mistérios)."
              icon="circle"
            />
          </Link>
          <Link href="/(app)/rosary-player-full" asChild>
            <HomeCard
              title="Santo Rosário"
              subtitle="Contemplação profunda em sequência (20 mistérios)."
              icon="dot-circle-o"
            />
          </Link>
          <Link href="/(app)/rosary-daily" asChild>
            <HomeCard
              title="Rosário (Lista)"
              subtitle="Layout simplificado para marcação com checklist."
              icon="list"
            />
          </Link>
          <Link href="/(app)/bible" asChild>
            <HomeCard
              title="A Bíblia em 365 Dias"
              subtitle="Projeto de leitura unificada da Palavra com progresso."
              icon="book"
            />
          </Link>
          {configured && session ? (
            <Link href="/(app)/settings" asChild>
              <HomeCard
                title="Sincronização e Ajustes"
                subtitle="Gerenciamento de perfil, fóruns e ministérios."
                icon="user"
              />
            </Link>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2136',
  },
  container: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  greet: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  lead: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
  },
  banner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  linkBanner: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: palette.accent,
    borderRadius: 8,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  linkTxt: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cards: { 
    marginTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
