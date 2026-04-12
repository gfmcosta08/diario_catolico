import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { AuthBackground } from '@/components/ui/AuthBackground';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setDebugToken(null);
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setDone(true);
    if (result.debugToken) setDebugToken(result.debugToken);
  }

  return (
    <AuthBackground 
      title="Recuperação" 
      subtitle="Vamos enviar um link de acesso para o seu e-mail."
    >
      <View style={styles.formSpace}>
        {!configured ? (
          <Text style={styles.warn} allowFontScaling>
            Configure EXPO_PUBLIC_API_URL para este fluxo funcionar.
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
        
        {error ? (
          <Text style={styles.err} allowFontScaling>
            {error}
          </Text>
        ) : null}
        
        {done ? (
          <Text style={styles.ok} allowFontScaling>
            Se o e-mail existir na base, o pedido de redefinição foi enviado com sucesso.
          </Text>
        ) : null}

        {debugToken ? (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle} allowFontScaling>
              Token de teste (ambiente local)
            </Text>
            <Text selectable style={styles.debugToken} allowFontScaling>
              {debugToken}
            </Text>
            <Link href={`/(auth)/reset-password?token=${encodeURIComponent(debugToken)}`} asChild>
              <AppButton title="Abrir com Token" variant="outline" style={styles.mtSm} />
            </Link>
          </View>
        ) : null}

        <View style={styles.buttonGroup}>
          <AppButton title="Enviar Link" onPress={onSubmit} loading={loading} />

          <Link href="/(auth)/reset-password" asChild>
            <AppButton title="Já tenho um token" variant="ghost" style={styles.mtSm} />
          </Link>
          
          <Link href="/(auth)/login" asChild>
            <AppButton title="Voltar ao início" variant="ghost" style={styles.mtSm} />
          </Link>
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
  warn: {
    backgroundColor: palette.accentSoft,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    color: palette.text,
    fontSize: 14,
    textAlign: 'center',
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
  debugBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.xs,
  },
  debugToken: {
    color: palette.primary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  mtSm: { 
    marginTop: spacing.sm, 
  },
});
