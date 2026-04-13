import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Vibration,
} from 'react-native';
import { palette, spacing } from '@/constants/theme';
import type { RosaryBead } from '@/data/rosary-beads';
import { LITAINHA_LAURETANA, PRAYER_TEXTS } from '@/data/rosary-beads';
import {
  getMysterySetLabel,
  MYSTERY_BIBLICAL_READINGS,
  MYSTERY_FRUITS,
  MYSTERY_TITLES,
} from '@/data/rosary';
import type { MysterySet, RosarySessionMeta } from '@/types/progress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BEAD_SIZE = 28;
const BEAD_SIZE_ACTIVE = 40;
const CIRCLE_RADIUS = Math.min(SCREEN_WIDTH * 0.42, 150);

type Props = {
  beads: RosaryBead[];
  currentIndex: number;
  onAdvance: () => void;
  onBack: () => void;
  mysterySet: MysterySet;
  mysteryTitles?: string[];
  sessionMeta?: RosarySessionMeta;
};

function triggerHaptic() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate(15);
  }
}

function getBeadPosition(
  index: number, 
  introEnd: number, 
  decadesPerCircle: number
): { x: number; y: number; isLarge: boolean; isMedallion: boolean } {
  
  if (index === 0) {
    return { x: CIRCLE_RADIUS, y: 0, isLarge: true, isMedallion: false };
  }
  
  if (index < introEnd) {
    const normalizedIndex = index - 1;
    const angle = (normalizedIndex / (introEnd - 1)) * (Math.PI * 0.5) - Math.PI * 0.25;
    const radius = CIRCLE_RADIUS * 0.85;
    return {
      x: CIRCLE_RADIUS + Math.cos(angle) * radius,
      y: CIRCLE_RADIUS + Math.sin(angle) * radius,
      isLarge: index === 1,
      isMedallion: false,
    };
  }
  
  if (index >= introEnd) {
    const decadeGroups = Math.floor((index - introEnd) / 11);
    const posInGroup = (index - introEnd) % 11;
    
    const groupsPerCircle = decadesPerCircle;
    const circleIndex = Math.floor(decadeGroups / groupsPerCircle);
    const posInCircle = decadeGroups % groupsPerCircle;
    
    const baseAngle = -Math.PI / 2 + circleIndex * Math.PI * 2;
    const decadeSpread = (2 * Math.PI) / groupsPerCircle;
    const angle = baseAngle + posInCircle * decadeSpread + (posInGroup / 11) * decadeSpread;
    
    const radius = CIRCLE_RADIUS * (0.5 + circleIndex * 0.25);
    const x = CIRCLE_RADIUS + Math.cos(angle) * radius;
    const y = CIRCLE_RADIUS + Math.sin(angle) * radius;
    
    return { 
      x, 
      y, 
      isLarge: posInGroup === 0, 
      isMedallion: posInGroup === 10 
    };
  }
  
  return { x: CIRCLE_RADIUS, y: CIRCLE_RADIUS, isLarge: false, isMedallion: false };
}

function RosaryBeadCircle({
  beads,
  currentIndex,
}: {
  beads: RosaryBead[];
  currentIndex: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const introEnd = 6;
  const decadesPerCircle = 5;

  return (
    <View style={styles.circleContainer}>
      <View style={[styles.circle, { width: CIRCLE_RADIUS * 2, height: CIRCLE_RADIUS * 2 }]}>
        {beads.map((bead, idx) => {
          const { x, y, isLarge, isMedallion } = getBeadPosition(idx, introEnd, decadesPerCircle);
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          
          const baseSize = isLarge ? BEAD_SIZE * 1.4 : BEAD_SIZE;
          const activeSize = isLarge ? BEAD_SIZE_ACTIVE * 1.4 : BEAD_SIZE_ACTIVE;
          const size = isActive ? activeSize : baseSize;
          
          let backgroundColor: string = palette.surface;
          let borderColor: string = palette.border;
          
          if (isPast) {
            backgroundColor = palette.primaryMuted;
            borderColor = palette.primary;
          }
          if (isActive) {
            backgroundColor = palette.primary;
            borderColor = palette.accent;
          }
          
          return (
            <Animated.View
              key={`${bead.index}-${idx}`}
              style={[
                styles.bead,
                {
                  left: x - size / 2,
                  top: y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor,
                  borderColor,
                  borderWidth: isActive ? 3 : 1,
                  transform: [{ scale: isActive ? scaleAnim : 1 }],
                },
              ]}
            >
              {bead.beadType === 'crucifix' && (
                <Text style={styles.beadCrucifix}>†</Text>
              )}
              {bead.beadType === 'closing' && (
                <Text style={styles.beadHeart}>♥</Text>
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

export function RosaryPlayer({ 
  beads, 
  currentIndex, 
  onAdvance, 
  onBack, 
  mysterySet,
  mysteryTitles,
  sessionMeta
}: Props) {
  const [showLitany, setShowLitany] = useState(false);
  const [litanyIndex, setLitanyIndex] = useState(0);
  const [showSalve, setShowSalve] = useState(false);
  
  const currentBead = beads[currentIndex];
  const resolvedMysteryTitle =
    currentBead?.mysterySet !== undefined && currentBead.decadeInSet !== undefined
      ? MYSTERY_TITLES[currentBead.mysterySet][currentBead.decadeInSet]
      : undefined;
  const decadeInfo =
    currentBead?.mysteryIndex !== undefined &&
    currentBead.mysterySet !== undefined &&
    currentBead.decadeInSet !== undefined
    ? { 
        mysteryIndex: currentBead.mysteryIndex,
        mysterySet: currentBead.mysterySet,
        mysteryTitle:
          resolvedMysteryTitle || mysteryTitles?.[currentBead.mysteryIndex] || currentBead.displayLabel,
        decadeInSet: currentBead.decadeInSet,
      }
    : null;
  
  const totalSteps = sessionMeta?.totalSteps ?? beads.length;
  const progress = ((currentIndex + 1) / totalSteps) * 100;
  const isClosing = currentBead?.phase === 'closing';

  const handleAdvance = useCallback(() => {
    triggerHaptic();
    
    if (isClosing && !showLitany) {
      setShowLitany(true);
      setLitanyIndex(0);
      return;
    }
    
    if (showLitany && litanyIndex < LITAINHA_LAURETANA.length - 1) {
      setLitanyIndex(prev => prev + 1);
      return;
    }
    
    if (showLitany && litanyIndex >= LITAINHA_LAURETANA.length - 1 && !showSalve) {
      setShowSalve(true);
      return;
    }
    
    if (currentIndex < beads.length - 1) {
      onAdvance();
    }
  }, [currentIndex, beads.length, isClosing, showLitany, litanyIndex, showSalve, onAdvance]);

  const handleBack = useCallback(() => {
    if (showSalve) {
      setShowSalve(false);
      return;
    }
    
    if (showLitany && litanyIndex > 0) {
      setLitanyIndex(prev => prev - 1);
      return;
    }
    
    if (showLitany) {
      setShowLitany(false);
      return;
    }
    
    if (currentIndex > 0) {
      onBack();
    }
  }, [currentIndex, showLitany, litanyIndex, showSalve, onBack]);

  const getDisplayText = () => {
    if (isClosing) {
      if (showLitany) {
        const item = LITAINHA_LAURETANA[litanyIndex];
        return `${item.invocacao}\n\n${item.resposta}`;
      }
      if (showSalve) {
        return PRAYER_TEXTS.salveRainha;
      }
      return PRAYER_TEXTS.agradecimiento;
    }
    
    return currentBead?.prayerText || '';
  };

  const mysteryTitle = decadeInfo?.mysteryTitle || (isClosing ? 'Encerramento' : 'Introdução');
  const mysteryIndex = decadeInfo?.mysteryIndex ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mysterySetLabel}>{getMysterySetLabel(mysterySet)}</Text>
        {sessionMeta ? (
          <Text style={styles.sessionLabel}>{sessionMeta.entryLabel}</Text>
        ) : null}
        <Text style={styles.mysteryTitle}>{mysteryTitle}</Text>
        {decadeInfo && (
          <>
            <Text style={styles.mysteryReading}>
              📖 {MYSTERY_BIBLICAL_READINGS[mysterySet]?.[mysteryIndex] || ''}
            </Text>
            <Text style={styles.mysteryFruit}>
              Fruto: {MYSTERY_FRUITS[mysterySet]?.[mysteryIndex] || ''}
            </Text>
          </>
        )}
      </View>

      <View style={styles.circleWrapper}>
        <RosaryBeadCircle
          beads={beads}
          currentIndex={currentIndex}
        />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {totalSteps}
        </Text>
      </View>

      <ScrollView 
        style={styles.prayerScroll}
        contentContainerStyle={styles.prayerContainer}
      >
        <Text style={styles.prayerLabel}>{currentBead?.displayLabel}</Text>
        <Text style={styles.prayerText}>{getDisplayText()}</Text>
        {showLitany && (
          <Text style={styles.litanyCounter}>
            {litanyIndex + 1} de {LITAINHA_LAURETANA.length}
          </Text>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable
          style={[styles.backBtn, (currentIndex === 0 && !showLitany) && styles.disabledBtn]}
          onPress={handleBack}
          disabled={currentIndex === 0 && !showLitany}
        >
          <Text style={styles.backBtnText}>◀</Text>
        </Pressable>
        
        <Pressable
          style={[styles.advanceBtn]}
          onPress={handleAdvance}
        >
          <Text style={styles.advanceBtnText}>
            {isClosing && showSalve ? 'FIM ✝' : 
             showLitany && litanyIndex >= LITAINHA_LAURETANA.length - 1 ? 'Salve Rainha' : 
             isClosing && showLitany ? '►' :
             '►'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.beadTypeIndicator}>
        <Text style={styles.beadTypeLabel}>
          {currentBead?.beadType === 'crucifix' && '† Crucifixo'}
          {currentBead?.beadType === 'large' && '◯ Pai-Nosso'}
          {currentBead?.beadType === 'small' && '• Ave-Maria'}
          {currentBead?.beadType === 'medallion' && '♦ Glória'}
          {currentBead?.beadType === 'closing' && '♥ Encerramento'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  mysterySetLabel: {
    fontSize: 11,
    color: palette.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  mysteryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    marginTop: 4,
    textAlign: 'center',
  },
  mysteryReading: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
  },
  mysteryFruit: {
    fontSize: 11,
    color: palette.primaryMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  circleContainer: {
    width: CIRCLE_RADIUS * 2 + 20,
    height: CIRCLE_RADIUS * 2 + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    position: 'relative',
  },
  bead: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  beadCrucifix: {
    fontSize: 18,
    color: palette.surface,
    fontWeight: 'bold',
  },
  beadHeart: {
    fontSize: 16,
    color: palette.surface,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
    minWidth: 55,
    textAlign: 'right',
  },
  prayerScroll: {
    flex: 1,
    marginTop: spacing.sm,
  },
  prayerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  prayerLabel: {
    fontSize: 14,
    color: palette.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prayerText: {
    fontSize: 17,
    lineHeight: 26,
    color: palette.text,
    textAlign: 'center',
  },
  litanyCounter: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  backBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  advanceBtn: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  advanceBtnText: {
    fontSize: 22,
    color: palette.surface,
    fontWeight: '700',
  },
  backBtnText: {
    fontSize: 24,
    color: palette.primary,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  beadTypeIndicator: {
    padding: spacing.sm,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
  },
  beadTypeLabel: {
    fontSize: 12,
    color: palette.text,
    fontWeight: '600',
  },
});
