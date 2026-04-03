import { palette, touchMin } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
};

export function AppCheckbox({ checked, onToggle, label, description }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[styles.box, checked && styles.boxChecked]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {checked ? (
          <FontAwesome name="check" size={18} color={palette.surface} />
        ) : null}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label} allowFontScaling>
          {label}
        </Text>
        {description ? (
          <Text style={styles.desc} allowFontScaling>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: touchMin,
  },
  pressed: { opacity: 0.85 },
  box: {
    width: touchMin - 4,
    height: touchMin - 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.primary,
    marginRight: 14,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  boxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  textCol: { flex: 1 },
  label: {
    fontSize: 16,
    color: palette.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  desc: {
    marginTop: 4,
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
});
