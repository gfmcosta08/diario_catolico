export type RosaryMode = 'daily' | 'full';
export type RosaryStartMode = 'terco_mariano' | 'santo_rosario';

export type RosaryProgressPayload = {
  checkedIds: string[];
};

export type MysterySet = 'joyful' | 'luminous' | 'sorrowful' | 'glorious';

export type RosarySessionMeta = {
  mode: RosaryStartMode;
  mysterySets: MysterySet[];
  totalMysteries: number;
  totalAveMarias: number;
  totalSteps: number;
  entryLabel: string;
};

export const MYSTERY_LABELS: Record<MysterySet, string> = {
  joyful: 'Mistérios Gozosos',
  luminous: 'Mistérios Luminosos',
  sorrowful: 'Mistérios Dolorosos',
  glorious: 'Mistérios Gloriosos',
};
