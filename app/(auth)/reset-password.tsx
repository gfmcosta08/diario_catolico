import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { AuthBackground } from '@/components/ui/AuthBackground';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    <AuthBackground 
      title="Nova Senha" 
      subtitle="Defina sua nova credencial de acesso seguro."
    >
      <View style={styles.formSpace}>
        <AppTextField label="Token Numérico" value={token} onChangeText={setToken} autoCapitalize="none" />
        
        <AppTextField
          label="Nova Senha"
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
            Senha redefinida com sucesso. Retornando ao início...
          </Text>
        ) : null}

        <View style={styles.buttonGroup}>
          <AppButton title="Confirmar Alteração" onPress={onSubmit} loading={loading} />
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  formSpace: {
    paddingTop: spacing.sm,
  },
  buttonGroup: {
    marginTop: spacing.md,
  },
  err: { 
    color: palette.error, 
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ok: { 
    color: palette.success, 
    marginBottom: spacing.md, 
    lineHeight: 22,
    textAlign: 'center',
  },
});
