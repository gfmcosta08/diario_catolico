import { CreateMinistryModal } from '@/components/ministry/CreateMinistryModal';
import { AppButton } from '@/components/ui/AppButton';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

const createMinistryButtonLabelStyle: TextStyle = {
  textTransform: 'none',
  letterSpacing: 0.3,
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const options = { title: 'Ministérios', headerShown: false };

export default function MinistriesScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const uid = session?.user.id;

  const [myMins, setMyMins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [slug, setSlug] = useState('');
  const [searching, setSearching] = useState(false);

  const refreshMyMinistries = useCallback(async () => {
    if (!configured || !session) {
      setMyMins([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchMins = await api.myMinistries();
      setMyMins(fetchMins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [configured, session]);

  useEffect(() => {
    refreshMyMinistries();
  }, [refreshMyMinistries]);

  const handleJoin = async () => {
    if (!slug.trim()) return;
    setSearching(true);
    try {
      const target = await api.getMinistryBySlug(slug.trim().toLowerCase());
      if (!target) {
        alert("Ministério não encontrado com este código.");
        return;
      }
      await api.createJoinRequest(target.id);
      alert("Pedido enviado! Aguarde o líder aprovar.");
      setSlug('');
    } catch(err: any) {
      alert(err.message || 'Erro ao buscar ministério.');
    } finally {
      setSearching(false);
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
        <Text style={styles.pageTitle}>Ministérios</Text>
        <Text style={styles.pageSubtitle}>Comunidades onde você serve e interage</Text>

        {configured && session && uid ? (
          <>
            <View style={styles.createMinistryWrap}>
              <AppButton
                title="Criar Ministério"
                onPress={() => setCreateModalOpen(true)}
                textStyle={createMinistryButtonLabelStyle}
              />
            </View>
            <CreateMinistryModal
              visible={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              userId={uid}
              queryClient={queryClient}
              onCreated={(id) => {
                router.push(`/(app)/ministry/${id}` as any);
                void refreshMyMinistries();
              }}
            />
          </>
        ) : null}

        <View style={styles.joinCard}>
          <Text style={styles.joinTitle}>Entrar em um Ministério</Text>
          <Text style={styles.joinDesc}>Digite o código exclusivo (ex: pascom-matriz) fornecido pelo seu líder.</Text>
          <View style={styles.joinForm}>
            <TextInput
              style={styles.input}
              placeholder="Código do ministério..."
              value={slug}
              onChangeText={setSlug}
            />
            <Pressable style={styles.joinBtn} onPress={handleJoin} disabled={searching}>
              {searching ? (
                <ActivityIndicator size="small" color={palette.surface} />
              ) : (
                <Text style={styles.joinBtnText}>Enviar Pedido</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Meus Ministérios</Text>

          {loading ? (
            <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 20 }} />
          ) : myMins.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não faz parte de nenhum ministério.</Text>
          ) : (
            myMins.map((m: any) => (
              <Pressable
                key={m.ministry.id}
                style={({ pressed }) => [styles.ministryCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/(app)/ministry/${m.ministry.id}` as any)}
              >
                <View style={styles.iconWrap}>
                  <FontAwesome5 name="users" size={20} color={palette.primary} />
                </View>
                <View style={styles.minInfo}>
                  <Text style={styles.minName}>{m.ministry.name}</Text>
                  <Text style={styles.minRole}>Cargo: {m.role === 'owner' ? 'Dono' : m.role === 'sub_admin' ? 'Líder' : 'Membro'}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color={palette.textSecondary} style={{marginLeft: 'auto'}}/>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 680, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  createMinistryWrap: { marginBottom: spacing.lg },

  joinCard: {
    backgroundColor: palette.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  joinTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 4 },
  joinDesc: { fontSize: 14, color: palette.textSecondary, marginBottom: spacing.lg },
  
  joinForm: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.sm,
    fontSize: 15,
  },
  joinBtn: {
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: palette.surface, fontWeight: '700', fontSize: 14 },

  listSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: spacing.md
  },
  ministryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: `${palette.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  minInfo: {},
  minName: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 2 },
  minRole: { fontSize: 13, color: palette.textSecondary },
  
  emptyText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: 20,
  }
});
