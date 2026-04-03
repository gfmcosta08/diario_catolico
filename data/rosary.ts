import type { MysterySet } from '@/types/progress';

/** Regra do PRD: Seg/Sáb Gozosos; Ter/Sex Dolorosos; Qua/Dom Gloriosos; Qui Luminosos */
export function getMysterySetForWeekday(date: Date): MysterySet {
  const d = date.getDay(); // 0 Sun ... 6 Sat
  if (d === 1 || d === 6) return 'joyful'; // Mon, Sat
  if (d === 2 || d === 5) return 'sorrowful'; // Tue, Fri
  if (d === 3 || d === 0) return 'glorious'; // Wed, Sun
  return 'luminous'; // Thu
}

export const FULL_ROSARY_ORDER: MysterySet[] = [
  'joyful',
  'luminous',
  'sorrowful',
  'glorious',
];

export const MYSTERY_TITLES: Record<MysterySet, string[]> = {
  joyful: [
    'Anunciação do anjo a Maria',
    'Visitação de Maria a Santa Isabel',
    'Nascimento do Menino Jesus em Belém',
    'Apresentação do Menino Jesus no templo',
    'Encontro do Menino Jesus no templo',
  ],
  luminous: [
    'Batismo de Jesus no Jordão',
    'Auto-revelação nas bodas de Caná',
    'Anúncio do Reino e convite à conversão',
    'Transfiguração de Jesus',
    'Instituição da Eucaristia',
  ],
  sorrowful: [
    'Agonia de Jesus no horto',
    'Flagelação de Jesus',
    'Coroação de espinhos',
    'Jesus carrega a cruz a caminho do Calvário',
    'Crucifixão e morte de Jesus',
  ],
  glorious: [
    'Ressurreição de Jesus',
    'Ascensão de Jesus ao céu',
    'Vinda do Espírito Santo sobre os apóstolos',
    'Assunção de Maria ao céu',
    'Coroação de Maria como rainha do céu e da terra',
  ],
};

export const INTRO_TEXT = {
  cross:
    'Pelo sinal da Santa Cruz, livrai-nos, ó Senhor, dos nossos inimigos. Em nome do Pai, e do Filho, e do Espírito Santo. Amém.',
  offering:
    'Creio em Deus Pai todo-poderoso, Criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor; que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria, padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos; creio no Espírito Santo; na Santa Igreja Católica; na comunhão dos santos; na remissão dos pecados; na ressurreição da carne; na vida eterna. Amém.',
  paiNossoInicial: 'Pai Nosso que estais nos céus...',
  aveIntentions: [
    'Em honra da fé — Ave Maria...',
    'Em honra da esperança — Ave Maria...',
    'Em honra da caridade — Ave Maria...',
  ] as const,
  gloriaIntro:
    'Glória ao Pai, e ao Filho, e ao Espírito Santo... Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno...',
  decadeBlock: (mysteryTitle: string) =>
    `Mistério: ${mysteryTitle}\n\n1 Pai Nosso, 10 Ave-Marias, Glória e Ó meu Jesus.`,
  closing:
    'Infinitas graças vos damos, soberana Rainha... Salve Rainha, Mãe de misericórdia...',
};

function introIds(): string[] {
  return [
    'intro:cross',
    'intro:offering',
    'intro:pai',
    'intro:ave:1',
    'intro:ave:2',
    'intro:ave:3',
    'intro:gloria',
  ];
}

function decadeIds(set: MysterySet, decadeIndex: number): string[] {
  const base = `${set}:d${decadeIndex}`;
  return [
    `${base}:mystery`,
    `${base}:pai`,
    ...Array.from({ length: 10 }, (_, i) => `${base}:ave:${i + 1}`),
    `${base}:gloria`,
  ];
}

/** IDs do terço diário (um conjunto de 5 mistérios) */
export function getDailyRosaryIds(mysterySet: MysterySet): string[] {
  const ids: string[] = [...introIds()];
  for (let i = 0; i < 5; i++) {
    ids.push(...decadeIds(mysterySet, i));
  }
  ids.push('outro:closing');
  return ids;
}

/** IDs do rosário completo: intro + 20 dezenas + encerramento */
export function getFullRosaryIds(): string[] {
  const ids: string[] = [...introIds()];
  let globalDecade = 0;
  for (const set of FULL_ROSARY_ORDER) {
    for (let i = 0; i < 5; i++) {
      ids.push(...decadeIds(set, i).map((id) => `full:${globalDecade}:${id}`));
      globalDecade++;
    }
  }
  ids.push('outro:closing');
  return ids;
}

export function labelForId(
  id: string,
  context: { mode: 'daily' | 'full'; mysterySet?: MysterySet }
): string {
  if (id === 'intro:cross') return 'Sinal da Cruz e oferecimento';
  if (id === 'intro:offering') return 'Credo na cruz';
  if (id === 'intro:pai') return 'Pai Nosso inicial';
  if (id.startsWith('intro:ave:')) {
    const n = id.split(':')[2];
    return `Ave Maria (${n}/3) — intenção`;
  }
  if (id === 'intro:gloria') return 'Glória e Ó meu Jesus (após as três Ave-Marias)';
  if (id === 'outro:closing') return 'Agradecimento e Salve Rainha';

  const parseDecade = (): { set: MysterySet; decadeInSet: number } | null => {
    if (context.mode === 'daily') {
      const m = id.match(/^(\w+):d(\d+):/);
      if (!m) return null;
      return { set: m[1] as MysterySet, decadeInSet: parseInt(m[2], 10) };
    }
    if (context.mode === 'full') {
      const m = id.match(/^full:(\d+):(\w+):d(\d+):/);
      if (!m) return null;
      const global = parseInt(m[1], 10);
      const set = m[2] as MysterySet;
      return { set, decadeInSet: parseInt(m[3], 10) };
    }
    return null;
  };

  const dec = parseDecade();
  if (dec) {
    const title = MYSTERY_TITLES[dec.set][dec.decadeInSet];
    if (id.endsWith(':mystery')) return `Mistério: ${title}`;
    if (id.endsWith(':pai')) return 'Pai Nosso';
    if (id.includes(':ave:')) return `Ave Maria (${id.split(':ave:')[1]}/10)`;
    if (id.endsWith(':gloria')) return 'Glória e Ó meu Jesus';
  }

  return id;
}

export function getDecadeMeta(
  id: string,
  context: { mode: 'daily' | 'full'; mysterySet?: MysterySet }
): { set: MysterySet; decadeInSet: number; globalDecade?: number } | null {
  if (context.mode === 'daily') {
    const m = id.match(/^(\w+):d(\d+):/);
    if (!m) return null;
    return {
      set: m[1] as MysterySet,
      decadeInSet: parseInt(m[2], 10),
    };
  }
  if (context.mode === 'full') {
    const m = id.match(/^full:(\d+):(\w+):d(\d+):/);
    if (!m) return null;
    return {
      set: m[2] as MysterySet,
      decadeInSet: parseInt(m[3], 10),
      globalDecade: parseInt(m[1], 10),
    };
  }
  return null;
}
