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
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = !!secureTextEntry;
  const effectiveSecure = isPassword && hidden;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label} allowFontScaling>
        {label}
      </Text>
      <View style={[
        styles.fieldRow, 
        isFocused && styles.fieldFocused,
        error && styles.fieldError
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={palette.textSecondary}
          secureTextEntry={effectiveSecure}
          accessibilityLabel={label}
          allowFontScaling
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
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
  wrap: { marginBottom: 18 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 8,
    letterSpacing: 0.2, // Elegância extra na tipografia
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchMin * 1.1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: '#F7F9FC', // Um fundo muito suave de contraste com o branco puro do card
    paddingHorizontal: 16,
  },
  fieldFocused: {
    borderColor: palette.primaryMuted,
    backgroundColor: palette.surface, // Clareia quando foca
  },
  fieldError: { 
    borderColor: palette.error,
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: palette.text,
    paddingVertical: 14,
  },
  eye: { padding: 8 },
  error: {
    marginTop: 6,
    color: palette.error,
    fontSize: 13,
  },
});
