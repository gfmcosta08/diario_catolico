import { AppMobileDrawer } from '@/components/layout/AppMobileDrawer';
import { AppMobileHeader } from '@/components/layout/AppMobileHeader';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Redirect, Slot } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const { configured, session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const safeEdges = isDesktop
    ? (['top', 'left', 'right'] as const)
    : (['left', 'right'] as const);

  if (loading) return null;
  if (configured && !session) return <Redirect href="/(auth)/login" />;

  return (
    <SafeAreaView style={styles.container} edges={safeEdges}>
      <View style={styles.layout}>
        {isDesktop && <AppSidebar />}

        <View style={styles.mainColumn}>
          {!isDesktop && (
            <>
              <AppMobileHeader onMenuPress={() => setDrawerOpen(true)} />
              <AppMobileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
            </>
          )}
          <View style={styles.mainContent}>
            <Slot />
          </View>
        </View>
      </View>

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
  mainColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    ...Platform.select({ web: { overflow: 'hidden' } }),
  },
});
