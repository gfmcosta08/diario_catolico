import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RosaryPlayer } from '@/components/RosaryPlayer';
import { createDailyRosaryBeads } from '@/data/rosary-beads';
import { getLiturgicalMysterySet, MYSTERY_TITLES } from '@/data/rosary';
import { palette } from '@/constants/theme';

export const options = { title: 'Terço do Dia' };

export default function RosaryPlayerDailyScreen() {
  const today = useMemo(() => new Date(), []);
  const mysterySet = useMemo(() => getLiturgicalMysterySet(today), [today]);
  const mysteryTitles = MYSTERY_TITLES[mysterySet];
  
  const beads = useMemo(() => createDailyRosaryBeads(mysterySet), [mysterySet]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, beads.length - 1));
  }, [beads.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  return (
    <View style={styles.container}>
      <RosaryPlayer
        beads={beads}
        currentIndex={currentIndex}
        onAdvance={handleAdvance}
        onBack={handleBack}
        mysterySet={mysterySet}
        mysteryTitles={mysteryTitles}
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
