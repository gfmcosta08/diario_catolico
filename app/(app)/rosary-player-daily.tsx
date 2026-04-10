import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RosaryPlayer } from '@/components/RosaryPlayer';
import { MYSTERY_TITLES } from '@/data/rosary';
import { palette } from '@/constants/theme';
import { createRosarySession } from '@/services/rosarySessionService';

export const options = { title: 'Rezar o Terço Mariano' };

export default function RosaryPlayerDailyScreen() {
  const session = useMemo(() => createRosarySession('terco_mariano'), []);
  const mysterySet = session.meta.mysterySets[0];
  const mysteryTitles = MYSTERY_TITLES[mysterySet];
  const beads = session.steps;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, beads.length - 1));
  }, [beads.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
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
        sessionMeta={session.meta}
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
