import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ensureUniqueMinistrySlug } from '@/lib/ministryCreate';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const options = { title: 'Configurações' };

type MemberRow = {
  role: string;
  ministry: { id: string; name: string; slug: string };
};

export default function SettingsScreen() {
  const { session, configured } = useAuth();
  const queryClient = useQueryClient();
  const uid = session?.user.id;

  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileHydrated = useRef(false);

  const profileQuery = useQuery({
    queryKey: ['profile', uid],
    enabled: !!uid && configured,
    queryFn: async () => api.getProfile(),
  });

  const ministriesQuery = useQuery({
    queryKey: ['my-ministries', uid],
    enabled: !!uid && configured,
    queryFn: async () => api.myMinistries() as Promise<MemberRow[]>,
  });

  useEffect(() => {
    if (!profileQuery.isSuccess || profileHydrated.current) return;
    const v = profileQuery.data?.displayName;
    if (v != null) setDisplayName(v);
    profileHydrated.current = true;
  }, [profileQuery.isSuccess, profileQuery.data?.displayName]);

  const copyId = useCallback(async () => {
    if (!uid) return;
    await Clipboard.setStringAsync(uid);
  }, [uid]);

  const saveProfile = useCallback(async () => {
    if (!uid) return;
    setSavingProfile(true);
    setError(null);
    try {
      await api.updateProfile(displayName.trim() || null);
      queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar perfil');
    } finally {
      setSavingProfile(false);
    }
  }, [displayName, queryClient, uid]);

  const createMinistry = useCallback(async () => {
    if (!uid || !name.trim()) {
      setError('Informe o nome do ministério.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const slug = await ensureUniqueMinistrySlug(name.trim());
      const data = await api.createMinistry({
        slug,
        name: name.trim(),
        description: description.trim(),
      });
      setModalOpen(false);
      setName('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['my-ministries', uid] });
      if (data?.id) router.push(`/(app)/ministry/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  }, [description, name, queryClient, uid]);

  if (!configured || !session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lead} allowFontScaling>
          Entre na sua conta para ver o ID, perfil e ministérios.
        </Text>
        <Link href="/(auth)/login" asChild>
          <AppButton title="Entrar" />
        </Link>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle} allowFontScaling>
        Sua conta
      </Text>
      <Text style={styles.label} allowFontScaling>
        ID do usuário
      </Text>
      <Pressable onPress={copyId} style={styles.idBox} accessibilityRole="button">
        <Text style={styles.idText} selectable allowFontScaling>
          {uid}
        </Text>
        <Text style={styles.idHint} allowFontScaling>
          Toque para copiar
        </Text>
      </Pressable>

      <AppTextField label="Nome de exibição" value={displayName} onChangeText={setDisplayName} />
      <AppButton title="Salvar perfil" onPress={saveProfile} loading={savingProfile} />

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Ministérios
      </Text>
      <AppButton title="Criar ministério" onPress={() => setModalOpen(true)} />

      {ministriesQuery.isLoading ? (
        <ActivityIndicator style={styles.mt} color={palette.primary} />
      ) : (
        <View style={styles.list}>
          {ministriesQuery.data?.map((row) => {
            const m = row.ministry;
            if (!m) return null;
            return (
              <Pressable
                key={m.id}
                style={styles.card}
                onPress={() => router.push(`/(app)/ministry/${m.id}`)}
                accessibilityRole="button"
              >
                <Text style={styles.cardTitle} allowFontScaling>
                  {m.name}
                </Text>
                <Text style={styles.cardSub} allowFontScaling>
                  {row.role === 'owner' ? 'Dono' : row.role === 'sub_admin' ? 'Sub-admin' : 'Membro'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {error ? (
        <Text style={styles.err} allowFontScaling>
          {error}
        </Text>
      ) : null}

      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} allowFontScaling>
              Novo ministério
            </Text>
            <AppTextField label="Nome (ex.: Liturgia)" value={name} onChangeText={setName} />
            <AppTextField
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View style={styles.modalRow}>
              <AppButton title="Cancelar" variant="outline" onPress={() => setModalOpen(false)} />
              <AppButton title="Criar" onPress={createMinistry} loading={creating} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    backgroundColor: palette.background,
  },
  lead: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  label: { fontSize: 14, color: palette.textSecondary, marginBottom: spacing.xs },
  idBox: {
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
  },
  idText: { fontSize: 13, color: palette.text },
  idHint: { fontSize: 12, color: palette.primary, marginTop: spacing.xs },
  mt: { marginTop: spacing.lg },
  list: { marginTop: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: palette.text },
  cardSub: { fontSize: 14, color: palette.textSecondary, marginTop: 4 },
  err: { color: palette.error, marginTop: spacing.md },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
