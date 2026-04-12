import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { palette, spacing, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mobileNavItems = [
  { path: '/(app)', label: 'Início', icon: 'home' },
  { path: '/(app)/bible', label: 'Bíblia', icon: 'book' },
  { path: '/(app)/rosary', label: 'Rosário', icon: 'pray' },
  { path: '/(app)/feed', label: 'Feed', icon: 'comments' },
  { path: '/(app)/settings', label: 'Perfil', icon: 'user' },
];

export function AppMobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mobileNav, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/(app)' && pathname.startsWith(item.path));
        
        return (
          <Pressable
            key={item.path}
            style={styles.navItem}
            onPress={() => router.push(item.path as any)}
          >
            <FontAwesome5 
              name={item.icon} 
              size={20} 
              color={isActive ? palette.primary : palette.textSecondary} 
            />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
      }
    })
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    minWidth: 60,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: palette.textSecondary,
    fontWeight: '500',
    fontFamily: typography.fonts.body,
  },
  navTextActive: {
    color: palette.primary,
    fontWeight: '700',
  }
});
