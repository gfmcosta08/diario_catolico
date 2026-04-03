import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_MS = 400;

export function useBibleProgressMap() {
  const queryClient = useQueryClient();
  const [localDone, setLocalDone] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const queryKey = useMemo(() => ['bible365'] as const, []);

  const { data: remoteDays, isFetched } = useQuery({
    queryKey,
    queryFn: async (): Promise<number[]> => {
      if (!isSupabaseConfigured) return [];
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      const { data, error } = await supabase
        .from('bible_reading_progress')
        .select('day_index')
        .order('day_index');
      if (error) throw error;
      return (data ?? []).map((r) => r.day_index as number);
    },
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLocalDone(new Set());
      setHydrated(true);
      return;
    }
    if (!isFetched) return;
    setLocalDone(new Set(remoteDays ?? []));
    setHydrated(true);
  }, [remoteDays, isFetched]);

  const persistMark = useDebouncedCallback(async (day: number, done: boolean) => {
    if (!isSupabaseConfigured) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    if (done) {
      await supabase.from('bible_reading_progress').upsert(
        {
          user_id: userData.user.id,
          day_index: day,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_index' }
      );
    } else {
      await supabase
        .from('bible_reading_progress')
        .delete()
        .eq('day_index', day)
        .eq('user_id', userData.user.id);
    }
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

  return {
    hydrated,
    completedCount: localDone.size,
    setDayDone,
    isDayDone,
  };
}
