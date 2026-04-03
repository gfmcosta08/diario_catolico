import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { useAuth } from '@/context/AuthContext';
import { palette, spacing } from '@/constants/theme';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function ForgotPasswordScreen() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sub} allowFontScaling>
        Enviaremos um link de redefinição para o e-mail cadastrado. Verifique também
        a pasta de spam.
      </Text>
      {!configured ? (
        <Text style={styles.warn} allowFontScaling>
          Configure o Supabase para este fluxo funcionar.
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
          Se o e-mail existir na base, você receberá as instruções em instantes.
        </Text>
      ) : null}
      <AppButton title="Enviar link" onPress={onSubmit} loading={loading} />
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
});
