import { useAuth } from '@/context/AuthContext';
import { palette, spacing, radii } from '@/constants/theme';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const options = { title: 'Início', headerShown: false };

export default function HomeScreen() {
  const { configured, session } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  // Real data state
  const userName = session?.user?.name?.split(' ')[0] || 'Maria';
  
  const [currentDateString, setCurrentDateString] = useState('');
  const [stats, setStats] = useState({
    streakCount: 0,
    assignmentsCount: 0,
    bibleReadCount: 0,
    rosaryCount: 0,
    totalPoints: 0
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDateString(now.toLocaleDateString('pt-BR', {weekday:'long', year:'numeric', month:'long', day:'numeric'}));

    if (configured && session) {
      api.getDashboardStats().then(setStats).catch(console.error);
    }
  }, [configured, session]);

  return (
    <View style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: isDesktop ? Math.max(insets.top, spacing.xl) : spacing.lg,
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          },
        ]}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.greet} allowFontScaling>
            Bom dia, {userName}! ☀️
          </Text>
          <Text style={styles.dateText} allowFontScaling>
            {currentDateString}
          </Text>
        </View>

        {!configured ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Aviso: Aplicativo local sem sincronização em nuvem.</Text>
          </View>
        ) : null}

        <View style={styles.quickActions}>
          <Link href="/(app)/terco-mariano" asChild>
            <Pressable style={({ pressed }) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="pray" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Rezar o Terço</Text>
            </Pressable>
          </Link>
          <Link href="/(app)/bible" asChild>
            <Pressable style={({pressed}) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="book-open" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Ler a Bíblia</Text>
            </Pressable>
          </Link>
          <Link href="/(app)/feed" asChild>
            <Pressable style={({pressed}) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="comments" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Abrir o Feed</Text>
            </Pressable>
          </Link>
          <Link href="/(app)/schedule" asChild>
            <Pressable style={({pressed}) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="calendar-check" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Ver Escalas</Text>
            </Pressable>
          </Link>
          <Link href="/(app)/ministries" asChild>
            <Pressable style={({pressed}) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="users" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Ministérios</Text>
            </Pressable>
          </Link>
          <Link href="/(app)/prayers" asChild>
            <Pressable style={({pressed}) => [styles.quickActionBtn, pressed && styles.pressed]}>
              <FontAwesome5 name="hands-praying" size={22} color={palette.primary} />
              <Text style={styles.quickActionText}>Mural de Oração</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrap, {backgroundColor: 'rgba(91,44,111,0.1)'}]}>
              <FontAwesome5 name="fire" size={18} color={palette.primary} />
            </View>
            <Text style={styles.statValue}>{stats.streakCount}</Text>
            <Text style={styles.statLabel}>Dias de Ofensiva</Text>
          </View>

          <Link href="/(app)/bible" asChild>
            <Pressable style={styles.statCard}>
              <View style={[styles.iconWrap, {backgroundColor: 'rgba(212,160,23,0.1)'}]}>
                <FontAwesome5 name="book-open" size={18} color={palette.gold} />
              </View>
              <Text style={styles.statValue}>{stats.bibleReadCount}</Text>
              <Text style={styles.statLabel}>Dias de 365 na Bíblia</Text>
            </Pressable>
          </Link>

          <View style={styles.statCard}>
            <View style={[styles.iconWrap, {backgroundColor: 'rgba(39,174,96,0.1)'}]}>
              <FontAwesome5 name="calendar-check" size={18} color={palette.success} />
            </View>
            <Text style={styles.statValue}>{stats.assignmentsCount}</Text>
            <Text style={styles.statLabel}>Escalas assumidas</Text>
          </View>

          <Link href="/(app)/terco-mariano" asChild>
            <Pressable style={styles.statCard}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(231,76,60,0.1)' }]}>
                <FontAwesome5 name="cross" size={18} color={palette.danger} />
              </View>
              <Text style={styles.statValue}>{stats.rosaryCount}</Text>
              <Text style={styles.statLabel}>Terços Rezados</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <FontAwesome5 name="bible" size={15} color={palette.primary} />
              <Text style={styles.cardTitle}>Leitura de Hoje</Text>
            </View>
            <Link href="/(app)/bible" asChild>
              <Pressable style={styles.btnSmSecondary}>
                <Text style={styles.btnSmText}>Ler Agora</Text>
              </Pressable>
            </Link>
          </View>
          
          <View style={styles.readingsList}>
            <View style={styles.readingItem}>
              <Text style={styles.readingType}>📖 ANTIGO TESTAMENTO</Text>
              <Text style={styles.readingTitle}>Gênesis 1:1-31</Text>
              <Text style={styles.readingDesc}>A Criação — No princípio Deus criou os céus e a terra...</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingType}>✝️ NOVO TESTAMENTO</Text>
              <Text style={styles.readingTitle}>Mateus 1:1-17</Text>
              <Text style={styles.readingDesc}>Genealogia de Jesus Cristo</Text>
            </View>
            <View style={[styles.readingItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.readingType}>🙏 SALMO</Text>
              <Text style={styles.readingTitle}>Salmo 1:1-6</Text>
              <Text style={styles.readingDesc}>Bem-aventurado o homem que não segue o conselho dos ímpios...</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
    maxWidth: 920,
    alignSelf: 'center',
    width: '100%',
  },
  pageHeader: {
    marginBottom: spacing.xl,
  },
  greet: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primaryDark,
  },
  dateText: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  banner: {
    backgroundColor: palette.warning,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  quickActionBtn: {
    width: '31%',
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.text,
    marginTop: 8,
    textAlign: 'center',
  },
  pressed: {
    borderColor: palette.primary,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  statCard: {
    width: '48%',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
    marginLeft: 6,
  },
  btnSmSecondary: {
    backgroundColor: palette.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
  },
  btnSmText: {
    fontSize: 13,
    color: palette.text,
    fontWeight: '600',
  },
  readingsList: {
    marginTop: 8,
  },
  readingItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  readingType: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  readingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 4,
  },
  readingDesc: {
    fontSize: 13,
    color: palette.textSecondary,
  },
});

