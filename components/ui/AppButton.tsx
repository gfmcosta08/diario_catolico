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
          color={variant === 'primary' ? palette.primary : palette.primary}
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
    minHeight: touchMin * 1.2, // Um bloco arquitetônico maior
    paddingHorizontal: 24,
    borderRadius: radii.sm, // Agora 0
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: palette.accent, // Bloco de Ouro Dourado Sólido
    borderWidth: 2, // Fio de luz
    borderColor: 'rgba(255, 255, 255, 0.4)', // Efeito vitral frontal
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 0, // Sombra dura
    elevation: 4,
  },
  outlineBg: {
    backgroundColor: palette.glassWhite,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] }, // Movimento afiado e curto
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2.0, // Altamente minimalista e espaçado
    textTransform: 'uppercase', // Brutalista
  },
  labelOnPrimary: { color: palette.primary },
  labelMuted: { color: palette.primary },
});
