import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RosaryPlayer } from '@/components/RosaryPlayer';
import { createDailyRosaryBeads } from '@/data/rosary-beads';
import { FULL_ROSARY_ORDER, getLiturgicalMysterySet, MYSTERY_TITLES } from '@/data/rosary';
import { palette } from '@/constants/theme';

export const options = { title: 'Rosário Completo' };

export default function RosaryPlayerFullScreen() {
  const mysterySets = FULL_ROSARY_ORDER;
  
  const allMysteryTitles = useMemo(() => {
    const titles: string[] = [];
    for (const set of mysterySets) {
      titles.push(...MYSTERY_TITLES[set]);
    }
    return titles;
  }, [mysterySets]);
  
  const beads = useMemo(() => {
    const allBeads: ReturnType<typeof createDailyRosaryBeads>[] = [];
    
    for (const mysterySet of mysterySets) {
      allBeads.push(...createDailyRosaryBeads(mysterySet));
    }
    
    return allBeads;
  }, [mysterySets]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, beads.length - 1));
  }, [beads.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const mysterySet = useMemo(() => {
    const decadeIndex = Math.floor((currentIndex - 6) / 12);
    const setIndex = Math.floor(decadeIndex / 5);
    return mysterySets[Math.min(setIndex, mysterySets.length - 1)];
  }, [currentIndex, mysterySets]);

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
