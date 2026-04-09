import { api } from '@/lib/api';
import { slugify } from '@/lib/slug';

export async function ensureUniqueMinistrySlug(name: string): Promise<string> {
  const root = slugify(name);
  let candidate = root;
  for (let i = 0; i < 12; i++) {
    const data = await api.getMinistryBySlug(candidate);
    if (!data) return candidate;
    candidate = `${root}-${Math.random().toString(36).slice(2, 7)}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}
