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
    <LinearGradient
      colors={['#3A6EA5', '#1E4A78', '#0D2136']}
      locations={[0, 0.4, 1]}
      style={styles.gradient}
    >
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
            <View style={styles.logoCircle}>
              {/* Fake logo icon for aesthetic purposes */}
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

          <View style={styles.card}>
            {children}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.5)', // Gold accent softly wrapping
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
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
