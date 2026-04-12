import {
  collectRosaryProgressIds,
  createDailyRosaryBeads,
  createFullRosaryBeads,
} from '@/data/rosary-beads';
import type { MysterySet } from '@/types/progress';

export const FULL_ROSARY_ORDER: MysterySet[] = [
  'joyful',
  'luminous',
  'sorrowful',
  'glorious',
];

export const MYSTERY_TITLES: Record<MysterySet, string[]> = {
  joyful: [
    'A Anunciação a Maria',
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

export const MYSTERY_BIBLICAL_TEXTS: Record<MysterySet, string[]> = {
  joyful: [
    '«No sexto mês, o anjo Gabriel foi enviado por Deus a uma cidade da Galiléia, chamada Nazaré, a uma virgem desposada com um homem que se chamava José, da casa de Davi e o nome da virgem era Maria» (Lc 1, 26-27)',
    '«Naqueles dias, Maria levantou-se e foi com pressa para a região montanhosa, para uma cidade de Judá» (Lc 1, 39)',
    '«E aconteceu que, naquele tempo, saiu um decreto de César Augusto, mandando fazer o recenseamento de toda a terra» (Lc 2, 1)',
    '«E quando se cumpriram os dias da purificação deles, segundo a lei de Moisés, levaram-no a Jerusalem para o apresentar ao Senhor» (Lc 2, 22)',
    '«E aconteceu que, depois de três dias, o encontraram no templo, sentado no meio dos doutores, ouvindo-os e fazendo-lhes perguntas» (Lc 2, 46)',
  ],
  luminous: [
    '«E Jesus, tendo sido batizado, subiu imediatamente da água; e eis que se abriram os céus, e viu o Espírito de Deus descendo como uma pomba e vindo sobre ele» (Mt 3, 16)',
    '«E no terceiro dia houve um casório em Caná da Galiléia, e a mãe de Jesus estava lá» (Jo 2, 1)',
    '«E Jesus veio à Galiléia, pregando o evangelho do reino de Deus» (Mc 1, 14)',
    '«E, passando seis dias depois, Jesus tomou consigo a Pedro, a Tiago e a João, o seu irmão, e levou-os a um alto monte à parte» (Mt 17, 1)',
    '«E, enquanto eles comiam, Jesus tomou o pão, e, tendo-o abençoado, o partiu e o deu aos seus discípulos, dizendo: Tomai, comei, isto é o meu corpo» (Mt 26, 26)',
  ],
  sorrowful: [
    '«E, saindo, foi, segundo o seu costume, para o monte das Oliveiras; e os seus discípulos também o seguiram» (Lc 22, 39)',
    '«Então Pilatos tomou a Jesus e o flagelou» (Jo 19, 1)',
    '«E os soldados, tecendo uma coroa de espinhos, puseram-na na sua cabeça, e lhe deram uma cana na mão direita; e, dobrando-se os joelhos diante dele, o zombavam» (Mt 27, 29)',
    '«Então, então, ele lhes entregou o Jesus para que fosse crucificado» (Jo 19, 16)',
    '«E, chegando ao lugar chamado Calvário, o crucificaram ali, bem como aos criminosos, um à direita e outro à esquerda» (Lc 23, 33)',
  ],
  glorious: [
    '«E, no primeiro dia da semana, Maria Madalena foi ao sepulcro de madrugada, sendo ainda escuro, e viu que a pedra já tinha sido removida do sepulcro» (Jo 20, 1)',
    '«E, tendo dito-lhes isto, mostrou-lhes as mãos e o lado. E os discípulos se alegraram vendo o Senhor» (Jo 20, 20)',
    '«E, tendo dito isto, enquanto eles o olhavam, foi elevado; e uma nuvem o recebeu, tirando-o dos seus olhos» (At 1, 9)',
    '«E, de repente, veio do céu um som como de um vento impetuoso que encheu toda a casa onde eles estavam sentados» (At 2, 2)',
    '«E apareceu um grande sinal no céu: uma mulher vestida com o sol, tendo a lua debaixo dos pés, e sobre a cabeça uma coroa de doze estrelas» (Ap 12, 1)',
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

const ORDINAIS = ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto'] as const;

const SET_KIND_ADJECTIVE: Record<MysterySet, string> = {
  joyful: 'Gozoso',
  luminous: 'Luminoso',
  sorrowful: 'Doloroso',
  glorious: 'Glorioso',
};

/** Converte índice global 0..19 (rosário completo) em conjunto e posição dentro do conjunto. */
export function getFullDecadeContext(globalDecade: number): { set: MysterySet; decadeInSet: number } {
  const setIndex = Math.floor(globalDecade / 5);
  const decadeInSet = globalDecade % 5;
  return { set: FULL_ROSARY_ORDER[setIndex], decadeInSet };
}

/** Ex.: "Primeiro Mistério Gozoso - A Anunciação a Maria" */
export function formatMysteryHeading(set: MysterySet, decadeInSet: number): string {
  const ord = ORDINAIS[decadeInSet] ?? `${decadeInSet + 1}º`;
  const kind = SET_KIND_ADJECTIVE[set];
  const title = MYSTERY_TITLES[set][decadeInSet];
  return `${ord} Mistério ${kind} - ${title}`;
}

export function getDailyMysterySet(date: Date = new Date()): MysterySet {
  const dayOfWeek = date.getDay();

  switch (dayOfWeek) {
     case 1: // Segunda-feira
     case 6: // Sábado
       return 'joyful';
     case 2: // Terça-feira
     case 5: // Sexta-feira
       return 'sorrowful';
     case 0: // Domingo
     case 3: // Quarta-feira
       return 'glorious';
     case 4: // Quinta-feira
       return 'luminous';
    default:
      return 'glorious';
  }
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

export function getDailyRosaryIds(mysterySet: MysterySet): string[] {
  return collectRosaryProgressIds(createDailyRosaryBeads(mysterySet));
}

export function getFullRosaryIds(): string[] {
  return collectRosaryProgressIds(createFullRosaryBeads(FULL_ROSARY_ORDER));
}

export function labelForId(
  id: string,
  context: { mode: 'daily' | 'full'; mysterySet?: MysterySet }
): string {
  if (id === 'intro:sign-offering') return 'Sinal da Cruz e Oferecimento';
  if (id === 'intro:pai') return 'Pai Nosso';
  if (id.startsWith('intro:ave:')) {
    const n = id.split(':')[2];
    return `Ave Maria (${n}/3)`;
  }
  if (id === 'intro:gloria') return 'Glória ao Pai';
  if (id === 'outro:closing') return 'Agradecimento e Encerramento';

  if (context.mode === 'daily') {
    const m = id.match(/^(joyful|luminous|sorrowful|glorious):d(\d+):(open|gloria|ave:(\d+))$/);
    if (m) {
      const set = m[1] as MysterySet;
      const d = parseInt(m[2], 10);
      const tail = m[3];
      const title = MYSTERY_TITLES[set][d];
      if (tail === 'open') return `Mistério e Pai-Nosso (${title})`;
      if (tail === 'gloria') return 'Glória ao Pai';
      return `Ave Maria (${m[4]}/10)`;
    }
  }

  if (context.mode === 'full') {
    const m = id.match(/^full:(\d+):(open|gloria|ave:(\d+))$/);
    if (m) {
      const g = parseInt(m[1], 10);
      const { set, decadeInSet } = getFullDecadeContext(g);
      const tail = m[2];
      const title = MYSTERY_TITLES[set][decadeInSet];
      if (tail === 'open') return `Mistério e Pai-Nosso (${title})`;
      if (tail === 'gloria') return 'Glória ao Pai';
      return `Ave Maria (${m[3]}/10)`;
    }
  }

  return id;
}

export function getDecadeMeta(
  id: string,
  context: { mode: 'daily' | 'full'; mysterySet?: MysterySet }
): { set: MysterySet; decadeInSet: number; globalDecade?: number } | null {
  if (context.mode === 'daily') {
    const m = id.match(/^(joyful|luminous|sorrowful|glorious):d(\d+):/);
    if (!m) return null;
    return {
      set: m[1] as MysterySet,
      decadeInSet: parseInt(m[2], 10),
    };
  }
  const mFull = id.match(/^full:(\d+):/);
  if (!mFull) return null;
  const globalDecade = parseInt(mFull[1], 10);
  const { set, decadeInSet } = getFullDecadeContext(globalDecade);
  return { set, decadeInSet, globalDecade };
}
