import { getSiteBaseUrl } from '@/lib/siteUrl';

const APP_SCHEME = 'leiabiblia365';

/** Texto copiado no convite: link web (Vercel) + deep link do app. */
export function buildMinistryInviteShareText(slug: string): string {
  const base = getSiteBaseUrl();
  const web = base ? `${base}/m/${encodeURIComponent(slug)}` : '';
  const deep = `${APP_SCHEME}://m/${slug}`;
  if (web) {
    return `Convite para o ministério:\n${web}\n\nAbrir no app: ${deep}`;
  }
  return `Abrir no app: ${deep}\n\n(Configure EXPO_PUBLIC_SITE_URL na Vercel para incluir o link do site.)`;
}
