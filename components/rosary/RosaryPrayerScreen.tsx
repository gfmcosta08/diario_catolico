import {
  createDailyRosaryBeads,
  createFullRosaryBeads,
} from '@/data/rosary-beads';
import {
  formatMysteryHeading,
  FULL_ROSARY_ORDER,
  getDailyMysterySet,
  getDailyRosaryIds,
  getFullRosaryIds,
  getMysterySetLabel,
  MYSTERY_BIBLICAL_TEXTS,
} from '@/data/rosary';
import { useRosaryProgress } from '@/hooks/useRosaryProgress';
import type { MysterySet, RosaryMode } from '@/types/progress';
import { palette, spacing, radii, typography } from '@/constants/theme';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  mode: RosaryMode;
};

export function RosaryPrayerScreen({ mode }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [mysterySet] = useState<MysterySet>(() => getDailyMysterySet());

  const progressMode: RosaryMode = mode;
  const allIds = useMemo(
    () => (progressMode === 'daily' ? getDailyRosaryIds(mysterySet) : getFullRosaryIds()),
    [progressMode, mysterySet]
  );

  const beads = useMemo(
    () =>
      progressMode === 'daily'
        ? createDailyRosaryBeads(mysterySet)
        : createFullRosaryBeads(FULL_ROSARY_ORDER),
    [progressMode, mysterySet]
  );

  const { toggle, isChecked, hydrated, checkedCount, total } = useRosaryProgress(progressMode, allIds);

  const pageSubtitle =
    progressMode === 'full'
      ? '20 mistérios — 200 Ave-Marias nas dezenas (+ introdução)'
      : `${getMysterySetLabel(mysterySet)} — 5 mistérios (50 Ave-Marias nas dezenas)`;

  const scrollPadTop = isDesktop ? Math.max(insets.top, spacing.lg) : spacing.md;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: scrollPadTop,
            paddingBottom: Math.max(insets.bottom, spacing.xl * 2),
          },
        ]}
      >
        {!hydrated ? (
          <ActivityIndicator style={styles.loader} color={palette.primary} />
        ) : null}

        <Text style={styles.pageTitle}>
          {progressMode === 'full' ? 'Santo Rosário Completo' : 'Terço Mariano'}
        </Text>
        <Text style={styles.pageSubtitle}>{pageSubtitle}</Text>

        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>Progresso</Text>
          <Text style={styles.progressPercent}>
            {checkedCount}/{total}
          </Text>
        </View>

        {beads.map((bead) => {
          const checked = isChecked(bead.progressId);
          const showMysteryCard =
            bead.phase === 'decade' &&
            bead.beadType === 'large' &&
            bead.mysterySet !== undefined &&
            bead.decadeInSet !== undefined;
          const bibleLine =
            showMysteryCard && bead.mysterySet !== undefined && bead.decadeInSet !== undefined
              ? MYSTERY_BIBLICAL_TEXTS[bead.mysterySet][bead.decadeInSet]
              : null;

          return (
            <View key={bead.progressId} style={styles.beadBlock}>
              {showMysteryCard && bead.mysterySet !== undefined && bead.decadeInSet !== undefined ? (
                <View style={styles.card}>
                  <Text style={styles.mysteryTitle}>
                    {formatMysteryHeading(bead.mysterySet, bead.decadeInSet)}
                  </Text>
                  {bibleLine ? <Text style={styles.mysteryDesc}>{bibleLine}</Text> : null}
                  <Text style={styles.mysteryHint}>
                    1 Pai-Nosso, 10 Ave-Marias e Glória ao Pai nesta dezena.
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.beadRow, checked && styles.beadRowChecked]}
                onPress={() => toggle(bead.progressId)}
              >
                <View style={[styles.beadDot, checked && styles.beadDotActive]}>
                  {checked ? (
                    <Text style={styles.beadDotMark} allowFontScaling>
                      ✓
                    </Text>
                  ) : null}
                </View>
                <View style={styles.beadRowText}>
                  <Text style={styles.beadLabel} allowFontScaling>
                    {bead.displayLabel}
                  </Text>
                  {bead.phase === 'intro' || bead.phase === 'closing' ? (
                    <Text style={styles.beadSnippet} numberOfLines={4} allowFontScaling>
                      {bead.prayerText.replace(/\n\n/g, ' ')}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  loader: { marginVertical: spacing.lg },
  container: {
    paddingHorizontal: spacing.xl,
    maxWidth: 920,
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 4,
    fontFamily: typography.fonts.heading,
  },
  pageSubtitle: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    fontFamily: typography.fonts.body,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
  },
  mysteryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.sm,
  },
  mysteryDesc: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  mysteryHint: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  beadBlock: {
    marginBottom: spacing.sm,
  },
  beadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  beadRowChecked: {
    borderColor: palette.primary,
    backgroundColor: palette.surface,
  },
  beadDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  beadDotActive: {
    backgroundColor: palette.primary,
  },
  beadDotMark: {
    color: palette.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  beadRowText: { flex: 1, minWidth: 0 },
  beadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 4,
  },
  beadSnippet: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  progressWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  progressText: { fontSize: 13, color: palette.textSecondary, fontWeight: '600' },
  progressPercent: { fontSize: 13, color: palette.primary, fontWeight: '700' },
});
