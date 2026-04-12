import { MinistryAboutTab } from '@/components/ministry/MinistryAboutTab';
import { MinistryForumTab } from '@/components/ministry/MinistryForumTab';
import { MinistryScheduleTab } from '@/components/ministry/MinistryScheduleTab';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type TabKey = 'about' | 'forum' | 'schedule';

export default function MinistryDetailScreen() {
  const navigation = useNavigation();
  const { ministryId: rawId } = useLocalSearchParams<{ ministryId: string }>();
  const ministryId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { session, configured } = useAuth();
  const uid = session?.user?.id;
  const [tab, setTab] = useState<TabKey>('about');

  const ministryQuery = useQuery({
    queryKey: ['ministry', ministryId],
    enabled: !!ministryId,
    queryFn: async () => api.getMinistry(ministryId!),
  });

  const memberQuery = useQuery({
    queryKey: ['my-membership', ministryId, uid],
    enabled: !!ministryId && !!uid && configured,
    queryFn: async () => api.getMembership(ministryId!),
  });

  useLayoutEffect(() => {
    const n = ministryQuery.data?.name;
    if (n) navigation.setOptions({ title: n });
  }, [ministryQuery.data?.name, navigation]);

  useEffect(() => {
    if (!ministryQuery.isSuccess || !memberQuery.isSuccess) return;
    if (!memberQuery.data && ministryQuery.data?.slug) {
      router.replace(`/m/${ministryQuery.data.slug}`);
    }
  }, [memberQuery.data, memberQuery.isSuccess, ministryQuery.data?.slug, ministryQuery.isSuccess]);

  if (!ministryId || !uid) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Faça login para continuar.</Text>
      </View>
    );
  }

  if (ministryQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!ministryQuery.data) {
    return (
      <View style={styles.center}>
        <Text allowFontScaling>Ministério não encontrado.</Text>
      </View>
    );
  }

  if (memberQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!memberQuery.data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.redirectTxt} allowFontScaling>
          Redirecionando...
        </Text>
      </View>
    );
  }

  const m = ministryQuery.data;
  const myRole = memberQuery.data.role;
  const isAdmin = myRole === 'owner' || myRole === 'sub_admin';

  return (
    <View style={styles.flex}>
      <View style={styles.tabs}>
        {(
          [
            ['about', 'Sobre'],
            ['forum', 'Fórum'],
            ['schedule', 'Escalas'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.tab, tab === key && styles.tabOn]}
            onPress={() => setTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
          >
            <Text style={[styles.tabTxt, tab === key && styles.tabTxtOn]} allowFontScaling>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.body}>
        {tab === 'about' ? (
          <MinistryAboutTab
            ministryId={m.id}
            slug={m.slug}
            name={m.name}
            description={m.description ?? ''}
            myRole={myRole}
          />
        ) : null}
        {tab === 'forum' ? (
          <View style={styles.flex}>
            <MinistryForumTab ministryId={m.id} userId={uid} isAdmin={isAdmin} />
          </View>
        ) : null}
        {tab === 'schedule' ? (
          <MinistryScheduleTab ministryId={m.id} userId={uid} isAdmin={isAdmin} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  redirectTxt: { marginTop: spacing.md, color: palette.textSecondary },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.surface,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabOn: { borderBottomWidth: 3, borderBottomColor: palette.primary },
  tabTxt: { fontSize: 15, fontWeight: '600', color: palette.textSecondary },
  tabTxtOn: { color: palette.primary },
  body: { flex: 1, padding: spacing.md },
});
