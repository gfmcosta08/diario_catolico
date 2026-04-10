import { palette } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function PublicMinistryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
