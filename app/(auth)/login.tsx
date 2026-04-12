import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { AuthBackground } from '@/components/ui/AuthBackground';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

  function goToForgot() {
    router.push('/(auth)/forgot-password');
  }

  return (
    <AuthBackground 
      title="Entrar" 
      subtitle="Continue sua jornada de sincronização espiritual diária."
    >
      <View style={styles.formSpace}>
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

        <View style={styles.buttonGroup}>
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
            onPress={goToForgot}
          />
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
  error: {
    color: palette.error,
    marginBottom: spacing.md,
    fontSize: 14,
    textAlign: 'center',
  },
  registerBtn: {
    marginTop: spacing.md,
  },
  forgotBtn: {
    marginTop: spacing.sm,
  },
});
