import { palette, spacing, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onMenuPress: () => void;
};

export function AppMobileHeader({ onMenuPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      <Pressable
        onPress={onMenuPress}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
        hitSlop={12}
      >
        <FontAwesome5 name="bars" size={22} color={palette.primary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1} allowFontScaling>
        Diário Católico
      </Text>
      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.background,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: palette.primary,
    fontFamily: typography.fonts.heading,
  },
  rightSpacer: {
    width: 44,
  },
});
