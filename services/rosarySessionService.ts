import {
  createDailyRosaryBeads,
  createFullRosaryBeads,
  type RosaryBead,
} from '@/data/rosary-beads';
import { FULL_ROSARY_ORDER, getDailyMysterySet, getMysterySetLabel } from '@/data/rosary';
import type { MysterySet, RosarySessionMeta, RosaryStartMode } from '@/types/progress';

export type RosarySession = {
  steps: RosaryBead[];
  meta: RosarySessionMeta;
};

function getTercoMarianoMysterySet(now: Date): MysterySet {
  return getDailyMysterySet(now);
}

function resolveMysterySets(startMode: RosaryStartMode, now: Date): MysterySet[] {
  if (startMode === 'santo_rosario') {
    return [...FULL_ROSARY_ORDER];
  }
  return [getTercoMarianoMysterySet(now)];
}

function getEntryLabel(mode: RosaryStartMode, mysterySets: MysterySet[]): string {
  if (mode === 'santo_rosario') {
    return 'Santo Rosario';
  }

  return `Terco Mariano - ${getMysterySetLabel(mysterySets[0])}`;
}

export function createRosarySession(startMode: RosaryStartMode, now: Date = new Date()): RosarySession {
  const mysterySets = resolveMysterySets(startMode, now);
  const steps =
    startMode === 'santo_rosario'
      ? createFullRosaryBeads(mysterySets)
      : createDailyRosaryBeads(mysterySets[0]);

  const totalMysteries = mysterySets.length * 5;
  const totalAveMarias = totalMysteries * 10;

  return {
    steps,
    meta: {
      mode: startMode,
      mysterySets,
      totalMysteries,
      totalAveMarias,
      totalSteps: steps.length,
      entryLabel: getEntryLabel(startMode, mysterySets),
    },
  };
}