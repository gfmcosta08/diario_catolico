import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const initialToken = useMemo(() => {
    if (!params.token) return '';
    return Array.isArray(params.token) ? params.token[0] : params.token;
  }, [params.token]);

  const [token, setToken] = useState(initialToken ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setDone(false);
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPasswordWithToken(token.trim(), password);
      setDone(true);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.sub} allowFontScaling>
        Informe o token e a nova senha para concluir a redefinição.
      </Text>

      <AppTextField label="Token" value={token} onChangeText={setToken} autoCapitalize="none" />
      <AppTextField
        label="Nova senha"
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
      {done ? (
        <Text style={styles.ok} allowFontScaling>
          Senha redefinida com sucesso. Redirecionando para login...
        </Text>
      ) : null}

      <AppButton title="Redefinir senha" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, backgroundColor: palette.background, flexGrow: 1 },
  sub: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  err: { color: palette.error, marginBottom: spacing.md },
  ok: { color: palette.success, marginBottom: spacing.md, lineHeight: 22 },
});
