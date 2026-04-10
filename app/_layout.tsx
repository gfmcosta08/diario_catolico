import { AuthProvider } from '@/context/AuthContext';
import { palette } from '@/constants/theme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

const lightNav = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
    notification: palette.accent,
  },
};

const darkNav = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.accentSoft,
    background: '#0F1722',
    card: '#152030',
    text: '#E8EEF5',
    border: '#2A3A4D',
    notification: palette.accent,
  },
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const scheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavThemeProvider value={scheme === 'dark' ? darkNav : lightNav}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="m" />
          </Stack>
        </NavThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
