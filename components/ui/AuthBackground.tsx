import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radii, spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthBackground({ children, title, subtitle }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Camadas vitrais arquitetônicas traseiras */}
      <LinearGradient
        colors={['#102A43', '#1E4A78', '#3A6EA5', '#102A43']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, styles.geometricOverlay]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, spacing.xl),
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoSquare}>
              <Text style={styles.logoBrandText}>☧</Text>
            </View>
            <Text style={styles.title} allowFontScaling>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} allowFontScaling>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Painel Vitral Frontal (Card) */}
          <View style={styles.card}>
            {children}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#102A43',
  },
  geometricOverlay: {
    backgroundColor: palette.glassWhite,
    opacity: 0.3,
    // Cria a ilusão de feixes ou blocos rígidos
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: '10%',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl, // Maior respiro lateral
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoSquare: {
    width: 64,
    height: 64,
    borderRadius: 0, // Brutalista
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2, // Fio forte nas bordas
    borderColor: palette.accent, // Dourado
  },
  logoBrandText: {
    fontSize: 32,
    color: palette.accent,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 1, // Espaçamento maior e mais severo
    textTransform: 'uppercase', // Mais institucional
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)', // Vidro branco sólido
    borderRadius: radii.md, // O radii agora é globalmente 0
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2, // Uma borda dupla fina
    borderColor: 'rgba(255, 255, 255, 1)',
    borderTopColor: palette.accent, // Aresta refletiva superior dourada
  },
});
