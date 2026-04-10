import { AppButton } from '@/components/ui/AppButton';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { buildMinistryInviteShareText } from '@/lib/ministryInvite';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  ministryId: string;
  slug: string;
  name: string;
  description: string;
  myRole: string;
};

type JoinReq = { id: string; userId: string; displayName: string | null; email: string };

type MemberRow = { userId: string; role: string; displayName: string | null; email: string };

export function MinistryAboutTab({ ministryId, slug, name, description, myRole }: Props) {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);
  const isAdmin = myRole === 'owner' || myRole === 'sub_admin';
  const isOwner = myRole === 'owner';

  const requestsQuery = useQuery({
    queryKey: ['join-requests', ministryId],
    enabled: isAdmin,
    queryFn: async () => (await api.getJoinRequests(ministryId)) as JoinReq[],
  });

  const membersQuery = useQuery({
    queryKey: ['ministry-members', ministryId],
    queryFn: async () => (await api.getMembers(ministryId)) as MemberRow[],
  });

  const displayName = (row: { displayName: string | null; email: string; userId?: string }) => {
    return row.displayName || row.email || row.userId || 'Usuário';
  };

  const copyInvite = useCallback(async () => {
    await Clipboard.setStringAsync(buildMinistryInviteShareText(slug));
    setMsg('Convite copiado para a área de transferência.');
  }, [slug]);

  const approve = useCallback(
    async (requestId: string) => {
      setMsg(null);
      try {
        await api.approveJoinRequest(ministryId, requestId);
        queryClient.invalidateQueries({ queryKey: ['join-requests', ministryId] });
        queryClient.invalidateQueries({ queryKey: ['ministry-members', ministryId] });
      } catch (error) {
        setMsg(error instanceof Error ? error.message : 'Erro ao aprovar');
      }
    },
    [ministryId, queryClient]
  );

  const reject = useCallback(
    async (requestId: string) => {
      setMsg(null);
      try {
        await api.rejectJoinRequest(ministryId, requestId);
        queryClient.invalidateQueries({ queryKey: ['join-requests', ministryId] });
      } catch (error) {
        setMsg(error instanceof Error ? error.message : 'Erro ao recusar');
      }
    },
    [ministryId, queryClient]
  );

  const setSubAdmin = useCallback(
    async (userId: string) => {
      setMsg(null);
      try {
        await api.promoteSubAdmin(ministryId, userId);
        queryClient.invalidateQueries({ queryKey: ['ministry-members', ministryId] });
      } catch (error) {
        setMsg(error instanceof Error ? error.message : 'Erro ao atualizar papel');
      }
    },
    [ministryId, queryClient]
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title} allowFontScaling>
        {name}
      </Text>
      <Text style={styles.desc} allowFontScaling>
        {description || 'Sem descrição.'}
      </Text>

      {isAdmin ? <AppButton title="Enviar convite (copiar link)" onPress={copyInvite} /> : null}

      {msg ? (
        <Text style={styles.msg} allowFontScaling>
          {msg}
        </Text>
      ) : null}

      {isAdmin ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} allowFontScaling>
            Pedidos de entrada
          </Text>
          {requestsQuery.isLoading ? (
            <ActivityIndicator color={palette.primary} />
          ) : (requestsQuery.data?.length ?? 0) === 0 ? (
            <Text style={styles.muted} allowFontScaling>
              Nenhum pedido pendente.
            </Text>
          ) : (
            requestsQuery.data?.map((r) => (
              <View key={r.id} style={styles.row}>
                <Text style={styles.rowText} allowFontScaling>
                  {displayName(r)}
                </Text>
                <View style={styles.rowActions}>
                  <Pressable onPress={() => approve(r.id)} style={styles.smallBtn}>
                    <Text style={styles.smallBtnTxt} allowFontScaling>
                      Aceitar
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => reject(r.id)} style={styles.smallBtnOutline}>
                    <Text style={styles.smallBtnOutlineTxt} allowFontScaling>
                      Recusar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle} allowFontScaling>
          Membros
        </Text>
        {membersQuery.isLoading ? (
          <ActivityIndicator color={palette.primary} />
        ) : (
          membersQuery.data?.map((mem) => (
            <View key={mem.userId} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText} allowFontScaling>
                  {displayName(mem)}
                </Text>
                <Text style={styles.muted} allowFontScaling>
                  {mem.role === 'owner'
                    ? 'Dono'
                    : mem.role === 'sub_admin'
                      ? 'Sub-admin'
                      : 'Membro'}
                </Text>
              </View>
              {isOwner && mem.role === 'member' ? (
                <Pressable onPress={() => setSubAdmin(mem.userId)} style={styles.smallBtnOutline}>
                  <Text style={styles.smallBtnOutlineTxt} allowFontScaling>
                    Tornar sub-admin
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: spacing.xl * 2 },
  title: { fontSize: 22, fontWeight: '800', color: palette.text, marginBottom: spacing.sm },
  desc: { fontSize: 16, color: palette.textSecondary, lineHeight: 24, marginBottom: spacing.md },
  msg: { marginTop: spacing.sm, color: palette.primary, fontWeight: '600' },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: palette.text, marginBottom: spacing.sm },
  muted: { fontSize: 14, color: palette.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
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
