import { palette, radii, touchMin } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
};

export function AppTextField({
  label,
  error,
  secureTextEntry,
  showPasswordToggle,
  style,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const isPassword = !!secureTextEntry;
  const effectiveSecure = isPassword && hidden;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label} allowFontScaling>
        {label}
      </Text>
      <View style={[styles.fieldRow, error && styles.fieldError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={palette.textSecondary}
          secureTextEntry={effectiveSecure}
          accessibilityLabel={label}
          allowFontScaling
          {...rest}
        />
        {isPassword && showPasswordToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={12}
            onPress={() => setHidden((h) => !h)}
            style={styles.eye}
          >
            <FontAwesome
              name={hidden ? 'eye' : 'eye-slash'}
              size={22}
              color={palette.primaryMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error} allowFontScaling>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchMin,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
  },
  fieldError: { borderColor: palette.error },
  input: {
    flex: 1,
    fontSize: 17,
    color: palette.text,
    paddingVertical: 12,
  },
  eye: { padding: 8 },
  error: {
    marginTop: 4,
    color: palette.error,
    fontSize: 14,
  },
});
