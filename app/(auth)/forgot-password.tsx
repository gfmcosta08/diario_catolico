import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

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
        Enviaremos um link de redefinição para o e-mail cadastrado.
      </Text>
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
          Se o e-mail existir na base, o pedido de redefinição foi criado.
        </Text>
      ) : null}

      {debugToken ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle} allowFontScaling>
            Token de teste (ambiente não produção)
          </Text>
          <Text selectable style={styles.debugToken} allowFontScaling>
            {debugToken}
          </Text>
          <Link href={`/(auth)/reset-password?token=${encodeURIComponent(debugToken)}`} asChild>
            <AppButton title="Abrir redefinição com token" variant="outline" style={styles.mtSm} />
          </Link>
        </View>
      ) : null}

      <AppButton title="Enviar link" onPress={onSubmit} loading={loading} />

      <Link href="/(auth)/reset-password" asChild>
        <AppButton title="Já tenho token" variant="ghost" style={styles.mtSm} />
      </Link>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.background },
  scrollView: { flex: 1 },
  scroll: { padding: spacing.lg, backgroundColor: palette.background, flexGrow: 1, justifyContent: 'center' },
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
  ok: { color: palette.success, marginBottom: spacing.md, lineHeight: 22 },
  debugBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.surface,
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
  mtSm: { marginTop: spacing.sm },
});
