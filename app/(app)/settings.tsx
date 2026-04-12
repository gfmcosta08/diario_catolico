import { CreateMinistryModal } from '@/components/ministry/CreateMinistryModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from 'react-native';

const createMinistryButtonLabelStyle: TextStyle = {
  textTransform: 'none',
  letterSpacing: 0.3,
};

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
  const [modalOpen, setModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
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

  const confirmDeleteMinistry = useCallback(
    async (id: string, mName: string) => {
      const exec = async () => {
        try {
          await api.deleteMinistry(id);
          queryClient.invalidateQueries({ queryKey: ['my-ministries', uid] });
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Erro ao excluir ministério');
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm(`Tem certeza que deseja excluir o ministério "${mName}" permanentemente?`)) {
          exec();
        }
      } else {
        Alert.alert('Excluir Ministério', `Tem certeza que deseja excluir "${mName}"?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: exec },
        ]);
      }
    },
    [queryClient, uid]
  );

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
        Minhas Conquistas
      </Text>
      <View style={styles.badgeGrid}>
        {/* Placeholder temporário até usar o hook do backend, mas acoplado visualmente: */}
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, {backgroundColor: 'rgba(91,44,111,0.1)'}]}>
            <FontAwesome5 name="fire" size={24} color={palette.primary} />
          </View>
          <Text style={styles.badgeTitle}>Iniciante</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, {backgroundColor: 'rgba(212,160,23,0.1)'}]}>
            <FontAwesome5 name="medal" size={24} color={palette.gold} />
          </View>
          <Text style={styles.badgeTitle}>Leitor Fiel</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, {backgroundColor: 'rgba(39,174,96,0.1)'}]}>
            <FontAwesome5 name="hands-helping" size={24} color={palette.success} />
          </View>
          <Text style={styles.badgeTitle}>Intercessor</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Ministérios
      </Text>
      <AppButton
        title="Criar Ministério"
        onPress={() => setModalOpen(true)}
        textStyle={createMinistryButtonLabelStyle}
      />

      {ministriesQuery.isLoading ? (
        <ActivityIndicator style={styles.mt} color={palette.primary} />
      ) : (
        <View style={styles.list}>
          {ministriesQuery.data?.map((row) => {
            const m = row.ministry;
            if (!m) return null;
            return (
              <View key={m.id} style={styles.cardContainer}>
                <Pressable
                  style={styles.card}
                  onPress={() => router.push(`/(app)/ministry/${m.id}`)}
                  accessibilityRole="button"
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} allowFontScaling>
                      {m.name}
                    </Text>
                    <Text style={styles.cardSub} allowFontScaling>
                      {row.role === 'owner' ? 'Dono' : row.role === 'sub_admin' ? 'Sub-admin' : 'Membro'}
                    </Text>
                  </View>
                </Pressable>
                {row.role === 'owner' && (
                  <Pressable onPress={() => confirmDeleteMinistry(m.id, m.name)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnTxt}>Excluir</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}

      {error ? (
        <Text style={styles.err} allowFontScaling>
          {error}
        </Text>
      ) : null}

      {uid ? (
        <CreateMinistryModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={uid}
          queryClient={queryClient}
          onCreated={(id) => router.push(`/(app)/ministry/${id}`)}
        />
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
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteBtn: {
    padding: spacing.md,
    backgroundColor: palette.error + '1A',
    borderRadius: 8,
  },
  deleteBtnTxt: { color: palette.error, fontWeight: '600' },
  err: { color: palette.error, marginTop: spacing.md },
  badgeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
  }
});
