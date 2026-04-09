import Constants from 'expo-constants';

/** Base URL do site na Vercel (ou preview). Defina EXPO_PUBLIC_SITE_URL no build. */
export function getSiteBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (env) return env;
  const extra = Constants.expoConfig?.extra as { siteUrl?: string } | undefined;
  const fromExtra = extra?.siteUrl?.trim().replace(/\/$/, '');
  if (fromExtra) return fromExtra;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}
