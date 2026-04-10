import type { MysterySet } from '@/types/progress';

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
    'Ressurreição do Senhor',
    'Ascensão do Senhor aos céus',
    'Vinda do Espírito Santo sobre os apóstolos',
    'Assunção de Nossa Senhora ao céu',
    'Coroação de Maria como Rainha do Céu e da terra',
  ],
};

export const MYSTERY_BIBLICAL_READINGS: Record<MysterySet, string[]> = {
  joyful: [
    'Lucas 1, 26-38',
    'Lucas 1, 39-56',
    'Lucas 2, 1-20',
    'Lucas 2, 22-40',
    'Lucas 2, 41-52',
  ],
  luminous: [
    'Mateus 3, 13-17',
    'João 2, 1-12',
    'Marcos 1, 14-15',
    'Mateus 17, 1-9',
    'Mateus 26, 26-30',
  ],
  sorrowful: [
    'Lucas 22, 39-46',
    'Mateus 27, 15-31',
    'Mateus 27, 27-37',
    'João 19, 16-22',
    'Lucas 23, 33-46',
  ],
  glorious: [
    'Lucas 24, 1-12',
    'Atos 1, 6-14',
    'Atos 2, 1-14',
    'Apocalipse 12, 1-6',
    'Apocalipse 12, 1-12',
  ],
};

export const MYSTERY_FRUITS: Record<MysterySet, string[]> = {
  joyful: [
    'Humildade e submissão à vontade de Deus',
    'Amor ao próximo e caridade ativa',
    'Desapego às riquezas',
    'Obediência e pureza de intenção',
    'Busca por Jesus e zelo pelas coisas de Deus',
  ],
  luminous: [
    'Filiação divina e promessas batismais',
    'Intercessão de Maria para salvar famílias',
    'Contrição sincera e desejo de mudança',
    'Força para enfrentar as provas da vida',
    'Amor eucarístico e devoção',
  ],
  sorrowful: [
    'Arrependimento dos pecados',
    'Mortificação dos sentidos e pureza do corpo',
    'Humildade e mortificação intelectual',
    'Aceitação paciente das tribulações',
    'Perdão aos inimigos e esperança na salvação',
  ],
  glorious: [
    'Fé inabalável na ressurreição',
    'Esperança e desejo do céu',
    'Zelo evangelizador e dons do Espírito Santo',
    'Devoção mariana filial',
    'Esperança na recompensa eterna',
  ],
};

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = (((h + l - 7 * m + 114) % 31) + 1);
  return new Date(year, month - 1, day);
}

function getAshWednesdayYear(year: number): Date {
  const easter = getEasterDate(year);
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(ashWednesday.getDate() - 46);
  return ashWednesday;
}

function getAdventStart(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const dayOfWeek = christmas.getDay();
  const daysToGoBack = dayOfWeek === 0 ? 7 : dayOfWeek;
  const start = new Date(christmas);
  start.setDate(start.getDate() - daysToGoBack - 7);
  return start;
}

function isInLent(date: Date): boolean {
  const year = date.getFullYear();
  const ashWednesday = getAshWednesdayYear(year);
  const easter = getEasterDate(year);
  return date >= ashWednesday && date < easter;
}

function isInAdvent(date: Date): boolean {
  const year = date.getFullYear();
  const adventStart = getAdventStart(year);
  const christmas = new Date(year, 11, 25);
  return date >= adventStart && date < christmas;
}

function isInPaschal(date: Date): boolean {
  const year = date.getFullYear();
  const easter = getEasterDate(year);
  const pentecost = new Date(easter);
  pentecost.setDate(pentecost.getDate() + 49);
  return date >= easter && date < pentecost;
}

export function getLiturgicalMysterySet(date: Date): MysterySet {
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) {
    if (isInAdvent(date)) {
      return 'joyful';
    }
    if (isInLent(date)) {
      return 'sorrowful';
    }
    if (isInPaschal(date)) {
      return 'glorious';
    }
    return 'glorious';
  }
  
  switch (dayOfWeek) {
    case 1: return 'joyful';
    case 2: return 'sorrowful';
    case 3: return 'glorious';
    case 4: return 'luminous';
    case 5: return 'luminous';
    case 6: return 'sorrowful';
    default: return 'glorious';
  }
}

export function getMysterySetForWeekday(date: Date): MysterySet {
  return getLiturgicalMysterySet(date);
}

export function getMysterySetLabel(set: MysterySet): string {
  const labels: Record<MysterySet, string> = {
    joyful: 'Mistérios Gozosos',
    luminous: 'Mistérios Luminosos',
    sorrowful: 'Mistérios Dolorosos',
    glorious: 'Mistérios Gloriosos',
  };
  return labels[set];
}

export const INTRO_TEXT = {
  cross: 'Pelo sinal da Santa Cruz, livrai-nos, ó Senhor, dos nossos inimigos. Em nome do Pai, e do Filho, e do Espírito Santo. Amém.',
  offering: 'Divino Jesus, eu vos ofereço este Terço, que vou rezar, meditando em cada um dos mistérios que se seguem, e a graça de ganhar as indulgências anexas a esta santa devoção.',
  paiNossoInicial: 'Pai Nosso, que estais nos céus, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu.',
  aveIntentions: [
    'Em honra da fé — Ave Maria, cheia de graça...',
    'Em honra da esperança — Ave Maria, cheia de graça...',
    'Em honra da caridade — Ave Maria, cheia de graça...',
  ] as const,
  gloriaIntro: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.',
  decadeBlock: (mysteryTitle: string) =>
    `Mistério: ${mysteryTitle}\n\n1 Pai Nosso, 10 Ave-Marias, Glória e Ó meu Jesus.\n\nÓ meu Jesus, perdoai-nos, livrai-nos do fogo do inferno; levai as almas todas para o céu e socorrei principalmente as que mais precisarem.`,
  closing: 'Infinitas graças vos damos, Soberana Rainha, pelos benefícios que todos os dias recebemos de vossas mãos liberais. Dignai-vos, agora e para sempre, tomar-nos debaixo do vosso poderoso amparo e, para mais vos suplicar, vos saudamos com uma Salve Rainha...',
};

export const CLOSING_PRAYERS = {
  agradecimiento: 'Infinitas graças vos damos, Soberana Rainha, pelos benefícios que todos os dias recebemos de vossas mãos liberais. Dignai-vos, agora e para sempre, tomar-nos debaixo do vosso poderoso amparo e, para mais vos suplicar, vos saudamos com uma Salve Rainha...',
  salveRainha: `Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve!
A vós bradamos os degredados filhos de Eva.
A vós suspiramos, gemendo e chorando neste vale de lágrimas.
Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei,
e depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre.
Ó clemente, ó piedosa, ó doce e sempre Virgem Maria.
Rogai por nós, Santa Mãe de Deus.
Para que sejamos dignos das promessas de Cristo. Amém.`,
  oracaoFinal: `Ó Deus, cujo Filho Unigênito, por Sua vida, morte e ressurreição, nos obteve o prêmio da salvação eterna, concedei-nos, nós Vos pedimos, que, meditando estes mistérios do Sacratíssimo Rosário da Bem-Aventurada Virgem Maria, imitemos o que contêm e consigamos o que prometem. Por Cristo, Senhor Nosso. Amém.`,
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

export function getDailyRosaryIds(mysterySet: MysterySet): string[] {
  const ids: string[] = [...introIds()];
  for (let i = 0; i < 5; i++) {
    ids.push(...decadeIds(mysterySet, i));
  }
  ids.push('outro:closing');
  return ids;
}

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
  if (id === 'intro:cross') return 'Sinal da Cruz e Credo';
  if (id === 'intro:offering') return 'Oferecimento do Terço';
  if (id === 'intro:pai') return 'Pai Nosso';
  if (id.startsWith('intro:ave:')) {
    const n = id.split(':')[2];
    return `Ave Maria (${n}/3)`;
  }
  if (id === 'intro:gloria') return 'Glória ao Pai';
  if (id === 'outro:closing') return 'Agradecimento e Encerramento';

  const parseDecade = (): { set: MysterySet; decadeInSet: number } | null => {
    if (context.mode === 'daily') {
      const m = id.match(/^(\w+):d(\d+):/);
      if (!m) return null;
      return { set: m[1] as MysterySet, decadeInSet: parseInt(m[2], 10) };
    }
    if (context.mode === 'full') {
      const m = id.match(/^full:(\d+):(\w+):d(\d+):/);
      if (!m) return null;
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
    if (id.endsWith(':gloria')) return 'Glória ao Pai';
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
