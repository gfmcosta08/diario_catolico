import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  const { signUp } = useAuth();
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
    try {
      const { error: err } = await signUp(email.trim(), password);
      if (err) {
        setError(err.message);
        return;
      }
      setInfo('Conta criada! Faça login para continuar.');
    } catch (e: any) {
      setError(e.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    router.push('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Digite seu e-mail e senha para se cadastrar.</Text>
        
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
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        
        <AppButton title="Cadastrar" onPress={onSubmit} loading={loading} />
        
        <AppButton 
          title="Já tenho conta - Fazer Login" 
          variant="outline" 
          style={styles.loginBtn} 
          onPress={goToLogin}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  error: {
    color: palette.error,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  info: {
    color: palette.success,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  loginBtn: {
    marginTop: spacing.lg,
  },
});
