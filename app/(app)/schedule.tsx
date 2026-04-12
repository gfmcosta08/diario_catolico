import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const options = { title: 'Escalas', headerShown: false };

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  
  const [activeMinistry, setActiveMinistry] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!configured || !session) return;
      try {
        const myMins = await api.myMinistries();
        if (myMins.length > 0) {
          setActiveMinistry(myMins[0].ministry);
          
          const evts = await api.getEvents(myMins[0].ministry.id);
          const rls = await api.getEventRoles(myMins[0].ministry.id);
          const asgmts = await api.getAssignments(myMins[0].ministry.id);
          
          // Mapeando vagas (assignments) pra dentro das roles
          const enhancedRoles = rls.map(r => ({
            ...r,
            assignments: asgmts.filter(a => a.roleId === r.id)
          }));
          
          setEvents(evts);
          setRoles(enhancedRoles);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [configured, session]);

  const handleJoinRole = async (roleId: string) => {
    if (!activeMinistry) return;
    try {
      await api.createAssignment(activeMinistry.id, roleId);
      // Recarrega assignments
      const asgmts = await api.getAssignments(activeMinistry.id);
      setRoles(roles.map(r => ({
        ...r,
        assignments: asgmts.filter(a => a.roleId === r.id)
      })));
    } catch (err: any) {
      alert(err.message || "Erro ao assumir a vaga.");
    }
  };

  const myUserId = session?.user?.id;

  return (
    <View style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.xl),
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          }
        ]}
      >
        <Text style={styles.pageTitle}>Escalas</Text>
        <Text style={styles.pageSubtitle}>
          {activeMinistry ? `Eventos do min. ${activeMinistry.name}` : 'Acesse um ministério primeiro'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 20 }} />
        ) : events.length === 0 ? (
          <Text style={styles.emptyText}>Sem eventos cadastrados no calendário do momento.</Text>
        ) : (
          events.map(event => {
            const dateStr = new Date(event.startsAt).toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
            const eventRoles = roles.filter(r => r.eventId === event.id);

            return (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.badgeMonth}>{new Date(event.startsAt).toLocaleDateString('pt-BR', {month:'short'}).toUpperCase()}</Text>
                    <Text style={styles.badgeDay}>{new Date(event.startsAt).getDate()}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      <FontAwesome5 name="clock" size={12} /> {dateStr}
                    </Text>
                  </View>
                </View>

                {event.notes ? <Text style={styles.eventNotes}>{event.notes}</Text> : null}

                <View style={styles.rolesList}>
                  {eventRoles.length === 0 ? (
                    <Text style={styles.noRoles}>Vagas ainda não foram abertas para este evento.</Text>
                  ) : (
                    eventRoles.map(role => {
                      const isFull = role.assignments.length >= role.capacity;
                      const amIAssigned = role.assignments.some((a: any) => a.userId === myUserId);

                      return (
                        <View key={role.id} style={styles.roleRow}>
                          <View style={styles.roleInfo}>
                            <Text style={styles.roleTitle}>{role.title}</Text>
                            <Text style={styles.roleStatus}>
                              {role.assignments.length} de {role.capacity} vagas preenchidas
                            </Text>
                            {role.assignments.map((ass: any, idx: number) => (
                              <Text key={idx} style={styles.assignedName}>• {ass.userName}</Text>
                            ))}
                          </View>
                          
                          {amIAssigned ? (
                            <View style={[styles.joinBtn, styles.joinedBtn]}>
                              <FontAwesome5 name="check" size={12} color={palette.success} />
                              <Text style={[styles.joinBtnText, {color: palette.success}]}>Confirmado</Text>
                            </View>
                          ) : isFull ? (
                            <View style={[styles.joinBtn, styles.fullBtn]}>
                              <Text style={[styles.joinBtnText, {color: palette.textSecondary}]}>Lotado</Text>
                            </View>
                          ) : (
                            <Pressable style={styles.joinBtn} onPress={() => handleJoinRole(role.id)}>
                              <Text style={styles.joinBtnText}>Assumir</Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 680, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  
  eventCard: {
    backgroundColor: palette.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width:0, height:3 },
    shadowRadius: 10,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventDateBadge: {
    backgroundColor: `${palette.primary}15`,
    borderRadius: radii.md,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    marginRight: 14,
  },
  badgeMonth: { fontSize: 12, fontWeight: '700', color: palette.primary },
  badgeDay: { fontSize: 22, fontWeight: '700', color: palette.primary, marginTop: -2 },
  
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 4 },
  eventTime: { fontSize: 13, color: palette.textSecondary, fontWeight: '500' },
  eventNotes: { fontSize: 14, color: palette.textSecondary, fontStyle: 'italic', marginBottom: spacing.md },

  rolesList: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.md,
  },
  noRoles: {
    fontSize: 13, color: palette.textSecondary, fontStyle: 'italic'
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: palette.background,
    padding: 14,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  roleInfo: { flex: 1, paddingRight: 10 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: palette.text, marginBottom: 2 },
  roleStatus: { fontSize: 12, color: palette.textSecondary, marginBottom: 4 },
  assignedName: { fontSize: 13, color: palette.primary, fontWeight: '500', marginLeft: 4, marginTop: 2 },

  joinBtn: {
    backgroundColor: palette.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  joinBtnText: { color: palette.surface, fontWeight: '700', fontSize: 13 },
  
  joinedBtn: { backgroundColor: `${palette.success}15`, borderWidth: 1, borderColor: palette.success },
  fullBtn: { backgroundColor: palette.border, opacity: 0.7 },
  
  emptyText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontStyle: 'italic',
    marginTop: 30,
  }
});
