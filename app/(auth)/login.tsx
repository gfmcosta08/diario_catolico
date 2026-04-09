import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LoginScreen() {
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} allowFontScaling>
          Leia a BÃ­blia em 365 dias
        </Text>
        <Text style={styles.sub} allowFontScaling>
          Entre para sincronizar seu progresso espiritual.
        </Text>
        {!configured ? (
          <Text style={styles.warn} allowFontScaling>
            Defina EXPO_PUBLIC_API_URL para
            autenticaÃ§Ã£o na nuvem. Sem isso, use o fluxo de demonstraÃ§Ã£o pelo
            redirecionamento automÃ¡tico na primeira tela.
          </Text>
        ) : null}
        <AppTextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <AppTextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showPasswordToggle
          autoComplete="password"
        />
        {error ? (
          <Text style={styles.err} allowFontScaling>
            {error}
          </Text>
        ) : null}
        <AppButton title="Entrar" onPress={onSubmit} loading={loading} />
        <Link href="/(auth)/register" asChild>
          <AppButton title="Criar nova conta" variant="outline" style={styles.mt} />
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <AppButton title="Esqueci minha senha" variant="ghost" style={styles.mtSm} />
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.background },
  scrollView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  warn: {
    backgroundColor: palette.accentSoft,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
  err: { color: palette.error, marginBottom: spacing.md },
  mt: { marginTop: spacing.md },
  mtSm: { marginTop: spacing.sm },
});

