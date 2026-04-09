import { api, isApiConfigured } from '@/lib/api';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_MS = 400;

export function useBibleProgressMap() {
  const queryClient = useQueryClient();
  const [localDone, setLocalDone] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const apiOk = isApiConfigured();

  const queryKey = useMemo(() => ['bible365'] as const, []);

  const { data: remoteDays, isFetched } = useQuery({
    queryKey,
    queryFn: async (): Promise<number[]> => {
      if (!isApiConfigured()) return [];
      const data = await api.getBibleProgress();
      return data.checkedDays;
    },
    enabled: apiOk,
  });

  useEffect(() => {
    if (!apiOk) {
      setLocalDone(new Set());
      setHydrated(true);
      return;
    }
    if (!isFetched) return;
    setLocalDone(new Set(remoteDays ?? []));
    setHydrated(true);
  }, [apiOk, remoteDays, isFetched]);

  const persistMark = useDebouncedCallback(async (day: number, done: boolean) => {
    if (!isApiConfigured()) return;
    await api.toggleBibleDay(day, done);
    queryClient.invalidateQueries({ queryKey });
  }, DEBOUNCE_MS);

  const setDayDone = useCallback(
    (day: number, done: boolean) => {
      setLocalDone((prev) => {
        const next = new Set(prev);
        if (done) next.add(day);
        else next.delete(day);
        return next;
      });
      persistMark(day, done);
    },
    [persistMark]
  );

  const isDayDone = useCallback(
    (day: number) => localDone.has(day),
    [localDone]
  );

  const completedDays = useMemo(() => {
    return Array.from(localDone).sort((a, b) => a - b);
  }, [localDone]);

  return {
    hydrated,
    completedCount: localDone.size,
    completedDays,
    setDayDone,
    isDayDone,
  };
}
