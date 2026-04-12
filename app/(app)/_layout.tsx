import { useAuth } from '@/context/AuthContext';
import { palette } from '@/constants/theme';
import { Slot, router, Redirect } from 'expo-router';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const { signOut, configured, session, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (isLoading) return null;
  if (configured && !session) return <Redirect href="/(auth)/login" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.layout}>
        {/* Sidebar no Desktop */}
        {isDesktop && <AppSidebar />}

        {/* Carga Principal */}
        <View style={styles.mainContent}>
          <Slot />
        </View>
      </View>

      {/* Navegação Inferior no Mobile */}
      {!isDesktop && <AppMobileNav />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    // web: overflow hidden é útil para evitar barra de rolagem global fora da view principal
    ...Platform.select({ web: { overflow: 'hidden' } })
  }
});
