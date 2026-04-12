import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const options = { title: 'Comunidade', headerShown: false };

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeMinistry, setActiveMinistry] = useState<any>(null);

  useEffect(() => {
    async function loadFeed() {
      if (!configured || !session) return;
      try {
        const myMins = await api.myMinistries();
        if (myMins.length > 0) {
          setActiveMinistry(myMins[0].ministry);
          const feed = await api.getPosts(myMins[0].ministry.id);
          setPosts(feed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [configured, session]);

  const handlePost = async () => {
    if (!newPostContent.trim() || !activeMinistry) return;
    try {
      await api.createPost(activeMinistry.id, { content: newPostContent });
      setNewPostContent('');
      const feed = await api.getPosts(activeMinistry.id);
      setPosts(feed);
    } catch (err) {
      alert("Erro ao postar.");
    }
  };

  const handleLike = async (postId: string) => {
    if (!activeMinistry) return;
    try {
      const res = await api.likePost(activeMinistry.id, postId);
      // Atualiza estado local
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: res.likesCount } : p));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.xl),
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          }
        ]}
      >
        <Text style={styles.pageTitle}>Comunidade</Text>
        <Text style={styles.pageSubtitle}>
          {activeMinistry ? `Feed do min. ${activeMinistry.name}` : 'Acesse um ministério primeiro'}
        </Text>

        {activeMinistry && (
          <View style={styles.composeCard}>
            <TextInput
              style={styles.textInput}
              placeholder="O que o Espírito Santo tocou em seu coração?"
              placeholderTextColor={palette.textSecondary}
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
            />
            <View style={styles.composeFooter}>
              <View style={styles.composeActions}>
                <FontAwesome5 name="image" size={20} color={palette.primary} style={{ marginRight: 12 }} />
                <FontAwesome5 name="paperclip" size={20} color={palette.primary} />
              </View>
              <Pressable style={styles.postBtn} onPress={handlePost}>
                <Text style={styles.postBtnText}>Publicar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
           <Text style={styles.emptyText}>Sem postagens recentes no seu feed.</Text>
        ) : (
          posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.authorName[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString('pt-BR')}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <Pressable style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                  <FontAwesome5 name="heart" solid size={16} color={post.likesCount > 0 ? palette.danger : palette.textSecondary} />
                  <Text style={[styles.actionText, post.likesCount > 0 && {color: palette.danger}]}>
                    {post.likesCount || 0}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <FontAwesome5 name="comment" size={16} color={palette.textSecondary} />
                  <Text style={styles.actionText}>Responder</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 680, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  
  composeCard: {
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  textInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: palette.text,
    fontFamily: typography.fonts.body,
    paddingBottom: spacing.sm,
  },
  composeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
  },
  composeActions: {
    flexDirection: 'row',
  },
  postBtn: {
    backgroundColor: palette.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  postBtnText: {
    color: palette.surface,
    fontWeight: '700',
    fontSize: 14,
  },

  postCard: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${palette.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  postMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  postTime: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: 30,
  }
});
