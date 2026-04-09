import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setError(err.message);
        return;
      }
      router.replace('/(app)');
    } catch (e: any) {
      setError(e.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    router.push('/(auth)/register');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Entre para sincronizar seu progresso espiritual.</Text>
        
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
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <AppButton title="Entrar" onPress={onSubmit} loading={loading} />
        
        <AppButton 
          title="Criar nova conta" 
          variant="outline" 
          style={styles.registerBtn} 
          onPress={goToRegister}
        />
        
        <AppButton 
          title="Esqueci minha senha" 
          variant="ghost" 
          style={styles.forgotBtn} 
          onPress={() => router.push('/(auth)/forgot-password')}
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
  registerBtn: {
    marginTop: spacing.md,
  },
  forgotBtn: {
    marginTop: spacing.sm,
  },
});
