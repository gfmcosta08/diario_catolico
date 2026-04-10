import { palette, radii, spacing } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  /** Opcional quando usado com `Link asChild` (o Link injeta `onPress`). */
  onPress?: () => void;
};

export function HomeCard({ title, subtitle, icon, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <FontAwesome name={icon} size={26} color={palette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} allowFontScaling>
          {title}
        </Text>
        <Text style={styles.sub} allowFontScaling>
          {subtitle}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color={palette.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
});
