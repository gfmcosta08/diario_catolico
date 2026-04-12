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
        <FontAwesome name={icon} size={24} color={palette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} allowFontScaling>
          {title}
        </Text>
        <Text style={styles.sub} allowFontScaling>
          {subtitle}
        </Text>
      </View>
      <View style={styles.arrowWrap}>
        <FontAwesome name="chevron-right" size={14} color={palette.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)', // Quase branco com levíssima transparência
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.25)', // Borda macia dourada
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 74, 120, 0.08)', // Azul sutil translúcido
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: { flex: 1, paddingRight: spacing.sm },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.primary, // Azul Marinho escuro, mais legível na claridade
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 162, 39, 0.15)', // Fundo redondinho em tom dourado suave pro chevron
    alignItems: 'center',
    justifyContent: 'center',
  }
});
