import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Post = {
  id: string;
  ministryId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId: string | null;
  createdAt: string;
};

type Props = {
  ministryId: string;
  userId: string;
  isAdmin?: boolean;
};

export function MinistryForumTab({ ministryId, userId, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const noTranslateProps = Platform.OS === 'web' ? ({ translate: 'no' } as any) : {};

  const postsQuery = useQuery({
    queryKey: ['ministry-posts', ministryId],
    queryFn: async () => (await api.getPosts(ministryId, { limit: 50 })).items as Post[],
  });

  const roots = useMemo(
    () => (postsQuery.data ?? []).filter((p) => p.parentId == null),
    [postsQuery.data]
  );

  const repliesOf = useCallback(
    (parentId: string) => (postsQuery.data ?? []).filter((p) => p.parentId === parentId),
    [postsQuery.data]
  );

  const sendPost = useCallback(async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await api.createPost(ministryId, { content: text, parentId: null });
      setBody('');
      queryClient.invalidateQueries({ queryKey: ['ministry-posts', ministryId] });
    } finally {
      setSending(false);
    }
  }, [body, ministryId, queryClient]);

  const sendReply = useCallback(async () => {
    const text = replyBody.trim();
    if (!text || !replyTo) return;
    setSending(true);
    try {
      await api.createPost(ministryId, { content: text, parentId: replyTo });
      setReplyBody('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['ministry-posts', ministryId] });
    } finally {
      setSending(false);
    }
  }, [ministryId, queryClient, replyBody, replyTo]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }, []);

  const confirmDelete = useCallback(
    (postId: string) => {
      const exec = async () => {
        try {
          await api.deletePost(ministryId, postId);
          queryClient.invalidateQueries({ queryKey: ['ministry-posts', ministryId] });
        } catch (error) {
          console.error(error);
        }
      };
      if (Platform.OS === 'web') {
        if (window.confirm('Excluir esta mensagem?')) exec();
      } else {
        Alert.alert('Excluir', 'Excluir esta mensagem?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: exec },
        ]);
      }
    },
    [ministryId, queryClient]
  );

  if (postsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppTextField
        label="Nova publicação"
        value={body}
        onChangeText={setBody}
        multiline
        placeholder="Escreva algo para o grupo..."
      />
      <AppButton title="Publicar" onPress={sendPost} loading={sending} />

      <FlatList
        style={styles.list}
        data={roots}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty} allowFontScaling>
            Nenhuma publicação ainda.
          </Text>
        }
        renderItem={({ item }) => {
          const open = expanded[item.id];
          const replies = repliesOf(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.meta} allowFontScaling>
                {item.authorName} ·{' '}
                {new Date(item.createdAt).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </Text>
              <Text style={styles.body} allowFontScaling {...noTranslateProps}>
                {item.content}
              </Text>
              <View style={styles.cardActions}>
                <Pressable onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.link} allowFontScaling>
                    {open ? 'Ocultar respostas' : `Respostas (${replies.length})`}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setReplyTo((r) => (r === item.id ? null : item.id));
                  }}
                >
                  <Text style={styles.link} allowFontScaling>
                    Responder
                  </Text>
                </Pressable>
                {isAdmin || item.authorId === userId ? (
                  <Pressable onPress={() => confirmDelete(item.id)}>
                    <Text style={styles.linkDanger} allowFontScaling>
                      Excluir
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {replyTo === item.id ? (
                <View style={styles.replyBox}>
                  <AppTextField label="Sua resposta" value={replyBody} onChangeText={setReplyBody} multiline />
                  <AppButton title="Enviar resposta" onPress={sendReply} loading={sending} />
                </View>
              ) : null}
              {open
                ? replies.map((r) => (
                    <View key={r.id} style={styles.reply}>
                      <Text style={styles.metaSmall} allowFontScaling>
                        {r.authorName} ·{' '}
                        {new Date(r.createdAt).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </Text>
                      <Text style={styles.bodySmall} allowFontScaling {...noTranslateProps}>
                        {r.content}
                      </Text>
                      {isAdmin || r.authorId === userId ? (
                        <Pressable onPress={() => confirmDelete(r.id)} style={{ marginTop: 4 }}>
                          <Text style={styles.linkDangerSmall} allowFontScaling>
                            Excluir
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))
                : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { padding: spacing.lg, alignItems: 'center' },
  list: { flex: 1, marginTop: spacing.md },
  empty: { color: palette.textSecondary, marginTop: spacing.md },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  meta: { fontSize: 13, color: palette.textSecondary, marginBottom: spacing.xs },
  body: { fontSize: 16, color: palette.text, lineHeight: 22 },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  link: { color: palette.primary, fontWeight: '700', fontSize: 14 },
  linkDanger: { color: palette.error, fontWeight: '700', fontSize: 14 },
  replyBox: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.border },
  reply: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: palette.accentSoft,
  },
  metaSmall: { fontSize: 12, color: palette.textSecondary },
  bodySmall: { fontSize: 15, color: palette.text, marginTop: 4 },
  linkDangerSmall: { color: palette.error, fontWeight: '700', fontSize: 13 },
});
