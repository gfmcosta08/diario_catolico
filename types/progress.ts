export type RosaryMode = 'daily' | 'full';

export type RosaryProgressPayload = {
  checkedIds: string[];
};

export type MysterySet = 'joyful' | 'luminous' | 'sorrowful' | 'glorious';

export const MYSTERY_LABELS: Record<MysterySet, string> = {
  joyful: 'Mistérios Gozosos',
  luminous: 'Mistérios Luminosos',
  sorrowful: 'Mistérios Dolorosos',
  glorious: 'Mistérios Gloriosos',
};
