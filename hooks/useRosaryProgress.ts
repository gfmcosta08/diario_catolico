import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { RosaryMode, RosaryProgressPayload } from '@/types/progress';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_MS = 600;

export function useRosaryProgress(mode: RosaryMode, allIds: string[]) {
  const queryClient = useQueryClient();
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const queryKey = useMemo(() => ['rosary', mode] as const, [mode]);

  const { data: remotePayload, isFetched } = useQuery({
    queryKey,
    queryFn: async (): Promise<RosaryProgressPayload> => {
      if (!isSupabaseConfigured) {
        return { checkedIds: [] };
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { checkedIds: [] };
      const { data, error } = await supabase
        .from('rosary_progress')
        .select('payload')
        .eq('mode', mode)
        .maybeSingle();
      if (error) throw error;
      const payload = data?.payload as RosaryProgressPayload | undefined;
      return payload?.checkedIds ? payload : { checkedIds: [] };
    },
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLocalChecked(new Set());
      setHydrated(true);
      return;
    }
    if (!isFetched) return;
    const ids = remotePayload?.checkedIds ?? [];
    const valid = new Set(ids.filter((id) => allIds.includes(id)));
    setLocalChecked(valid);
    setHydrated(true);
  }, [remotePayload, allIds, mode, isFetched]);

  const persist = useDebouncedCallback(
    async (checkedIds: string[]) => {
      if (!isSupabaseConfigured) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const payload: RosaryProgressPayload = { checkedIds };
      await supabase.from('rosary_progress').upsert(
        {
          user_id: userData.user.id,
          mode,
          payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,mode' }
      );
      queryClient.invalidateQueries({ queryKey });
    },
    DEBOUNCE_MS
  );

  const toggle = useCallback(
    (id: string) => {
      setLocalChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        const arr = allIds.filter((x) => next.has(x));
        persist(arr);
        return next;
      });
    },
    [allIds, persist]
  );

  const isChecked = useCallback(
    (id: string) => localChecked.has(id),
    [localChecked]
  );

  const resetLocal = useCallback(() => {
    setLocalChecked(new Set());
    persist([]);
  }, [persist]);

  return {
    hydrated,
    toggle,
    isChecked,
    checkedCount: localChecked.size,
    total: allIds.length,
    resetLocal,
  };
}
