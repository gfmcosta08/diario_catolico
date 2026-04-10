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
import { getDecadeInfoForBead, LITAINHA_LAURETANA, PRAYER_TEXTS } from '@/data/rosary-beads';
import { CLOSING_PRAYERS, getMysterySetLabel, MYSTERY_BIBLICAL_READINGS, MYSTERY_FRUITS, MYSTERY_TITLES } from '@/data/rosary';
import type { MysterySet } from '@/types/progress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BEAD_SIZE = 36;
const BEAD_SIZE_ACTIVE = 48;
const CIRCLE_RADIUS = Math.min(SCREEN_WIDTH * 0.38, 160);

type Props = {
  beads: RosaryBead[];
  currentIndex: number;
  onAdvance: () => void;
  onBack: () => void;
  mysterySet: MysterySet;
  mysteryTitles?: string[];
};

function triggerHaptic() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Vibration.vibrate(10);
  }
}

function getBeadPosition(index: number, totalIntro: number, totalDecades: number, closing: number): { x: number; y: number; isLarge: boolean } {
  const introEnd = totalIntro;
  const decadesEnd = introEnd + totalDecades;
  const closingIndex = closing;

  if (index === 0) {
    return { x: CIRCLE_RADIUS, y: 0, isLarge: true };
  }
  
  if (index < introEnd) {
    const normalizedIndex = index - 1;
    const angle = (normalizedIndex / (introEnd - 1)) * (Math.PI / 3) - Math.PI / 6;
    const radius = CIRCLE_RADIUS * 0.85;
    return {
      x: CIRCLE_RADIUS + Math.cos(angle) * radius,
      y: CIRCLE_RADIUS + Math.sin(angle) * radius,
      isLarge: index === 1,
    };
  }
  
  if (index >= introEnd && index < decadesEnd) {
    const decadeIndex = Math.floor((index - introEnd) / 12);
    const posInDecade = (index - introEnd) % 12;
    
    const baseAngle = -Math.PI / 2;
    const decadeSpread = (2 * Math.PI) / 5;
    const decadeAngle = baseAngle + decadeIndex * decadeSpread + (posInDecade / 12) * decadeSpread;
    
    const radius = CIRCLE_RADIUS * 0.7;
    const x = CIRCLE_RADIUS + Math.cos(decadeAngle) * radius;
    const y = CIRCLE_RADIUS + Math.sin(decadeAngle) * radius;
    
    return { x, y, isLarge: posInDecade === 0 };
  }
  
  if (index >= decadesEnd) {
    const normalizedClosing = index - decadesEnd;
    const angle = (normalizedClosing / closing) * (Math.PI / 3) - Math.PI / 6;
    const radius = CIRCLE_RADIUS * 0.85;
    return {
      x: CIRCLE_RADIUS + Math.cos(angle) * radius,
      y: CIRCLE_RADIUS + Math.sin(angle) * radius,
      isLarge: true,
    };
  }
  
  return { x: CIRCLE_RADIUS, y: CIRCLE_RADIUS, isLarge: false };
}

function RosaryBeadCircle({
  beads,
  currentIndex,
  totalIntro,
  totalDecades,
  closing,
}: {
  beads: RosaryBead[];
  currentIndex: number;
  totalIntro: number;
  totalDecades: number;
  closing: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex, scaleAnim]);

  const introEnd = totalIntro;
  const decadesEnd = introEnd + totalDecades;

  return (
    <View style={styles.circleContainer}>
      <View style={[styles.circle, { width: CIRCLE_RADIUS * 2, height: CIRCLE_RADIUS * 2 }]}>
        {beads.map((bead, idx) => {
          const { x, y, isLarge } = getBeadPosition(idx, totalIntro, totalDecades, closing);
          const isActive = idx === currentIndex;
          const isPast = idx < currentIndex;
          
          const size = isLarge ? BEAD_SIZE * 1.3 : BEAD_SIZE;
          const activeSize = isLarge ? BEAD_SIZE_ACTIVE * 1.3 : BEAD_SIZE_ACTIVE;
          
          let backgroundColor = palette.surface;
          let borderColor = palette.border;
          
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
              key={bead.index}
              style={[
                styles.bead,
                {
                  left: x - size / 2,
                  top: y - size / 2,
                  width: isActive ? activeSize : size,
                  height: isActive ? activeSize : size,
                  borderRadius: (isActive ? activeSize : size) / 2,
                  backgroundColor,
                  borderColor,
                  borderWidth: isActive ? 3 : 1,
                  transform: [{ scale: isActive ? scaleAnim : 1 }],
                },
              ]}
            >
              {bead.beadType === 'crucifix' && (
                <Text style={styles.beadCrucifix}>✝</Text>
              )}
              {bead.beadType === 'medallion' && (
                <Text style={styles.beadMedallion}>♦</Text>
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

export function RosaryPlayer({ beads, currentIndex, onAdvance, onBack, mysterySet, mysteryTitles }: Props) {
  const [showLitany, setShowLitany] = useState(false);
  const [litanyIndex, setLitanyIndex] = useState(0);
  
  const currentBead = beads[currentIndex];
  const decadeInfo = getDecadeInfoForBead(currentBead);
  
  const totalIntro = 6;
  const totalDecades = 5 * 12;
  const closing = 1;
  
  const progress = ((currentIndex + 1) / beads.length) * 100;
  const isClosing = currentBead?.phase === 'closing';
  const isFinished = currentIndex >= beads.length - 1;

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
    
    if (currentIndex < beads.length - 1) {
      onAdvance();
    }
  }, [currentIndex, beads.length, isClosing, showLitany, litanyIndex, onAdvance]);

  const handleBack = useCallback(() => {
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
  }, [currentIndex, showLitany, litanyIndex, onBack]);

  const getDisplayText = () => {
    if (isClosing) {
      if (currentBead.displayLabel === 'Agradecimento') {
        return CLOSING_PRAYERS.agradecimiento;
      }
      if (showLitany) {
        const item = LITAINHA_LAURETANA[litanyIndex];
        return `${item.invocacao}\n\n${item.resposta}`;
      }
      if (litanyIndex >= LITAINHA_LAURETANA.length - 1) {
        return CLOSING_PRAYERS.salveRainha;
      }
    }
    
    return currentBead?.prayerText || '';
  };

  const getMysteryInfo = () => {
    if (!decadeInfo) {
      if (isClosing) {
        return { title: 'Encerramento', reading: '', fruit: '' };
      }
      return { title: 'Introdução', reading: '', fruit: '' };
    }
    
    const mysteryIndex = decadeInfo.mysteryIndex;
    return {
      title: mysteryTitles?.[mysteryIndex] || decadeInfo.mysteryTitle,
      reading: MYSTERY_BIBLICAL_READINGS[mysterySet]?.[mysteryIndex] || '',
      fruit: MYSTERY_FRUITS[mysterySet]?.[mysteryIndex] || '',
    };
  };

  const mysteryInfo = getMysteryInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mysterySetLabel}>{getMysterySetLabel(mysterySet)}</Text>
        <Text style={styles.mysteryTitle}>{mysteryInfo.title}</Text>
        {mysteryInfo.reading && (
          <Text style={styles.mysteryReading}>📖 {mysteryInfo.reading}</Text>
        )}
        {mysteryInfo.fruit && (
          <Text style={styles.mysteryFruit}>Fruto: {mysteryInfo.fruit}</Text>
        )}
      </View>

      <View style={styles.circleWrapper}>
        <RosaryBeadCircle
          beads={beads}
          currentIndex={currentIndex}
          totalIntro={totalIntro}
          totalDecades={totalDecades}
          closing={closing}
        />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {beads.length}
        </Text>
      </View>

      <ScrollView 
        style={styles.prayerScroll}
        contentContainerStyle={styles.prayerContainer}
      >
        <Text style={styles.prayerText}>{getDisplayText()}</Text>
        {isClosing && showLitany && (
          <Text style={styles.litanyCounter}>
            {litanyIndex + 1} de {LITAINHA_LAURETANA.length}
          </Text>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable
          style={[styles.controlBtn, styles.backBtn, currentIndex === 0 && styles.disabledBtn]}
          onPress={handleBack}
          disabled={currentIndex === 0 && !showLitany}
        >
          <Text style={styles.controlBtnText}>◀</Text>
        </Pressable>
        
        <Pressable
          style={[styles.controlBtn, styles.advanceBtn, isFinished && !showLitany && styles.disabledBtn]}
          onPress={handleAdvance}
          disabled={isFinished && !showLitany && litanyIndex >= LITAINHA_LAURETANA.length - 1}
        >
          <Text style={styles.advanceBtnText}>
            {isClosing && litanyIndex >= LITAINHA_LAURETANA.length - 1 ? 'FIM' : 
             showLitany && litanyIndex >= LITAINHA_LAURETANA.length - 1 ? 'Salve' : '►'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.beadTypeIndicator}>
        <Text style={styles.beadTypeLabel}>
          {currentBead?.beadType === 'crucifix' && '✝ Crucifixo - Início'}
          {currentBead?.beadType === 'large' && '◯ Conta Grande - Pai-Nosso'}
          {currentBead?.beadType === 'small' && '• Conta Pequena - Ave-Maria'}
          {currentBead?.beadType === 'medallion' && '♦ Medalha - Glória'}
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
    paddingTop: spacing.sm,
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  mysterySetLabel: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mysteryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginTop: 4,
    textAlign: 'center',
  },
  mysteryReading: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 4,
  },
  mysteryFruit: {
    fontSize: 12,
    color: palette.primaryMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
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
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  beadCrucifix: {
    fontSize: 16,
    color: palette.surface,
    fontWeight: 'bold',
  },
  beadMedallion: {
    fontSize: 14,
    color: palette.surface,
    fontWeight: 'bold',
  },
  beadHeart: {
    fontSize: 14,
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
    height: 6,
    backgroundColor: palette.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  prayerScroll: {
    flex: 1,
    marginTop: spacing.md,
  },
  prayerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  prayerText: {
    fontSize: 18,
    lineHeight: 28,
    color: palette.text,
    textAlign: 'center',
    fontWeight: '500',
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
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  advanceBtn: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: 30,
    height: 64,
  },
  advanceBtnText: {
    fontSize: 20,
    color: palette.surface,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  controlBtnText: {
    fontSize: 24,
    color: palette.primary,
    fontWeight: 'bold',
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
