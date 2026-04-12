import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const options = { title: 'Rosário', headerShown: false };

export default function RosaryScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  
  // Exemplo de mistérios simplificado para a interface
  const beads = Array.from({ length: 50 }, (_, i) => `bead-${i}`);

  useEffect(() => {
    if (configured && session) {
      api.getRosaryProgress('daily').then(res => setCheckedIds(res.checkedIds || [])).catch(console.error);
    }
  }, [configured, session]);

  const toggleBead = async (id: string) => {
    const newIds = checkedIds.includes(id) 
      ? checkedIds.filter(checkedId => checkedId !== id)
      : [...checkedIds, id];
      
    setCheckedIds(newIds);
    if (configured && session) {
      api.setRosaryProgress('daily', newIds).catch(console.error);
    }
  };

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
        <Text style={styles.pageTitle}>Santo Rosário</Text>
        <Text style={styles.pageSubtitle}>Mistérios Dolorosos (Terça e Sexta)</Text>

        <View style={styles.card}>
          <Text style={styles.mysteryTitle}>1º Mistério: A Agonia de Jesus no Horto</Text>
          <Text style={styles.mysteryDesc}>"Pai, se queres, afasta de mim este cálice; contudo, não se faça a minha vontade, mas a tua." (Lc 22, 42)</Text>
          
          <View style={styles.beadsContainer}>
            {beads.slice(0, 10).map((id, index) => {
              const isChecked = checkedIds.includes(id);
              return (
                <Pressable
                  key={id}
                  style={[styles.beadBtn, isChecked && styles.beadBtnActive]}
                  onPress={() => toggleBead(id)}
                >
                  <Text style={[styles.beadNumber, isChecked && styles.beadNumberActive]}>
                    {index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.progressWrap}>
            <Text style={styles.progressText}>Progresso do Mistério</Text>
            <Text style={styles.progressPercent}>
              {Math.floor((checkedIds.filter(c => beads.slice(0,10).includes(c)).length / 10) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.mysteryTitle}>2º Mistério: A Flagelação de Jesus</Text>
          <Text style={styles.mysteryDesc}>"Pilatos mandou então flagelar Jesus." (Jo 19, 1)</Text>
          
          <View style={styles.beadsContainer}>
            {beads.slice(10, 20).map((id, index) => {
              const isChecked = checkedIds.includes(id);
              return (
                <Pressable
                  key={id}
                  style={[styles.beadBtn, isChecked && styles.beadBtnActive]}
                  onPress={() => toggleBead(id)}
                >
                  <Text style={[styles.beadNumber, isChecked && styles.beadNumberActive]}>
                    {index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        
        {/* Outros mistérios podem vir iterativamente via FlatList ou Map real do Backend */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 920, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
  },
  mysteryTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: spacing.sm },
  mysteryDesc: { fontSize: 14, color: palette.textSecondary, marginBottom: spacing.lg, fontStyle: 'italic' },
  beadsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  beadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: palette.primary,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadBtnActive: {
    backgroundColor: palette.primary,
  },
  beadNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.primary,
  },
  beadNumberActive: {
    color: palette.surface,
  },
  progressWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  progressText: { fontSize: 13, color: palette.textSecondary, fontWeight: '600' },
  progressPercent: { fontSize: 13, color: palette.primary, fontWeight: '700' }
});
