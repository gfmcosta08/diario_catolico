export type ReadingDay = {
  day: number;
  references: string[];
  /** Texto autorizado — preencha via CMS ou importação; null = mostrar apenas referências */
  body: string | null;
  optionalAudioUrl?: string | null;
};

const OT_HINTS = [
  'Gn',
  'Êx',
  'Lv',
  'Nm',
  'Dt',
  'Jos',
  'Jz',
  'Rt',
  '1Sm',
  '2Sm',
  '1Rs',
  '2Rs',
  '1Cr',
  '2Cr',
  'Ed',
  'Ne',
  'Et',
  'Jó',
  'Sl',
  'Pv',
  'Ec',
  'Ct',
  'Is',
  'Jr',
  'Lm',
  'Ez',
  'Dn',
  'Os',
  'Jl',
  'Am',
  'Ob',
  'Jn',
  'Mq',
  'Na',
  'Hc',
  'Sf',
  'Ag',
  'Zc',
  'Ml',
];

function refForDay(day: number): string[] {
  const i = day - 1;
  const ot = OT_HINTS[i % OT_HINTS.length];
  const otCh = (Math.floor(i / OT_HINTS.length) % 50) + 1;
  const psalm = (i % 150) + 1;
  const prov = (i % 31) + 1;
  const mt = (i % 28) + 1;
  return [
    `${ot} ${otCh} (trecho do Antigo Testamento — substitua pelo plano NVT 365 licenciado)`,
    `Salmos ${psalm}`,
    `Provérbios ${prov}`,
    `Evangelho sugerido: Mt ${mt} (ajuste conforme seu roteiro)`,
  ];
}

const planCache: ReadingDay[] = [];

export function getReadingPlanDay(day: number): ReadingDay {
  if (day < 1 || day > 365) {
    return {
      day: Math.min(365, Math.max(1, day)),
      references: [],
      body: null,
    };
  }
  if (!planCache[day - 1]) {
    planCache[day - 1] = {
      day,
      references: refForDay(day),
      body: null,
      optionalAudioUrl: null,
    };
  }
  return planCache[day - 1];
}

export function getAllReadingDays(): ReadingDay[] {
  return Array.from({ length: 365 }, (_, i) => getReadingPlanDay(i + 1));
}
