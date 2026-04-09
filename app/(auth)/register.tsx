import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const { signUp, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo(
      'Conta criada. Verifique seu e-mail para confirmar, se a confirmaÃ§Ã£o estiver ativa no servidor de autenticação.'
    );
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
        <Text style={styles.sub} allowFontScaling>
          Crie sua conta com e-mail e senha.
        </Text>
        {!configured ? (
          <Text style={styles.warn} allowFontScaling>
            Configure EXPO_PUBLIC_API_URL para cadastro funcionar.
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
          autoComplete="new-password"
        />
        {error ? (
          <Text style={styles.err} allowFontScaling>
            {error}
          </Text>
        ) : null}
        {info ? (
          <Text style={styles.info} allowFontScaling>
            {info}
          </Text>
        ) : null}
        <AppButton title="Cadastrar" onPress={onSubmit} loading={loading} />
        <Link href="/(auth)/login" asChild>
          <AppButton title="JÃ¡ tenho conta" variant="outline" style={styles.mt} />
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
    paddingTop: spacing.md,
    justifyContent: 'center',
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
  },
  err: { color: palette.error, marginBottom: spacing.md },
  info: { color: palette.success, marginBottom: spacing.md },
  mt: { marginTop: spacing.md },
});

