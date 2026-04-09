import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { api, isApiConfigured } from '@/lib/api';
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
      if (!isApiConfigured) {
        return { checkedIds: [] };
      }
      const data = await api.getRosaryProgress(mode);
      return { checkedIds: data.checkedIds ?? [] };
    },
    enabled: isApiConfigured,
  });

  useEffect(() => {
    if (!isApiConfigured) {
      setLocalChecked(new Set());
      setHydrated(true);
      return;
    }
    if (!isFetched) return;
    const ids = remotePayload?.checkedIds ?? [];
    const valid = new Set(ids.filter((id) => allIds.includes(id)));
    setLocalChecked(valid);
    setHydrated(true);
  }, [remotePayload, allIds, isFetched]);

  const persist = useDebouncedCallback(
    async (checkedIds: string[]) => {
      if (!isApiConfigured) return;
      await api.setRosaryProgress(mode, checkedIds);
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
