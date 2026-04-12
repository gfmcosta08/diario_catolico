import { APP_NAV_ITEMS, isAppNavItemActive } from '@/components/layout/appNavItems';
import { palette, radii, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppMobileDrawer({ visible, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(300, Math.round(width * 0.86));

  function go(path: string) {
    onClose();
    router.push(path as never);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.drawer, { width: drawerWidth, paddingTop: Math.max(insets.top, spacing.lg) }]}>
          <View style={styles.logoRow}>
            <Text style={styles.logoCross} allowFontScaling>
              ✝
            </Text>
            <Text style={styles.logoText} allowFontScaling numberOfLines={2}>
              Diário Católico
            </Text>
          </View>

          <ScrollView
            style={styles.navScroll}
            contentContainerStyle={styles.navMenu}
            showsVerticalScrollIndicator={false}
          >
            {APP_NAV_ITEMS.map((item) => {
              const isActive = isAppNavItemActive(pathname, item.path);
              return (
                <Pressable
                  key={item.path}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => go(item.path)}
                >
                  <FontAwesome5
                    name={item.icon as never}
                    size={20}
                    color={isActive ? palette.primary : palette.textSecondary}
                    style={styles.navIcon}
                  />
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={styles.logoutBtn}
            onPress={() => {
              onClose();
              signOut();
              router.replace('/(auth)/login');
            }}
          >
            <FontAwesome5 name="sign-out-alt" size={20} color={palette.danger} />
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Fechar menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    flexDirection: 'column',
    backgroundColor: palette.surface,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: palette.border,
    paddingBottom: spacing.md,
  },
  navScroll: {
    flex: 1,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  logoCross: {
    fontSize: 24,
    fontWeight: '600',
    color: palette.primary,
    fontFamily: typography.fonts.heading,
  },
  logoText: {
    flex: 1,
    fontSize: 18,
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
    backgroundColor: `${palette.primary}10`,
  },
  navIcon: {
    width: 24,
    textAlign: 'center',
  },
  navText: {
    flex: 1,
    minWidth: 0,
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
  },
});
