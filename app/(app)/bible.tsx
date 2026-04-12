import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const options = { title: 'Bíblia', headerShown: false };

export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const { configured, session } = useAuth();
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const currentDay = 1; // Fixo no 1 para o escopo desta versão

  useEffect(() => {
    if (configured && session) {
      api.getBibleProgress().then(res => setCompletedDays(res.checkedDays || [])).catch(console.error);
    }
  }, [configured, session]);

  const toggleDayCompletion = async () => {
    const isDone = completedDays.includes(currentDay);
    if (!isDone) {
      setCompletedDays([...completedDays, currentDay]);
      if (configured && session) await api.toggleBibleDay(currentDay, true);
    } else {
      setCompletedDays(completedDays.filter(d => d !== currentDay));
      if (configured && session) await api.toggleBibleDay(currentDay, false);
    }
  };

  const isCompleted = completedDays.includes(currentDay);

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
        <Text style={styles.pageTitle}>Bíblia 365</Text>
        <Text style={styles.pageSubtitle}>Leitura de Hoje — Dia {currentDay}</Text>

        <View style={styles.audioPlayer}>
          <Pressable 
            style={styles.playBtn} 
            onPress={() => setAudioPlaying(!audioPlaying)}
          >
            <FontAwesome5 name={audioPlaying ? "pause" : "play"} size={20} color={palette.surface} />
          </Pressable>
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle}>Ouvir a Leitura do Dia 1</Text>
            <Text style={styles.audioTime}>{audioPlaying ? "Tocando... 1:04 / 15:30" : "15:30"}</Text>
          </View>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <Text style={styles.badgeLabel}>ANTIGO TESTAMENTO</Text>
            <Text style={styles.chapterTitle}>Gênesis 1 a 3</Text>
          </View>
          <Text style={styles.verseText}>
            <Text style={styles.verseNum}>1 </Text>No princípio Deus criou os céus e a terra. 
            <Text style={styles.verseNum}> 2 </Text>A terra, porém, estava sem forma e vazia; 
            havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.
            {"\n\n"}[...]
          </Text>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <Text style={styles.badgeLabel}>SALMO</Text>
            <Text style={styles.chapterTitle}>Salmo 1</Text>
          </View>
          <Text style={styles.verseText}>
            <Text style={styles.verseNum}>1 </Text>Bem-aventurado o homem que não anda no conselho dos ímpios, não se detém no caminho dos pecadores, nem se assenta na roda dos escarnecedores.
            {"\n\n"}[...]
          </Text>
        </View>

        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <Text style={styles.badgeLabel}>NOVO TESTAMENTO</Text>
            <Text style={styles.chapterTitle}>Mateus 1</Text>
          </View>
          <Text style={styles.verseText}>
            <Text style={styles.verseNum}>1 </Text>Livro da genealogia de Jesus Cristo, filho de Davi, filho de Abraão.
            {"\n\n"}[...]
          </Text>
        </View>

        <Pressable 
          style={[styles.finishBtn, isCompleted && styles.finishBtnDone]} 
          onPress={toggleDayCompletion}
        >
          <FontAwesome5 name={isCompleted ? "check-circle" : "circle"} size={20} color={palette.surface} />
          <Text style={styles.finishBtnText}>
            {isCompleted ? "Leitura Concluída!" : "Marcar Dia como Concluído"}
          </Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 920, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  
  audioPlayer: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.xl,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: { fontSize: 16, fontWeight: '600', color: palette.text },
  audioTime: { fontSize: 14, color: palette.textSecondary, marginTop: 2 },

  readingCard: {
    backgroundColor: palette.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  readingHeader: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingBottom: spacing.sm,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.gold,
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    fontFamily: typography.fonts.heading,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    color: palette.text,
    fontFamily: typography.fonts.body,
  },
  verseNum: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },

  finishBtn: {
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  finishBtnDone: {
    backgroundColor: palette.success,
  },
  finishBtnText: {
    color: palette.surface,
    fontSize: 18,
    fontWeight: '700',
  }
});
