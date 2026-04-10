import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RosaryPlayer } from '@/components/RosaryPlayer';
import { createFullRosaryBeads } from '@/data/rosary-beads';
import { FULL_ROSARY_ORDER, MYSTERY_TITLES } from '@/data/rosary';
import { palette } from '@/constants/theme';
import type { MysterySet } from '@/types/progress';

export const options = { title: 'Rosário Completo' };

export default function RosaryPlayerFullScreen() {
  const mysterySets = FULL_ROSARY_ORDER;
  
  const allMysteryTitles = useMemo(() => {
    const titles: string[] = [];
    for (const set of mysterySets) {
      titles.push(...MYSTERY_TITLES[set]);
    }
    return titles;
  }, []);
  
  const beads = useMemo(() => createFullRosaryBeads(mysterySets as MysterySet[]), [mysterySets]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, beads.length - 1));
  }, [beads.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const mysterySet = useMemo(() => {
    const bead = beads[currentIndex];
    if (bead?.mysterySet) {
      return bead.mysterySet;
    }
    return 'joyful' as MysterySet;
  }, [currentIndex, beads]);

  return (
    <View style={styles.container}>
      <RosaryPlayer
        beads={beads}
        currentIndex={currentIndex}
        onAdvance={handleAdvance}
        onBack={handleBack}
        mysterySet={mysterySet}
        mysteryTitles={allMysteryTitles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
});
