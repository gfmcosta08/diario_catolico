import { palette, radii, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const options = { title: 'Pedidos pendentes', headerShown: false };

type JoinReq = { id: string; userId: string; displayName: string | null; email: string };

type MinistryBlock = { ministryId: string; ministryName: string; requests: JoinReq[] };

function displayName(row: JoinReq) {
  return row.displayName || row.email || row.userId || 'Usuário';
}

export default function MinistryPedidosScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  const queryClient = useQueryClient();
  const uid = session?.user?.id;

  const pendingQuery = useQuery({
    queryKey: ['my-pending-join-requests'],
    enabled: !!uid && !!configured,
    queryFn: async () => (await api.getMyPendingJoinRequestsAcrossMinistries()) as MinistryBlock[],
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['my-pending-join-requests'] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: async ({ ministryId, requestId }: { ministryId: string; requestId: string }) => {
      await api.approveJoinRequest(ministryId, requestId);
    },
    onSuccess: (_, { ministryId }) => {
      queryClient.invalidateQueries({ queryKey: ['join-requests', ministryId] });
      queryClient.invalidateQueries({ queryKey: ['ministry-members', ministryId] });
      invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ministryId, requestId }: { ministryId: string; requestId: string }) => {
      await api.rejectJoinRequest(ministryId, requestId);
    },
    onSuccess: (_, { ministryId }) => {
      queryClient.invalidateQueries({ queryKey: ['join-requests', ministryId] });
      invalidate();
    },
  });

  if (!configured || !session) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.lead} allowFontScaling>
          Entre na sua conta para ver pedidos pendentes dos ministérios que administras.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnTxt}>Entrar</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.xl),
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          },
        ]}
      >
        <Text style={styles.pageTitle} allowFontScaling>
          Pedidos pendentes
        </Text>
        <Text style={styles.pageSubtitle} allowFontScaling>
          Pedidos para entrar nos ministérios em que és dono ou sub-admin
        </Text>

        {pendingQuery.isLoading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: spacing.xl }} />
        ) : pendingQuery.isError ? (
          <Text style={styles.err} allowFontScaling>
            {pendingQuery.error instanceof Error ? pendingQuery.error.message : 'Erro ao carregar.'}
          </Text>
        ) : (pendingQuery.data?.length ?? 0) === 0 ? (
          <Text style={styles.empty} allowFontScaling>
            Não há pedidos pendentes nos ministérios que administras.
          </Text>
        ) : (
          pendingQuery.data?.map((block) => (
            <View key={block.ministryId} style={styles.block}>
              <Text style={styles.blockTitle} allowFontScaling>
                {block.ministryName}
              </Text>
              {block.requests.map((r) => (
                <View key={r.id} style={styles.row}>
                  <Text style={styles.rowText} allowFontScaling>
                    {displayName(r)}
                  </Text>
                  <View style={styles.rowActions}>
                    <Pressable
                      onPress={() => approveMutation.mutate({ ministryId: block.ministryId, requestId: r.id })}
                      style={styles.smallBtn}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <Text style={styles.smallBtnTxt} allowFontScaling>
                        Aceitar
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => rejectMutation.mutate({ ministryId: block.ministryId, requestId: r.id })}
                      style={styles.smallBtnOutline}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <Text style={styles.smallBtnOutlineTxt} allowFontScaling>
                        Recusar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  container: { paddingHorizontal: spacing.xl, maxWidth: 680, alignSelf: 'center', width: '100%' },
  lead: { fontSize: 16, color: palette.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  primaryBtn: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
  },
  primaryBtnTxt: { color: palette.surface, fontWeight: '700', fontSize: 16 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 4,
    fontFamily: typography.fonts.heading,
  },
  pageSubtitle: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.xl,
    fontFamily: typography.fonts.body,
  },
  empty: {
    fontSize: 16,
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  err: { color: palette.error, marginTop: spacing.md },
  block: {
    marginBottom: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: spacing.sm,
  },
  rowText: { fontSize: 16, color: palette.text, flex: 1 },
  rowActions: { flexDirection: 'row', gap: spacing.xs },
  smallBtn: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnTxt: { color: palette.surface, fontWeight: '600', fontSize: 13 },
  smallBtnOutline: {
    borderWidth: 1,
    borderColor: palette.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnOutlineTxt: { color: palette.primary, fontWeight: '600', fontSize: 13 },
});
