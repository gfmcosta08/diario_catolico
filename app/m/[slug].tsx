import { AppButton } from '@/components/ui/AppButton';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { buildMinistryInviteShareText } from '@/lib/ministryInvite';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export const options = { title: 'Ministério' };

type MinistryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export default function PublicMinistryPage() {
  const { slug: rawSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const { session, configured } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const ministryQuery = useQuery({
    queryKey: ['ministry-by-slug', slug],
    enabled: !!slug,
    queryFn: async () => (await api.getMinistryBySlug(slug!)) as MinistryRow | null,
  });

  const ministryId = ministryQuery.data?.id;

  const myMembershipQuery = useQuery({
    queryKey: ['my-membership', ministryId, session?.user.id],
    enabled: !!ministryId && !!session?.user.id && configured,
    queryFn: async () => api.getMembership(ministryId!),
  });

  const pendingQuery = useQuery({
    queryKey: ['join-pending', ministryId, session?.user.id],
    enabled: !!ministryId && !!session?.user.id && configured && !myMembershipQuery.data,
    queryFn: async () => api.getJoinRequest(ministryId!),
  });

  const isAdmin = useMemo(() => {
    const r = myMembershipQuery.data?.role;
    return r === 'owner' || r === 'sub_admin';
  }, [myMembershipQuery.data?.role]);

  const copyInvite = useCallback(async () => {
    if (!ministryQuery.data?.slug) return;
    const text = buildMinistryInviteShareText(ministryQuery.data.slug);
    await Clipboard.setStringAsync(text);
    setMsg('Link copiado. Envie por WhatsApp, e-mail etc.');
  }, [ministryQuery.data?.slug]);

  const requestJoin = useCallback(async () => {
    if (!session?.user.id || !ministryId) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.createJoinRequest(ministryId);
      queryClient.invalidateQueries({ queryKey: ['join-pending', ministryId, session.user.id] });
      setMsg('Pedido enviado. Aguarde a aprovação do responsável.');
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Erro ao enviar pedido');
    } finally {
      setBusy(false);
    }
  }, [ministryId, queryClient, session?.user.id]);

  if (!slug) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Link inválido.</Text>
      </View>
    );
  }

  if (ministryQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!ministryQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.title} allowFontScaling>
          Ministério não encontrado
        </Text>
      </View>
    );
  }

  const m = ministryQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} allowFontScaling>
        {m.name}
      </Text>
      <Text style={styles.desc} allowFontScaling>
        {m.description || 'Sem descrição ainda.'}
      </Text>

      {isAdmin ? (
        <AppButton title="Enviar convite (copiar link)" onPress={copyInvite} />
      ) : null}

      {!configured || !session ? (
        <View style={styles.box}>
          <Text style={styles.boxLead} allowFontScaling>
            Entre ou crie uma conta para solicitar participação neste ministério.
          </Text>
          <Link href="/(auth)/login" asChild>
            <AppButton title="Entrar" />
          </Link>
          <Link href="/(auth)/register" asChild>
            <AppButton title="Criar conta" variant="outline" style={styles.mtSm} />
          </Link>
        </View>
      ) : myMembershipQuery.data ? (
        <AppButton
          title="Abrir ministério"
          onPress={() => router.push(`/(app)/ministry/${m.id}`)}
        />
      ) : pendingQuery.data?.status === 'pending' ? (
        <Text style={styles.info} allowFontScaling>
          Seu pedido de entrada está pendente de aprovação.
        </Text>
      ) : (
        <AppButton title="Solicitar entrada" onPress={requestJoin} loading={busy} />
      )}

      {msg ? (
        <Text style={styles.info} allowFontScaling>
          {msg}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    backgroundColor: palette.background,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: palette.text, marginBottom: spacing.md },
  desc: { fontSize: 16, color: palette.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
  box: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  boxLead: { fontSize: 15, color: palette.text, marginBottom: spacing.md },
  mtSm: { marginTop: spacing.sm },
  info: { marginTop: spacing.md, fontSize: 15, color: palette.primary, fontWeight: '600' },
});
