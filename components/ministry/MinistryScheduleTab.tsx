import { MonthCalendar } from '@/components/ministry/MonthCalendar';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type EventRow = {
  id: string;
  title: string;
  startsAt: string;
  ministryId: string;
};

type RoleRow = { id: string; eventId: string; title: string; capacity: number };
type AssignRow = { id: string; roleId: string; userId: string; userName: string };

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDayInMonth(year: number, monthIndex: number, day: number) {
  const dim = daysInMonth(year, monthIndex);
  return Math.min(Math.max(1, day), dim);
}

/** HH:mm, 00–23 e 00–59 */
function parseHm(raw: string): { h: number; m: number } | null {
  const t = raw.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

type Props = {
  ministryId: string;
  userId: string;
  isAdmin: boolean;
};

export function MinistryScheduleTab({ ministryId, userId, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleSlots, setRoleSlots] = useState('1');
  const [forEventId, setForEventId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['ministry-events', ministryId],
    queryFn: async () => (await api.getEvents(ministryId)) as EventRow[],
  });

  const rolesQuery = useQuery({
    queryKey: ['ministry-event-roles', ministryId],
    queryFn: async () => (await api.getEventRoles(ministryId)) as RoleRow[],
  });

  const assignsQuery = useQuery({
    queryKey: ['ministry-assignments', ministryId],
    queryFn: async () => (await api.getAssignments(ministryId)) as AssignRow[],
  });

  const countsByDay = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of eventsQuery.data ?? []) {
      const k = dayKey(new Date(e.startsAt));
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [eventsQuery.data]);

  const eventsOnSelectedDay = useMemo(() => {
    if (selectedDay == null) return [];
    const y = month.getFullYear();
    const m = month.getMonth();
    return (eventsQuery.data ?? []).filter((e) => {
      const d = new Date(e.startsAt);
      return d.getFullYear() === y && d.getMonth() === m && d.getDate() === selectedDay;
    });
  }, [eventsQuery.data, month, selectedDay]);

  const rolesByEvent = useMemo(() => {
    const map: Record<string, RoleRow[]> = {};
    for (const r of rolesQuery.data ?? []) {
      map[r.eventId] = map[r.eventId] ?? [];
      map[r.eventId].push(r);
    }
    return map;
  }, [rolesQuery.data]);

  const assignsByRole = useMemo(() => {
    const map: Record<string, AssignRow[]> = {};
    for (const a of assignsQuery.data ?? []) {
      map[a.roleId] = map[a.roleId] ?? [];
      map[a.roleId].push(a);
    }
    return map;
  }, [assignsQuery.data]);

  const selectedDateLabel = useMemo(() => {
    if (selectedDay == null) return null;
    const d = new Date(month.getFullYear(), month.getMonth(), selectedDay);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [month, selectedDay]);

  useEffect(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    setSelectedDay((prev) => clampDayInMonth(y, m, prev ?? 1));
  }, [month]);

  const handleSelectDay = useCallback((day: number) => {
    setErr(null);
    setSelectedDay(day);
  }, []);

  const createEvent = useCallback(async () => {
    if (selectedDay == null) {
      setErr('Selecione um dia no calendário.');
      return;
    }
    if (!eventTitle.trim()) {
      setErr('Informe o nome do evento.');
      return;
    }
    const hm = parseHm(eventTime);
    if (!hm) {
      setErr('Informe a hora no formato HH:mm (ex.: 08:30).');
      return;
    }
    const startsAt = new Date(
      month.getFullYear(),
      month.getMonth(),
      selectedDay,
      hm.h,
      hm.m,
      0,
      0
    );
    if (Number.isNaN(startsAt.getTime())) {
      setErr('Data ou hora inválida.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const created = await api.createEvent(ministryId, {
        title: eventTitle.trim(),
        startsAt: startsAt.toISOString(),
      });
      setEventTitle('');
      setForEventId(created.id);
      queryClient.invalidateQueries({ queryKey: ['ministry-events', ministryId] });
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Erro ao criar evento');
    } finally {
      setBusy(false);
    }
  }, [eventTitle, eventTime, ministryId, month, queryClient, selectedDay]);

  const addRole = useCallback(async () => {
    if (!forEventId || !roleTitle.trim()) {
      setErr('Selecione um evento e informe o cargo.');
      return;
    }
    const n = parseInt(roleSlots, 10);
    if (!Number.isFinite(n) || n < 1) {
      setErr('Vagas deve ser um número >= 1.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await api.createEventRole(ministryId, {
        eventId: forEventId,
        title: roleTitle.trim(),
        capacity: n,
      });
      setRoleTitle('');
      setRoleSlots('1');
      queryClient.invalidateQueries({ queryKey: ['ministry-event-roles', ministryId] });
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Erro ao adicionar cargo');
    } finally {
      setBusy(false);
    }
  }, [forEventId, ministryId, queryClient, roleSlots, roleTitle]);

  const takeSlot = useCallback(
    async (roleId: string) => {
      setErr(null);
      try {
        await api.createAssignment(ministryId, roleId);
        queryClient.invalidateQueries({ queryKey: ['ministry-assignments', ministryId] });
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'Erro ao ocupar vaga');
      }
    },
    [ministryId, queryClient]
  );

  const releaseSlot = useCallback(
    async (assignmentId: string) => {
      setErr(null);
      try {
        await api.deleteAssignment(ministryId, assignmentId);
        queryClient.invalidateQueries({ queryKey: ['ministry-assignments', ministryId] });
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'Erro ao sair da vaga');
      }
    },
    [ministryId, queryClient]
  );

  const prevMonth = useCallback(() => {
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  if (eventsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <MonthCalendar
        month={month}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onSelectDay={handleSelectDay}
        selectedDay={selectedDay}
        countsByDay={countsByDay}
      />

      {err ? (
        <Text style={styles.err} allowFontScaling>
          {err}
        </Text>
      ) : null}

      {isAdmin ? (
        <View style={styles.adminBox}>
          <Text style={styles.subTitle} allowFontScaling>
            Novo evento
          </Text>
          <AppTextField label="Nome (ex.: Missa dominical)" value={eventTitle} onChangeText={setEventTitle} />
          {selectedDateLabel ? (
            <Text style={styles.datePill} allowFontScaling>
              Data: {selectedDateLabel}
            </Text>
          ) : null}
          <AppTextField
            label="Hora do evento"
            value={eventTime}
            onChangeText={setEventTime}
            placeholder="08:00"
          />
          <AppButton title="Criar evento" onPress={createEvent} loading={busy} />
          <Text style={[styles.subTitle, styles.mt]} allowFontScaling>
            Cargo no evento
          </Text>
          <Text style={styles.hint} allowFontScaling>
            O último evento criado fica selecionado para adicionar cargos. Toque num evento abaixo para mudar o alvo.
          </Text>
          <AppTextField label="Título do cargo" value={roleTitle} onChangeText={setRoleTitle} />
          <AppTextField label="Vagas" value={roleSlots} onChangeText={setRoleSlots} keyboardType="number-pad" />
          <AppButton title="Adicionar cargo" onPress={addRole} loading={busy} variant="outline" />
        </View>
      ) : null}

      <Text style={[styles.subTitle, styles.mt]} allowFontScaling>
        Eventos do dia selecionado
      </Text>
      {eventsOnSelectedDay.length === 0 ? (
        <Text style={styles.muted} allowFontScaling>
          Nenhum evento neste dia.
        </Text>
      ) : (
        eventsOnSelectedDay.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            <Pressable
              onPress={() => setForEventId(ev.id)}
              style={forEventId === ev.id ? styles.eventSelected : undefined}
            >
              <Text style={styles.eventTitle} allowFontScaling>
                {ev.title}
              </Text>
              <Text style={styles.muted} allowFontScaling>
                {new Date(ev.startsAt).toLocaleString('pt-BR', {
                  weekday: 'short',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>
            </Pressable>
            {(rolesByEvent[ev.id] ?? []).map((role) => {
              const taken = assignsByRole[role.id] ?? [];
              const mine = taken.find((a) => a.userId === userId);
              const full = taken.length >= role.capacity;
              return (
                <View key={role.id} style={styles.roleRow}>
                  <Text style={styles.roleTitle} allowFontScaling>
                    {role.title} - {taken.length}/{role.capacity}
                  </Text>
                  {taken.map((a) => (
                    <View key={a.id} style={styles.assignRow}>
                      <Text style={styles.assign} allowFontScaling>
                        - {a.userName}
                      </Text>
                      {a.userId === userId ? (
                        <Pressable onPress={() => releaseSlot(a.id)} accessibilityRole="button">
                          <Text style={styles.link} allowFontScaling>
                            Sair da vaga
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                  {!mine && !full ? (
                    <Pressable onPress={() => takeSlot(role.id)} style={styles.takeBtn}>
                      <Text style={styles.takeBtnTxt} allowFontScaling>
                        Ocupar vaga
                      </Text>
                    </Pressable>
                  ) : null}
                  {full && !mine ? (
                    <Text style={styles.muted} allowFontScaling>
                      Lotado
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: spacing.xl * 2 },
  center: { padding: spacing.lg, alignItems: 'center' },
  err: { color: palette.error, marginTop: spacing.sm },
  adminBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  subTitle: { fontSize: 17, fontWeight: '700', color: palette.text },
  datePill: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.primary,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  hint: { fontSize: 13, color: palette.textSecondary, marginBottom: spacing.sm },
  mt: { marginTop: spacing.md },
  muted: { fontSize: 14, color: palette.textSecondary },
  eventCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  eventSelected: {
    backgroundColor: palette.accentSoft,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  eventTitle: { fontSize: 17, fontWeight: '700', color: palette.text },
  roleRow: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.border },
  roleTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  assign: { fontSize: 14, color: palette.textSecondary },
  link: { color: palette.primary, fontWeight: '700', fontSize: 14 },
  takeBtn: { alignSelf: 'flex-start', marginTop: spacing.xs },
  takeBtnTxt: { color: palette.primary, fontWeight: '700', fontSize: 15 },
});
