import { palette, radii, spacing } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  queueId: string;
};

export function AudioBar(_props: Props) {
  return (
    <View style={styles.webNote}>
      <Text style={styles.webNoteText} allowFontScaling maxFontSizeMultiplier={1.5}>
        Áudio em segundo plano e controles na tela de bloqueio estão disponíveis no
        aplicativo iOS/Android (development build com react-native-track-player). Na
        web, use o app nativo para essa experiência.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webNote: {
    padding: spacing.md,
    backgroundColor: palette.accentSoft,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  webNoteText: { color: palette.text, fontSize: 14, lineHeight: 20 },
});
