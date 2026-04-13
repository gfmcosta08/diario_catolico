import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MinistryRow = {
  role: string;
  ministry: { id: string; slug: string; name: string };
};

type PostRow = {
  id: string;
  ministryId: string;
  authorId: string;
  authorName: string;
  content: string;
  likesCount: number;
  parentId: string | null;
  createdAt: string;
};

const PAGE_SIZE = 20;

function roleLabel(role: string) {
  if (role === 'owner') return 'Dono';
  if (role === 'sub_admin') return 'Sub-admin';
  return 'Membro';
}

function formatPostTime(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommunityTimelineScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ministryId: rawId } = useLocalSearchParams<{ ministryId: string }>();
  const ministryId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { configured, session } = useAuth();

  const [newPostContent, setNewPostContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);

  const ministriesQuery = useQuery({
    queryKey: ['my-ministries', session?.user.id],
    enabled: !!configured && !!session,
    queryFn: async () => (await api.myMinistries()) as MinistryRow[],
  });

  const selectedCommunity = useMemo(() => {
    return (ministriesQuery.data ?? []).find((row) => row.ministry.id === ministryId) ?? null;
  }, [ministriesQuery.data, ministryId]);

  useLayoutEffect(() => {
    const n = selectedCommunity?.ministry.name;
    if (n) navigation.setOptions({ title: n });
  }, [navigation, selectedCommunity?.ministry.name]);

  const postsQuery = useInfiniteQuery({
    queryKey: ['community-posts', ministryId],
    enabled: !!configured && !!session && !!ministryId && !!selectedCommunity,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) =>
      api.getPosts(ministryId!, { cursor: pageParam ?? undefined, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const allPosts = useMemo(() => {
    return (postsQuery.data?.pages ?? []).flatMap((page) => page.items) as PostRow[];
  }, [postsQuery.data]);

  const rootPosts = useMemo(() => allPosts.filter((p) => p.parentId == null), [allPosts]);

  const repliesByParent = useMemo(() => {
    const map: Record<string, PostRow[]> = {};
    for (const post of allPosts) {
      if (!post.parentId) continue;
      if (!map[post.parentId]) map[post.parentId] = [];
      map[post.parentId].push(post);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return map;
  }, [allPosts]);

  const refreshPosts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['community-posts', ministryId] });
    queryClient.invalidateQueries({ queryKey: ['ministry-posts', ministryId] });
  }, [ministryId, queryClient]);

  const handlePost = useCallback(async () => {
    const content = newPostContent.trim();
    if (!content || !ministryId) return;
    setSending(true);
    try {
      await api.createPost(ministryId, { content });
      setNewPostContent('');
      refreshPosts();
    } finally {
      setSending(false);
    }
  }, [ministryId, newPostContent, refreshPosts]);

  const handleReply = useCallback(async () => {
    const content = replyBody.trim();
    if (!content || !replyTo || !ministryId) return;
    setSending(true);
    try {
      await api.createPost(ministryId, { content, parentId: replyTo });
      setReplyBody('');
      setReplyTo(null);
      setExpanded((prev) => ({ ...prev, [replyTo]: true }));
      refreshPosts();
    } finally {
      setSending(false);
    }
  }, [ministryId, refreshPosts, replyBody, replyTo]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!ministryId) return;
      await api.likePost(ministryId, postId);
      refreshPosts();
    },
    [ministryId, refreshPosts]
  );

  if (!configured || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText} allowFontScaling>
          Faça login para acessar as comunidades.
        </Text>
      </View>
    );
  }

  if (ministriesQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!selectedCommunity) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText} allowFontScaling>
          Você não tem acesso a essa comunidade.
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <AppButton title="Voltar para comunidades" onPress={() => router.replace('/(app)/feed')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, spacing.xl),
        paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title} allowFontScaling>
          {selectedCommunity.ministry.name}
        </Text>
        <Text style={styles.subtitle} allowFontScaling>
          Comunidade do ministério · {roleLabel(selectedCommunity.role)}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {(ministriesQuery.data ?? []).map((row) => {
            const active = row.ministry.id === ministryId;
            return (
              <Pressable
                key={row.ministry.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => router.replace(`/(app)/feed/${row.ministry.id}` as any)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]} allowFontScaling>
                  {row.ministry.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.composeCard}>
          <TextInput
            style={styles.textInput}
            placeholder="O que está acontecendo na comunidade?"
            placeholderTextColor={palette.textSecondary}
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
          />
          <View style={styles.composeFooter}>
            <View style={styles.composeActions}>
              <FontAwesome5 name="image" size={18} color={palette.primary} style={{ marginRight: 12 }} />
              <FontAwesome5 name="paperclip" size={18} color={palette.primary} />
            </View>
            <AppButton title="Publicar" onPress={handlePost} loading={sending} />
          </View>
        </View>

        {postsQuery.isLoading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: spacing.lg }} />
        ) : rootPosts.length === 0 ? (
          <Text style={styles.emptyText} allowFontScaling>
            Ainda não há postagens nesta comunidade.
          </Text>
        ) : (
          rootPosts.map((post) => {
            const replies = repliesByParent[post.id] ?? [];
            const open = !!expanded[post.id];
            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{post.authorName?.[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.authorName} allowFontScaling>
                      {post.authorName}
                    </Text>
                    <Text style={styles.postTime} allowFontScaling>
                      {formatPostTime(post.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postContent} allowFontScaling>
                  {post.content}
                </Text>

                <View style={styles.postActions}>
                  <Pressable style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                    <FontAwesome5
                      name="heart"
                      solid={post.likesCount > 0}
                      size={15}
                      color={post.likesCount > 0 ? palette.danger : palette.textSecondary}
                    />
                    <Text style={[styles.actionText, post.likesCount > 0 && { color: palette.danger }]} allowFontScaling>
                      {post.likesCount}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => setReplyTo((curr) => (curr === post.id ? null : post.id))}
                  >
                    <FontAwesome5 name="comment" size={15} color={palette.textSecondary} />
                    <Text style={styles.actionText} allowFontScaling>
                      Responder
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => setExpanded((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                  >
                    <Text style={styles.actionText} allowFontScaling>
                      {open ? 'Ocultar' : `Thread (${replies.length})`}
                    </Text>
                  </Pressable>
                </View>

                {replyTo === post.id ? (
                  <View style={styles.replyComposer}>
                    <AppTextField
                      label="Sua resposta"
                      value={replyBody}
                      onChangeText={setReplyBody}
                      placeholder="Escreva uma resposta..."
                      multiline
                    />
                    <AppButton title="Enviar resposta" onPress={handleReply} loading={sending} />
                  </View>
                ) : null}

                {open
                  ? replies.map((reply) => (
                      <View key={reply.id} style={styles.replyItem}>
                        <Text style={styles.replyMeta} allowFontScaling>
                          {reply.authorName} · {formatPostTime(reply.createdAt)}
                        </Text>
                        <Text style={styles.replyContent} allowFontScaling>
                          {reply.content}
                        </Text>
                      </View>
                    ))
                  : null}
              </View>
            );
          })
        )}

        {postsQuery.hasNextPage ? (
          <View style={{ marginTop: spacing.md }}>
            <AppButton
              title={postsQuery.isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              onPress={() => postsQuery.fetchNextPage()}
              loading={postsQuery.isFetchingNextPage}
              variant="outline"
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background, padding: spacing.lg },
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: palette.primary, fontFamily: typography.fonts.heading },
  subtitle: { marginTop: 4, fontSize: 14, color: palette.textSecondary, fontFamily: typography.fonts.body },
  chipsRow: { marginTop: spacing.md, gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  chipActive: {
    borderColor: palette.primary,
    backgroundColor: `${palette.primary}14`,
  },
  chipText: { color: palette.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: palette.primary },
  composeCard: {
    marginTop: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  textInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    color: palette.text,
    fontSize: 15,
    fontFamily: typography.fonts.body,
  },
  composeFooter: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composeActions: { flexDirection: 'row', alignItems: 'center' },
  postCard: {
    marginTop: spacing.sm,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}18`,
  },
  avatarText: { color: palette.primary, fontWeight: '700', fontSize: 16 },
  postMeta: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '700', color: palette.text },
  postTime: { marginTop: 2, fontSize: 12, color: palette.textSecondary },
  postContent: { marginTop: spacing.sm, fontSize: 15, lineHeight: 22, color: palette.text },
  postActions: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: palette.textSecondary, fontWeight: '600' },
  replyComposer: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.border },
  replyItem: {
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: palette.accentSoft,
  },
  replyMeta: { fontSize: 12, color: palette.textSecondary },
  replyContent: { marginTop: 2, fontSize: 14, color: palette.text },
  emptyText: { marginTop: spacing.lg, fontSize: 14, color: palette.textSecondary, textAlign: 'center' },
});
