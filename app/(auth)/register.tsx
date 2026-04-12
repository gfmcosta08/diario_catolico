import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { AuthBackground } from '@/components/ui/AuthBackground';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
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
      router.replace('/(app)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    router.push('/(auth)/login');
  }

  return (
    <AuthBackground 
      title="Criar Conta" 
      subtitle="Inicie sua jornada litúrgica em um ambiente guiado."
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
          autoComplete="new-password"
        />
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <View style={styles.buttonGroup}>
          <AppButton title="Cadastrar" onPress={onSubmit} loading={loading} />
          
          <AppButton 
            title="Já tenho conta - Fazer Login" 
            variant="outline" 
            style={styles.loginBtn} 
            onPress={goToLogin}
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
  loginBtn: {
    marginTop: spacing.sm,
  },
});
