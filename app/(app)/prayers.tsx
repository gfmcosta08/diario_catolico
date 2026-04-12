import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const options = { title: 'Mural de Oração', headerShown: false };

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    async function load() {
      if (!configured || !session) return;
      try {
        const data = await api.getPrayers();
        setPrayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [configured, session]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const newPrayer = await api.createPrayer(content);
      // O mock rápido previne outro fetch até que deem push
      setPrayers([{...newPrayer, authorName: session?.user?.name || 'Eu'}, ...prayers]);
      setContent('');
    } catch (err) {
      alert("Erro ao enviar pedido de oração.");
    }
  };

  const handlePray = async (id: string) => {
    try {
      const res = await api.prayForPrayer(id);
      setPrayers(prayers.map(p => p.id === id ? { ...p, prayCount: res.prayCount } : p));
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
        <Text style={styles.pageTitle}>Mural de Oração Universal</Text>
        <Text style={styles.pageSubtitle}>Peça oração ou interceda pelos irmãos</Text>

        <View style={styles.composeCard}>
          <Text style={styles.composeLabel}>Novo Pedido de Oração</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Pelo que devemos rezar hoje?"
            placeholderTextColor={palette.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
          />
          <Pressable style={styles.postBtn} onPress={handleSubmit}>
            <FontAwesome5 name="hands-praying" size={16} color={palette.surface} />
            <Text style={styles.postBtnText}>Pedir Oração</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 20 }} />
        ) : prayers.length === 0 ? (
          <Text style={styles.emptyText}>Seja o primeiro a pedir intercessão.</Text>
        ) : (
          prayers.map(req => (
            <View key={req.id} style={styles.prayerCard}>
              <View style={styles.prayerHeader}>
                <Text style={styles.authorName}>{req.authorName}</Text>
                <Text style={styles.postTime}>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
              <Text style={styles.prayerContent}>"{req.content}"</Text>
              
              <View style={styles.footerWrap}>
                <Text style={styles.prayCountText}>
                  {req.prayCount} {req.prayCount === 1 ? 'pessoa rezou' : 'pessoas rezaram'} por isso
                </Text>
                <Pressable style={styles.actionBtn} onPress={() => handlePray(req.id)}>
                  <FontAwesome5 name="hands-praying" size={16} color={palette.primary} />
                  <Text style={styles.actionText}>Eu Rezei</Text>
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
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  composeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    minHeight: 80,
    backgroundColor: `${palette.background}80`,
    borderRadius: radii.sm,
    padding: spacing.md,
    textAlignVertical: 'top',
    fontSize: 15,
    color: palette.text,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.md,
  },
  postBtn: {
    backgroundColor: palette.primary,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.md,
  },
  postBtnText: {
    color: palette.surface,
    fontWeight: '700',
    fontSize: 15,
  },

  prayerCard: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.gold,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width:0, height:2 },
    shadowRadius: 8,
    elevation: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
  },
  postTime: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  prayerContent: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  footerWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayCountText: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${palette.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: 30,
  }
});
