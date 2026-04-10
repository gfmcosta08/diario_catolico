import type { MysterySet } from '@/types/progress';

export type BeadType = 
  | 'crucifix'      
  | 'large'         
  | 'small'         
  | 'medallion'      
  | 'closing';

export type RosaryPhase = 
  | 'intro'         
  | 'decade'        
  | 'closing';

export interface RosaryBead {
  index: number;
  beadType: BeadType;
  phase: RosaryPhase;
  prayerText: string;
  displayLabel: string;
  mysteryIndex?: number;
  mysterySet?: MysterySet;
  decadeInSet?: number;
}

export interface DecadeInfo {
  mysteryIndex: number;
  mysterySet: MysterySet;
  mysteryTitle: string;
  decadeInSet: number;
}

const MYSTERY_TITLES: Record<MysterySet, string[]> = {
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

function getMysteryTitle(mysterySet: MysterySet, mysteryIndex: number): string {
  return MYSTERY_TITLES[mysterySet][mysteryIndex];
}

export const PRAYER_TEXTS = {
  sinalDaCruz: 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.',
  
  credito: `Divino Jesus, eu vos ofereço este Terço, que vou rezar, meditando em cada um dos mistérios que se seguem, e a graça de ganhar as indulgências anexas a esta santa devoção.`,

  paiNosso: `Pai Nosso, que estais nos céus,
santificado seja o Vosso nome,
venha a nós o Vosso reino,
seja feita a Vossa vontade,
assim na terra como no céu.
O pão nosso de cada dia nos dai hoje,
e perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido.
Não nos deixeis cair em tentação, mas nos livrai do mal. Amém.`,

  aveMaria: `Ave Maria, cheia de graça, o Senhor é convosco;
bendita sois Vós entre as mulheres e bendito é o fruto do Vosso ventre, Jesus.
Santa Maria, Mãe de Deus, rogai por nós, pecadores,
agora e na hora da nossa morte. Amém.`,

  gloriaAoPai: `Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio, agora e sempre. Amém.`,

  oracaoDeFatima: `Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno;
levai as almas todas para o céu
e socorrei principalmente as que mais precisarem.`,

  agradecimiento: `Infinitas graças vos damos, Soberana Rainha,
pelos benefícios que todos os dias recebemos de vossas mãos liberais.
Dignai-vos, agora e para sempre,
tomar-nos debaixo do vosso poderoso amparo
e, para mais vos suplicar, vos saudamos com uma Salve Rainha...`,

  salveRainha: `Salve Rainha, Mãe de misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos os degredados filhos de Eva.
A vós suspiramos, gemendo e chorando neste vale de lágrimas.
Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei,
e depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre.
Ó clemente, ó piedosa, ó doce e sempre Virgem Maria.
Rogai por nós, Santa Mãe de Deus.
Para que sejamos dignos das promessas de Cristo. Amém.`,

  oracaoFinal: `Ó Deus, cujo Filho Unigênito, por Sua vida, morte e ressurreição,
nos obteve o prêmio da salvação eterna,
concedei-nos, nós Vositamos,
que, meditando estes mistérios do Sacratíssimo Rosário da Bem-Aventurada Virgem Maria,
imitemos o que contêm e consigamos o que prometemos.
Por Cristo, Senhor Nosso. Amém.`,
};

export const LITAINHA_LAURETANA = [
  { invocacao: 'Senhor, tende piedade de nós.', resposta: 'Senhor, tende piedade de nós.' },
  { invocacao: 'Cristo, tende piedade de nós.', resposta: 'Cristo, tende piedade de nós.' },
  { invocacao: 'Senhor, tende piedade de nós.', resposta: 'Senhor, tende piedade de nós.' },
  { invocacao: 'Cristo, ouvi-nos.', resposta: 'Cristo, ouvi-nos.' },
  { invocacao: 'Cristo, atendei-nos.', resposta: 'Cristo, atenei-nos.' },
  { invocacao: 'Deus Pai do céu.', resposta: 'Tende piedade de nós.' },
  { invocacao: 'Deus Filho, Redentor do mundo.', resposta: 'Tende piedade de nós.' },
  { invocacao: 'Deus Espírito Santo.', resposta: 'Tende piedade de nós.' },
  { invocacao: 'Santíssima Trindade, que sois um só Deus.', resposta: 'Tende piedade de nós.' },
  { invocacao: 'Santa Maria.', resposta: 'Rogai por nós.' },
  { invocacao: 'Santa Mãe de Deus.', resposta: 'Rogai por nós.' },
  { invocacao: 'Santa Virgem das virgens.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe de Cristo.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe da Igreja.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe de misericórdia.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe da divina graça.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe da esperança.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe puríssima.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe castíssima.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe sempre virgem.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe imaculada.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe digna de amor.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe admirável.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe do bom conselho.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe do Criador.', resposta: 'Rogai por nós.' },
  { invocacao: 'Mãe do Salvador.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem prudentíssima.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem venerável.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem louvável.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem poderosa.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem clemente.', resposta: 'Rogai por nós.' },
  { invocacao: 'Virgem fiel.', resposta: 'Rogai por nós.' },
  { invocacao: 'Espelho de perfeição.', resposta: 'Rogai por nós.' },
  { invocacao: 'Sede da Sabedoria.', resposta: 'Rogai por nós.' },
  { invocacao: 'Fonte de nossa alegria.', resposta: 'Rogai por nós.' },
  { invocacao: 'Vaso espiritual.', resposta: 'Rogai por nós.' },
  { invocacao: 'Tabernáculo da eterna glória.', resposta: 'Rogai por nós.' },
  { invocacao: 'Morada consagrada a Deus.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rosa mística.', resposta: 'Rogai por nós.' },
  { invocacao: 'Torre de Davi.', resposta: 'Rogai por nós.' },
  { invocacao: 'Torre de marfim.', resposta: 'Rogai por nós.' },
  { invocacao: 'Casa de ouro.', resposta: 'Rogai por nós.' },
  { invocacao: 'Arca da aliança.', resposta: 'Rogai por nós.' },
  { invocacao: 'Porta do céu.', resposta: 'Rogai por nós.' },
  { invocacao: 'Estrela da manhã.', resposta: 'Rogai por nós.' },
  { invocacao: 'Saúde dos enfermos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Refúgio dos pecadores.', resposta: 'Rogai por nós.' },
  { invocacao: 'Socorro dos migrantes.', resposta: 'Rogai por nós.' },
  { invocacao: 'Consoladora dos aflitos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Auxílio dos cristãos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos Anjos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos Patriarcas.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos Profetas.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos Apóstolos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos Mártires.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha dos confessores da fé.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha das Virgens.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha de todos os Santos.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha concebida sem pecado original.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha assunta ao céu.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha do santo Rosário.', resposta: 'Rogai por nós.' },
  { invocacao: 'Rainha da paz.', resposta: 'Rogai por nós.' },
  { invocacao: 'Cordeiro de Deus, que tirais os pecados do mundo.', resposta: 'Perdoai-nos, Senhor.' },
  { invocacao: 'Cordeiro de Deus, que tirais os pecados do mundo.', resposta: 'Ouvi-nos, Senhor.' },
  { invocacao: 'Cordeiro de Deus, que tirais os pecados do mundo.', resposta: 'Tende piedade de nós.' },
  { invocacao: 'Rogai por nós, Santa Mãe de Deus.', resposta: 'Para que sejamos dignos das promessas de Cristo.' },
];

function createIntroBeads(): RosaryBead[] {
  return [
    {
      index: 0,
      beadType: 'crucifix',
      phase: 'intro',
      prayerText: `✝ ${PRAYER_TEXTS.sinalDaCruz}\n\n${PRAYER_TEXTS.credito}`,
      displayLabel: 'Sinal da Cruz e Oferecimento',
    },
    {
      index: 1,
      beadType: 'large',
      phase: 'intro',
      prayerText: PRAYER_TEXTS.paiNosso,
      displayLabel: 'Pai-Nosso',
    },
    {
      index: 2,
      beadType: 'small',
      phase: 'intro',
      prayerText: `${PRAYER_TEXTS.aveMaria}\n\nIntenção: Fé`,
      displayLabel: 'Ave-Maria 1/3',
    },
    {
      index: 3,
      beadType: 'small',
      phase: 'intro',
      prayerText: `${PRAYER_TEXTS.aveMaria}\n\nIntenção: Esperança`,
      displayLabel: 'Ave-Maria 2/3',
    },
    {
      index: 4,
      beadType: 'small',
      phase: 'intro',
      prayerText: `${PRAYER_TEXTS.aveMaria}\n\nIntenção: Caridade`,
      displayLabel: 'Ave-Maria 3/3',
    },
    {
      index: 5,
      beadType: 'medallion',
      phase: 'intro',
      prayerText: `${PRAYER_TEXTS.gloriaAoPai}\n\n${PRAYER_TEXTS.oracaoDeFatima}`,
      displayLabel: 'Glória ao Pai',
    },
  ];
}

function createDecadeBeads(
  mysterySet: MysterySet,
  mysteryIndex: number,
  startIndex: number
): RosaryBead[] {
  const mysteryTitle = getMysteryTitle(mysterySet, mysteryIndex);
  const beads: RosaryBead[] = [];

  beads.push({
    index: startIndex,
    beadType: 'large',
    phase: 'decade',
    prayerText: `Mistério: ${mysteryTitle}\n\n${PRAYER_TEXTS.paiNosso}`,
    displayLabel: `Mistério ${mysteryIndex + 1}: ${mysteryTitle}`,
    mysteryIndex,
    mysterySet,
    decadeInSet: mysteryIndex,
  });

  for (let i = 1; i <= 10; i++) {
    beads.push({
      index: startIndex + i,
      beadType: 'small',
      phase: 'decade',
      prayerText: `${PRAYER_TEXTS.aveMaria}\n\n(${i}/10)`,
      displayLabel: `Ave-Maria ${i}/10`,
      mysteryIndex,
      mysterySet,
      decadeInSet: mysteryIndex,
    });
  }

  return beads;
}

function createClosingBead(): RosaryBead {
  return {
    index: 58,
    beadType: 'closing',
    phase: 'closing',
    prayerText: PRAYER_TEXTS.agradecimiento,
    displayLabel: 'Agradecimento',
  };
}

function createGloriaBead(decadeIndex: number): RosaryBead {
  return {
    index: 6 + (decadeIndex * 11) + 10,
    beadType: 'medallion',
    phase: 'decade',
    prayerText: `${PRAYER_TEXTS.gloriaAoPai}\n\n${PRAYER_TEXTS.oracaoDeFatima}`,
    displayLabel: 'Glória ao Pai',
    mysteryIndex: decadeIndex,
  };
}

export function createDailyRosaryBeads(mysterySet: MysterySet): RosaryBead[] {
  const beads: RosaryBead[] = [];
  
  for (const bead of createIntroBeads()) {
    beads.push({ ...bead });
  }
  
  let decadeIndex = 0;
  for (let i = 0; i < 5; i++) {
    const decadeBeads = createDecadeBeads(mysterySet, i, beads.length);
    for (const bead of decadeBeads) {
      beads.push({ ...bead });
    }
    
    if (i < 4) {
      beads.push({
        ...createGloriaBead(decadeIndex),
        index: beads.length,
      });
    }
    decadeIndex++;
  }
  
  beads.push({ ...createClosingBead(), index: beads.length });
  
  return beads;
}

export function createFullRosaryBeads(mysterySets: MysterySet[]): RosaryBead[] {
  const beads: RosaryBead[] = [];
  
  for (const bead of createIntroBeads()) {
    beads.push({ ...bead });
  }
  
  let globalDecadeIndex = 0;
  
  for (const mysterySet of mysterySets) {
    for (let i = 0; i < 5; i++) {
      const decadeBeads = createDecadeBeads(mysterySet, i, beads.length);
      for (const bead of decadeBeads) {
        beads.push({ ...bead });
      }
      
      beads.push({
        index: beads.length,
        beadType: 'medallion',
        phase: 'decade',
        prayerText: `${PRAYER_TEXTS.gloriaAoPai}\n\n${PRAYER_TEXTS.oracaoDeFatima}`,
        displayLabel: 'Glória ao Pai',
        mysteryIndex: globalDecadeIndex,
        mysterySet,
        decadeInSet: i,
      });
      
      globalDecadeIndex++;
    }
  }
  
  beads.push({ ...createClosingBead(), index: beads.length });
  
  return beads;
}

export function getDecadeInfoForBead(bead: RosaryBead): DecadeInfo | null {
  if (bead.mysterySet !== undefined && bead.mysteryIndex !== undefined) {
    return {
      mysteryIndex: bead.mysteryIndex,
      mysterySet: bead.mysterySet,
      mysteryTitle: getMysteryTitle(bead.mysterySet, bead.mysteryIndex),
      decadeInSet: bead.decadeInSet ?? bead.mysteryIndex,
    };
  }
  return null;
}

export const TOTAL_BEADS_DAILY = 59;
export const TOTAL_BEADS_FULL = 206;
