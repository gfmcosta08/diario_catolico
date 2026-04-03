import { palette, radii, touchMin } from '@/constants/theme';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  textStyle?: TextStyle;
};

export function AppButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
  ...rest
}: Props) {
  const containerStyle: (ViewStyle | undefined)[] = [
    styles.base,
    variant === 'primary' ? styles.primaryBg : undefined,
    variant === 'outline' ? styles.outlineBg : undefined,
    variant === 'ghost' ? styles.ghostBg : undefined,
    disabled || loading ? styles.disabled : undefined,
  ];

  const labelStyle: TextStyle[] = [
    styles.label,
    variant === 'primary' ? styles.labelOnPrimary : styles.labelMuted,
    textStyle,
  ].filter((x): x is TextStyle => x != null);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...containerStyle,
        pressed ? styles.pressed : undefined,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? palette.surface : palette.primary}
        />
      ) : (
        <Text style={labelStyle} allowFontScaling>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchMin,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: palette.primary,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: palette.primary,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88 },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  labelOnPrimary: { color: palette.surface },
  labelMuted: { color: palette.primary },
});
