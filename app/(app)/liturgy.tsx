import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { palette, spacing, radii, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const options = { title: 'Liturgia Diária', headerShown: false };

export default function LiturgyScreen() {
  const insets = useSafeAreaInsets();
  const [liturgy, setLiturgy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://liturgia.up.railway.app/')
      .then(res => res.json())
      .then(data => {
        setLiturgy(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={{ marginTop: 10, color: palette.textSecondary }}>Buscando a liturgia de hoje...</Text>
      </View>
    );
  }

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
        <Text style={styles.pageTitle}>Liturgia Diária</Text>
        <Text style={styles.pageSubtitle}>{liturgy?.data || 'Hoje'}</Text>

        <View style={styles.liturgicalColorBanner}>
          <Text style={styles.liturgicalColorText}>
            Cor Litúrgica: <Text style={{fontWeight: '700', textTransform: 'capitalize'}}>{liturgy?.cor || 'Desconhecida'}</Text>
          </Text>
        </View>

        {liturgy?.primeiraLeitura && (
          <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <Text style={styles.badgeLabel}>PRIMEIRA LEITURA</Text>
              <Text style={styles.chapterTitle}>{liturgy.primeiraLeitura.referencia}</Text>
            </View>
            <Text style={styles.verseText}>
              {liturgy.primeiraLeitura.texto}
            </Text>
          </View>
        )}

        {liturgy?.salmo && (
          <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <Text style={styles.badgeLabel}>SALMO RESPONSORIAL</Text>
              <Text style={styles.chapterTitle}>{liturgy.salmo.referencia}</Text>
            </View>
            <Text style={styles.verseText}>
              <Text style={styles.responseRef}>R: {liturgy.salmo.refrao}</Text>
              {"\n\n"}
              {liturgy.salmo.texto}
            </Text>
          </View>
        )}

        {liturgy?.segundaLeitura && (
          <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <Text style={styles.badgeLabel}>SEGUNDA LEITURA</Text>
              <Text style={styles.chapterTitle}>{liturgy.segundaLeitura.referencia}</Text>
            </View>
            <Text style={styles.verseText}>
              {liturgy.segundaLeitura.texto}
            </Text>
          </View>
        )}

        {liturgy?.evangelho && (
          <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <Text style={styles.badgeLabel}>EVANGELHO</Text>
              <Text style={styles.chapterTitle}>{liturgy.evangelho.referencia}</Text>
            </View>
            <Text style={styles.verseText}>
              {liturgy.evangelho.texto}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { paddingHorizontal: spacing.xl, maxWidth: 920, alignSelf: 'center', width: '100%' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: palette.primary, marginBottom: 4, fontFamily: typography.fonts.heading },
  pageSubtitle: { fontSize: 16, color: palette.textSecondary, marginBottom: spacing.xl, fontFamily: typography.fonts.body },
  
  liturgicalColorBanner: {
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.lg,
  },
  liturgicalColorText: {
    color: palette.text,
    fontSize: 15,
  },

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
  responseRef: {
    fontWeight: '700',
    color: palette.primary,
  }
});
