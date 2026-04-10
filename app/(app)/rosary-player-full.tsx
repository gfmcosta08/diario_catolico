import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RosaryPlayer } from '@/components/RosaryPlayer';
import { MYSTERY_TITLES } from '@/data/rosary';
import { palette } from '@/constants/theme';
import { createRosarySession } from '@/services/rosarySessionService';
import type { MysterySet } from '@/types/progress';

export const options = { title: 'Rezar o Santo Rosário' };

export default function RosaryPlayerFullScreen() {
  const session = useMemo(() => createRosarySession('santo_rosario'), []);
  const beads = session.steps;

  const allMysteryTitles = useMemo(() => {
    const titles: string[] = [];
    for (const set of session.meta.mysterySets) {
      titles.push(...MYSTERY_TITLES[set]);
    }
    return titles;
  }, [session.meta.mysterySets]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, beads.length - 1));
  }, [beads.length]);

  const handleBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const mysterySet = useMemo(() => {
    const bead = beads[currentIndex];
    if (bead?.mysterySet) {
      return bead.mysterySet;
    }
    return session.meta.mysterySets[0] as MysterySet;
  }, [currentIndex, beads, session.meta.mysterySets]);

  return (
    <View style={styles.container}>
      <RosaryPlayer
        beads={beads}
        currentIndex={currentIndex}
        onAdvance={handleAdvance}
        onBack={handleBack}
        mysterySet={mysterySet}
        mysteryTitles={allMysteryTitles}
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
