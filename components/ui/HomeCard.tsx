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
        <FontAwesome name="chevron-right" size={14} color={palette.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.glassDark, // Vitral super escuro e translúcido
    borderRadius: 0, // Quadrado Brutalista
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderLeftWidth: 3, // Efeito painel arquitetônico ("feixe luminoso na lateral")
    borderColor: palette.border, // Borda sutil escura
    borderLeftColor: palette.primary, // Cyan Neon correndo pela esquerda
    shadowColor: palette.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  pressed: { 
    opacity: 0.95, 
    transform: [{ scale: 0.99 }], 
    backgroundColor: 'rgba(100, 255, 218, 0.05)', // Brilho de pulse ao hover/press
    borderColor: palette.primary,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 0, 
    backgroundColor: 'rgba(100, 255, 218, 0.08)', // Fundo cyan altamente translúcido 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.2)', // Contorno cyan leve
  },
  textWrap: { flex: 1, paddingRight: spacing.sm },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text, // Branco brilhante
    letterSpacing: 0.5,
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
    borderRadius: 0, // Bloco
    backgroundColor: 'transparent', 
    alignItems: 'center',
    justifyContent: 'center',
  }
});
