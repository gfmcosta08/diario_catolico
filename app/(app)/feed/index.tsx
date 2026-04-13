import { AppButton } from '@/components/ui/AppButton';
import { palette, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const options = { title: 'Comunidade', headerShown: false };

type MinistryRow = {
  role: string;
  ministry: { id: string; slug: string; name: string };
};

function roleLabel(role: string) {
  if (role === 'owner') return 'Dono';
  if (role === 'sub_admin') return 'Sub-admin';
  return 'Membro';
}

export default function CommunitySelectionScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();

  const ministriesQuery = useQuery({
    queryKey: ['my-ministries', session?.user.id],
    enabled: !!configured && !!session,
    queryFn: async () => (await api.myMinistries()) as MinistryRow[],
  });

  if (!configured || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle} allowFontScaling>
          Faca login para acessar as comunidades.
        </Text>
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
          Comunidade
        </Text>
        <Text style={styles.subtitle} allowFontScaling>
          Escolha qual comunidade (ministerio) voce quer entrar.
        </Text>

        {ministriesQuery.isLoading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: spacing.lg }} />
        ) : (ministriesQuery.data?.length ?? 0) === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText} allowFontScaling>
              Voce ainda nao participa de nenhum ministerio.
            </Text>
            <AppButton title="Ver ministerios" onPress={() => router.push('/(app)/ministries')} />
          </View>
        ) : (
          <View style={styles.list}>
            {ministriesQuery.data?.map((row) => (
              <Pressable
                key={row.ministry.id}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => router.push(`/(app)/feed/${row.ministry.id}` as any)}
                accessibilityRole="button"
              >
                <View style={styles.cardIcon}>
                  <FontAwesome5 name="comments" size={16} color={palette.primary} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} allowFontScaling>
                    {row.ministry.name}
                  </Text>
                  <Text style={styles.cardSub} allowFontScaling>
                    Comunidade do ministerio - {roleLabel(row.role)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background, padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: palette.primary, fontFamily: typography.fonts.heading },
  subtitle: { marginTop: 4, fontSize: 15, color: palette.textSecondary, fontFamily: typography.fonts.body },
  list: { marginTop: spacing.lg, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}18`,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  cardSub: { marginTop: 2, fontSize: 13, color: palette.textSecondary },
  emptyCard: {
    marginTop: spacing.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyText: { fontSize: 14, color: palette.textSecondary },
});
