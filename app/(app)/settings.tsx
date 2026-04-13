import { CreateMinistryModal } from '@/components/ministry/CreateMinistryModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api, type ProfileParishInput } from '@/lib/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

export const options = { title: 'Configuracoes' };

type MemberRow = {
  role: string;
  ministry: { id: string; name: string; slug: string };
};

type ParishDraft = {
  localId: string;
  name: string;
  city: string;
  state: string;
};

function makeParish(localId: string): ParishDraft {
  return { localId, name: '', city: '', state: '' };
}

function normalizeParishes(parishes: ParishDraft[]): ProfileParishInput[] {
  return parishes
    .map((p) => ({
      name: p.name.trim(),
      city: p.city.trim(),
      state: p.state.trim().toUpperCase(),
    }))
    .filter((p) => p.name && p.city && p.state.length === 2);
}

export default function SettingsScreen() {
  const { session, configured } = useAuth();
  const queryClient = useQueryClient();
  const uid = session?.user.id;

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [parishes, setParishes] = useState<ParishDraft[]>([makeParish('p-1')]);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameHint, setUsernameHint] = useState<string | null>(null);
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
    const p = profileQuery.data;
    setDisplayName(p.displayName ?? '');
    setUsername(p.username ?? '');
    setPhone(p.phone ?? '');
    setAddress(p.address ?? '');
    if (p.parishes.length > 0) {
      setParishes(
        p.parishes.map((row, idx) => ({
          localId: row.id || `p-${idx + 1}`,
          name: row.name,
          city: row.city,
          state: row.state,
        }))
      );
    }
    profileHydrated.current = true;
  }, [profileQuery.isSuccess, profileQuery.data]);

  const copyId = useCallback(async () => {
    if (!uid) return;
    await Clipboard.setStringAsync(uid);
    setUsernameHint('CatholicID copiado.');
  }, [uid]);

  const addParish = useCallback(() => {
    setParishes((prev) => [...prev, makeParish(`p-${Date.now()}-${prev.length}`)]);
  }, []);

  const removeParish = useCallback((localId: string) => {
    setParishes((prev) => {
      const next = prev.filter((p) => p.localId !== localId);
      return next.length > 0 ? next : [makeParish(`p-${Date.now()}`)];
    });
  }, []);

  const updateParish = useCallback((localId: string, patch: Partial<ParishDraft>) => {
    setParishes((prev) => prev.map((p) => (p.localId === localId ? { ...p, ...patch } : p)));
  }, []);

  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);

  const checkUsername = useCallback(async () => {
    if (!normalizedUsername) {
      setUsernameHint('Informe um username para validar.');
      return;
    }

    setCheckingUsername(true);
    setUsernameHint(null);
    try {
      const result = await api.checkUsernameAvailability(normalizedUsername);
      setUsernameHint(result.available ? 'Username disponivel.' : 'Username ja em uso.');
    } catch (e) {
      setUsernameHint(e instanceof Error ? e.message : 'Nao foi possivel validar username.');
    } finally {
      setCheckingUsername(false);
    }
  }, [normalizedUsername]);

  const saveProfile = useCallback(async () => {
    if (!uid) return;
    setSavingProfile(true);
    setError(null);

    try {
      const payload = {
        displayName: displayName.trim() || null,
        username: normalizedUsername || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        parishes: normalizeParishes(parishes),
      };

      await api.updateProfile(payload);
      setUsernameHint('Perfil salvo com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar perfil');
    } finally {
      setSavingProfile(false);
    }
  }, [uid, displayName, normalizedUsername, phone, address, parishes, queryClient]);

  if (!configured || !session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lead} allowFontScaling>
          Entre na sua conta para ver o perfil completo e seus ministerios.
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
        Identidade
      </Text>
      <Text style={styles.label} allowFontScaling>
        CatholicID
      </Text>
      <Pressable onPress={copyId} style={styles.idBox} accessibilityRole="button">
        <Text style={styles.idText} selectable allowFontScaling>
          {uid}
        </Text>
        <Text style={styles.idHint} allowFontScaling>
          Toque para copiar
        </Text>
      </Pressable>

      <AppTextField
        label="Nome de exibicao"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Nome que aparece na home e nos ministerios"
      />

      <View style={styles.usernameRow}>
        <View style={styles.usernameFieldWrap}>
          <AppTextField
            label="Username"
            value={username}
            onChangeText={(v) => setUsername(v.toLowerCase())}
            placeholder="ex: joao.silva"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.usernameButtonWrap}>
          <AppButton title="Validar" onPress={checkUsername} loading={checkingUsername} variant="outline" />
        </View>
      </View>

      <Text style={styles.helpText} allowFontScaling>
        O nome de exibicao e o nome publico no app. Username e unico.
      </Text>

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Contato
      </Text>
      <AppTextField label="E-mail" value={session.user.email} editable={false} />
      <AppTextField
        label="Telefone"
        value={phone}
        onChangeText={setPhone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
      />
      <AppTextField
        label="Endereco"
        value={address}
        onChangeText={setAddress}
        placeholder="Rua, numero, bairro, cidade"
      />

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Paroquias
      </Text>
      <Text style={styles.helpText} allowFontScaling>
        Adicione as paroquias onde voce serve (nome + cidade/UF).
      </Text>
      <View style={styles.list}>
        {parishes.map((p, idx) => (
          <View key={p.localId} style={styles.parishCard}>
            <Text style={styles.parishTitle} allowFontScaling>
              Paroquia {idx + 1}
            </Text>
            <AppTextField
              label="Nome da paroquia"
              value={p.name}
              onChangeText={(v) => updateParish(p.localId, { name: v })}
            />
            <AppTextField
              label="Cidade"
              value={p.city}
              onChangeText={(v) => updateParish(p.localId, { city: v })}
            />
            <AppTextField
              label="UF"
              value={p.state}
              onChangeText={(v) => updateParish(p.localId, { state: v.toUpperCase().slice(0, 2) })}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={2}
            />
            <AppButton title="Remover paroquia" onPress={() => removeParish(p.localId)} variant="ghost" />
          </View>
        ))}
      </View>
      <AppButton title="+ Adicionar paroquia" onPress={addParish} variant="outline" />

      <View style={styles.mt}>
        <AppButton title="Salvar perfil" onPress={saveProfile} loading={savingProfile} />
      </View>

      {usernameHint ? (
        <Text style={styles.hint} allowFontScaling>
          {usernameHint}
        </Text>
      ) : null}

      {error ? (
        <Text style={styles.err} allowFontScaling>
          {error}
        </Text>
      ) : null}

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Minhas Conquistas
      </Text>
      <View style={styles.badgeGrid}>
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, { backgroundColor: 'rgba(91,44,111,0.1)' }]}>
            <FontAwesome5 name="fire" size={24} color={palette.primary} />
          </View>
          <Text style={styles.badgeTitle}>Iniciante</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, { backgroundColor: 'rgba(212,160,23,0.1)' }]}>
            <FontAwesome5 name="medal" size={24} color={palette.gold} />
          </View>
          <Text style={styles.badgeTitle}>Leitor Fiel</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={[styles.badgeIcon, { backgroundColor: 'rgba(39,174,96,0.1)' }]}>
            <FontAwesome5 name="hands-helping" size={24} color={palette.success} />
          </View>
          <Text style={styles.badgeTitle}>Intercessor</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, styles.mt]} allowFontScaling>
        Ministerios
      </Text>
      <AppButton
        title="Criar Ministerio"
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
              </View>
            );
          })}
        </View>
      )}

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
  helpText: { fontSize: 13, color: palette.textSecondary, marginBottom: spacing.sm },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  usernameFieldWrap: { flex: 1 },
  usernameButtonWrap: { width: 120, marginBottom: 20 },
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
  parishCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: palette.surface,
  },
  parishTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  hint: { color: palette.primary, marginTop: spacing.md },
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
  },
});
