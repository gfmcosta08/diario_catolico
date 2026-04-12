import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? '';
const API_URL = configuredApiUrl.replace(/\/$/, '');

/** Sempre em tempo de execução — nunca cachear no load do módulo (SSR/export estático definem window depois). */
export function isApiConfigured(): boolean {
  if (API_URL) return true;
  if (typeof window !== 'undefined' && window.location?.origin) return true;
  return false;
}
const TOKEN_KEY = 'auth_token';
const FETCH_TIMEOUT_MS = 12000;

export type AuthUser = { id: string; email: string };

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

function getBaseUrl() {
  if (API_URL) return API_URL;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error(
      'API indisponível: defina EXPO_PUBLIC_API_URL ou abra o app no browser no mesmo host da API.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller =
    typeof AbortController !== 'undefined' && !init.signal ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    : null;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: init.signal ?? controller?.signal,
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (controller?.signal.aborted) {
      throw new Error('A API demorou para responder. Tente novamente em alguns segundos.');
    }
    throw error instanceof Error ? error : new Error('Falha de conexão com a API.');
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const o = data && typeof data === 'object' ? (data as { error?: string; message?: string }) : null;
    const fromBody = o?.error ?? o?.message;
    throw new Error(
      fromBody?.trim()
        ? String(fromBody)
        : `Erro na API (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`
    );
  }

  return data as T;
}

export const api = {
  async signUp(email: string, password: string) {
    const data = await request<{ token: string; user: AuthUser }>(
      '/api/auth/signup',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false
    );
    await setToken(data.token);
    return data.user;
  },

  async signIn(email: string, password: string) {
    const data = await request<{ token: string; user: AuthUser }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false
    );
    await setToken(data.token);
    return data.user;
  },

  
  async requestPasswordReset(email: string) {
    return request<{ ok: true; debugToken?: string; expiresAt?: string }>(
      '/api/auth/password/request',
      { method: 'POST', body: JSON.stringify({ email }) },
      false
    );
  },

  async resetPasswordWithToken(token: string, newPassword: string) {
    return request<{ ok: true }>(
      '/api/auth/password/reset',
      { method: 'POST', body: JSON.stringify({ token, newPassword }) },
      false
    );
  },
  async me() {
    return request<{ id: string; email: string; profile?: { displayName: string | null } | null }>('/api/auth/me');
  },

  async updateProfile(displayName: string | null) {
    return request('/api/profile', { method: 'PUT', body: JSON.stringify({ displayName }) });
  },

  async getProfile() {
    return request<{ id: string; displayName: string | null }>('/api/profile');
  },

  async getBibleProgress() {
    return request<{ checkedDays: number[] }>('/api/progress/bible');
  },

  async toggleBibleDay(day: number, done: boolean) {
    return request('/api/progress/bible/toggle', {
      method: 'POST',
      body: JSON.stringify({ day, done }),
    });
  },

  async getRosaryProgress(mode: string) {
    return request<{ checkedIds: string[] }>(`/api/progress/rosary/${mode}`);
  },

  async setRosaryProgress(mode: string, checkedIds: string[]) {
    return request(`/api/progress/rosary/${mode}`, {
      method: 'PUT',
      body: JSON.stringify({ checkedIds }),
    });
  },

  async myMinistries() {
    return request<Array<{ role: string; ministry: { id: string; slug: string; name: string } }>>('/api/ministries/my');
  },

  async createMinistry(payload: { slug: string; name: string; description?: string }) {
    return request<{ id: string }>('/api/ministries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMinistry(id: string) {
    return request<{ id: string; slug: string; name: string; description: string | null } | null>(`/api/ministries/${id}`);
  },

  async deleteMinistry(id: string) {
    return request(`/api/ministries/${id}`, { method: 'DELETE' });
  },

  async getMinistryBySlug(slug: string) {
    return request<{ id: string; slug: string; name: string; description: string | null } | null>(`/api/ministries/by-slug/${slug}`, { method: 'GET' }, false);
  },

  async getMembership(ministryId: string) {
    return request<{ role: string } | null>(`/api/ministries/${ministryId}/membership`);
  },

  async getJoinRequest(ministryId: string) {
    return request<{ id: string; status: string } | null>(`/api/ministries/${ministryId}/join-request`);
  },

  async createJoinRequest(ministryId: string) {
    return request(`/api/ministries/${ministryId}/join-request`, { method: 'POST' });
  },

  async getJoinRequests(ministryId: string) {
    return request<Array<{ id: string; userId: string; displayName: string | null; email: string }>>(`/api/ministries/${ministryId}/join-requests`);
  },

  async approveJoinRequest(ministryId: string, requestId: string) {
    return request(`/api/ministries/${ministryId}/join-requests/${requestId}/approve`, { method: 'POST' });
  },

  async rejectJoinRequest(ministryId: string, requestId: string) {
    return request(`/api/ministries/${ministryId}/join-requests/${requestId}/reject`, { method: 'POST' });
  },

  async getMembers(ministryId: string) {
    return request<Array<{ userId: string; role: string; displayName: string | null; email: string }>>(`/api/ministries/${ministryId}/members`);
  },

  async promoteSubAdmin(ministryId: string, userId: string) {
    return request(`/api/ministries/${ministryId}/members/${userId}/promote-sub-admin`, { method: 'POST' });
  },

  async getPosts(ministryId: string) {
    return request<Array<{ id: string; ministryId: string; authorId: string; authorName: string; content: string; parentId: string | null; createdAt: string }>>(`/api/ministries/${ministryId}/posts`);
  },

  async createPost(ministryId: string, payload: { content: string; parentId?: string | null }) {
    return request(`/api/ministries/${ministryId}/posts`, { method: 'POST', body: JSON.stringify(payload) });
  },

  async deletePost(ministryId: string, postId: string) {
    return request(`/api/ministries/${ministryId}/posts/${postId}`, { method: 'DELETE' });
  },

  async getEvents(ministryId: string) {
    return request<Array<{ id: string; ministryId: string; title: string; startsAt: string; notes: string | null }>>(`/api/ministries/${ministryId}/events`);
  },

  async createEvent(ministryId: string, payload: { title: string; startsAt: string; notes?: string }) {
    return request<{ id: string }>(`/api/ministries/${ministryId}/events`, { method: 'POST', body: JSON.stringify(payload) });
  },

  async getEventRoles(ministryId: string) {
    return request<Array<{ id: string; eventId: string; title: string; capacity: number }>>(`/api/ministries/${ministryId}/event-roles`);
  },

  async createEventRole(ministryId: string, payload: { eventId: string; title: string; capacity: number }) {
    return request<{ id: string }>(`/api/ministries/${ministryId}/event-roles`, { method: 'POST', body: JSON.stringify(payload) });
  },

  async getAssignments(ministryId: string) {
    return request<Array<{ id: string; roleId: string; userId: string; userName: string }>>(`/api/ministries/${ministryId}/assignments`);
  },

  async createAssignment(ministryId: string, roleId: string) {
    return request<{ id: string }>(`/api/ministries/${ministryId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    });
  },

  async deleteAssignment(ministryId: string, assignmentId: string) {
    return request(`/api/ministries/${ministryId}/assignments/${assignmentId}`, { method: 'DELETE' });
  },

  async likePost(ministryId: string, postId: string) {
    return request<{ ok: boolean; likesCount: number }>(`/api/ministries/${ministryId}/posts/${postId}/like`, { method: 'POST' });
  },

  async getDashboardStats() {
    return request<{ streakCount: number; assignmentsCount: number; bibleReadCount: number; rosaryCount: number; totalPoints: number }>('/api/dashboard/stats');
  },

  async getPrayers() {
    return request<Array<{ id: string; authorId: string; authorName: string; content: string; prayCount: number; createdAt: string }>>('/api/prayers');
  },

  async createPrayer(content: string) {
    return request<{ id: string; content: string; prayCount: number; createdAt: string }>('/api/prayers', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async prayForPrayer(prayerId: string) {
    return request<{ ok: boolean; prayCount: number }>(`/api/prayers/${prayerId}/pray`, { method: 'POST' });
  },

  async getAchievements() {
    return request<string[]>('/api/achievements');
  },
};

