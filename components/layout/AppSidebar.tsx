import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { palette, radii, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';

const navItems = [
  { path: '/(app)', label: 'Home', icon: 'home' },
  { path: '/(app)/rosary', label: 'Rosário', icon: 'pray' },
  { path: '/(app)/bible', label: 'Bíblia', icon: 'book' },
  { path: '/(app)/liturgy', label: 'Liturgia', icon: 'cross' },
  { path: '/(app)/ministries', label: 'Ministérios', icon: 'users' },
  { path: '/(app)/feed', label: 'Comunidade', icon: 'comments' },
  { path: '/(app)/schedule', label: 'Escalas', icon: 'calendar-alt' },
  { path: '/(app)/prayers', label: 'Mural de Oração', icon: 'hands-helping' },
  { path: '/(app)/settings', label: 'Perfil', icon: 'user' },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoCross} allowFontScaling maxFontSizeMultiplier={1.5}>
          ✝
        </Text>
        <Text style={styles.logoText} allowFontScaling maxFontSizeMultiplier={1.3}>
          Diário Católico
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.navMenu} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          // Ajuste de matching para rotas do expo
          const isActive = pathname === item.path || (item.path !== '/(app)' && pathname.startsWith(item.path));
          
          return (
            <Pressable
              key={item.path}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.path as any)}
            >
              <FontAwesome5 
                name={item.icon} 
                size={20} 
                color={isActive ? palette.primary : palette.textSecondary} 
                style={styles.navIcon}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable 
        style={styles.logoutBtn}
        onPress={() => {
          signOut();
          router.replace('/(auth)/login');
        }}
      >
        <FontAwesome5 name="sign-out-alt" size={20} color={palette.danger} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: palette.surface,
    borderRightWidth: 1,
    borderRightColor: palette.border,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  logoCross: {
    fontSize: 26,
    fontWeight: '600',
    color: palette.primary,
    fontFamily: typography.fonts.heading,
    lineHeight: 30,
  },
  logoText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary,
    fontFamily: typography.fonts.heading,
  },
  navMenu: {
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  navItemActive: {
    backgroundColor: `${palette.primary}10`, // 10% opacity
  },
  navIcon: {
    width: 24,
    textAlign: 'center',
  },
  navText: {
    fontSize: 16,
    color: palette.textSecondary,
    fontWeight: '500',
    fontFamily: typography.fonts.body,
  },
  navTextActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: 'auto',
    gap: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    color: palette.danger,
    fontWeight: '500',
  }
});
