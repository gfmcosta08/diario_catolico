import { api, clearToken, isApiConfigured as checkApiConfigured } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Session = { user: { id: string; email: string } };

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null; debugToken?: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = checkApiConfigured();

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!checkApiConfigured()) {
        if (!active) return;
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const me = await api.me();
        if (!active) return;
        setSession({ user: { id: me.id, email: me.email } });
      } catch {
        if (!active) return;
        setSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!checkApiConfigured()) {
      return {
        error: new Error(
          'API indisponível neste ambiente. No celular, configure EXPO_PUBLIC_API_URL com a URL do servidor.'
        ),
      };
    }
    try {
      const user = await api.signIn(email, password);
      setSession({ user });
      queryClient.invalidateQueries();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [queryClient]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!checkApiConfigured()) {
      return {
        error: new Error(
          'API indisponível neste ambiente. No celular, configure EXPO_PUBLIC_API_URL com a URL do servidor.'
        ),
      };
    }
    try {
      const user = await api.signUp(email, password);
      setSession({ user });
      queryClient.invalidateQueries();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await clearToken();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    if (!checkApiConfigured()) {
      return { error: new Error('Configure EXPO_PUBLIC_API_URL para recuperar senha.') };
    }

    try {
      const data = await api.requestPasswordReset(email.trim());
      return { error: null, debugToken: data.debugToken ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [session, loading, configured, signIn, signUp, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth dentro de AuthProvider');
  return ctx;
}

