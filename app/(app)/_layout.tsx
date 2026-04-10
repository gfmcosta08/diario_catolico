import { useAuth } from '@/context/AuthContext';
import { palette } from '@/constants/theme';
import { Stack, router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function AppLayout() {
  const { signOut, configured, session } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
        headerRight: () =>
          configured && session ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={() => {
                signOut();
                router.replace('/(auth)/login');
              }}
              style={styles.outBtn}
            >
              <Text style={styles.outTxt} allowFontScaling maxFontSizeMultiplier={1.5}>
                Sair
              </Text>
            </Pressable>
          ) : null,
      }}
    />
  );
}

const styles = StyleSheet.create({
  outBtn: { paddingHorizontal: 12, paddingVertical: 8, minWidth: 44, justifyContent: 'center' },
  outTxt: { color: palette.primary, fontWeight: '600', fontSize: 16 },
});
