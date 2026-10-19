import type { SpeciesId } from '../pokemon/species';

// Pixel-art sprites drawn as text. Each character is one pixel and maps to a
// colour in PALETTE ('.' is transparent). Edit these to change how things look,
// or see the README for swapping in PNG sprite sheets instead.
//
// Every Pokémon faces RIGHT and has 3 frames: walk 1, walk 2, jump.
// Frames shorter than 16 rows are lined up along the bottom.

export const PALETTE: Record<string, string> = {
  k: '#202020', // black / outline
  w: '#ffffff', // white
  y: '#f8d030', // pikachu yellow
  o: '#c88820', // dark yellow
  r: '#e03828', // red
  b: '#8b5a2b', // brown
  m: '#c89058', // light brown
  p: '#9058b8', // rattata purple
  l: '#f0e0b0', // cream
  n: '#f08838', // charmander orange
  u: '#70b8f0', // squirtle blue
  t: '#70c8a0', // bulbasaur teal
  d: '#3c9070', // dark teal
  g: '#58b030', // green
  G: '#2f7a1c', // dark green
};

/** Builds walk/walk/jump frames from a shared top half and three pairs of feet. */
function withFeet(top: string[], feet: [string[], string[], string[]]) {
  return feet.map((f) => [...top, ...f]);
}

/** Flips art left-to-right. */
function mirror(rows: string[]) {
  return rows.map((row) => [...row.padEnd(16, '.')].reverse().join(''));
}

const PIKACHU = withFeet(
  [
    '.k..........k...',
    '.kk........kk...',
    '.yk........ky...',
    '.yy........yy...',
    '..yy......yy....',
    '..yyyyyyyyyy....',
    '.yyyyyyyyyyyy.yy',
    '.yykyyyyyykyy.yy',
    '.yykyyyyyykyyyyo',
    '.rryyyykyyyrryo.',
    '.rryyyyyyyyrrb..',
    '..yyyyyyyyyyb...',
    '..yyyyyyyyyy....',
    '...yyyyyyyy.....',
  ],
  [
    ['...yy....yy.....', '..oyy....yyo....'],
    ['..yy......yy....', '.oy........yo...'],
    ['...yyyyyyyy.....', '....oo..oo......'],
  ],
);

const RATTATA_LEFT = [
  '...pp..pp.......',
  '..pppppppp......',
  '.pprpppppppp....',
  'kpppppppppppp..p',
  '.wwlppppppppppp.',
  '..llllppppppp...',
  '...llllllppp....',
];
const RATTATA = [
  [...RATTATA_LEFT, '...pp....pp.....'],
  [...RATTATA_LEFT, '....pp..pp......'],
  [...RATTATA_LEFT, '...pppppppp.....'],
].map(mirror);

const PIDGEY_WINGS_DOWN = [
  '.........bbb....',
  '........bbbbb...',
  '.......bbbkwbo..',
  '.......bbbkkboo.',
  '......bbllllb...',
  '.bbbbbbllllllb..',
  'bmmmbbbllllllb..',
  '.bmmmmbllllllb..',
  '..bmmmbbllllb...',
  '...bbbbbbbbb....',
  '.....bbbbbb.....',
  '.....o...o......',
  '....oo..oo......',
];
const PIDGEY_WINGS_UP = [
  '.........bbb....',
  '........bbbbb...',
  '.bb....bbbkwbo..',
  '.bmmb..bbbkkboo.',
  '..bmmmbbllllb...',
  '...bmmbllllllb..',
  '....bbbllllllb..',
  '.....bbllllllb..',
  '......bbllllb...',
  '.......bbbbb....',
  '.....bbbbbb.....',
  '.....o...o......',
  '....oo..oo......',
];
const PIDGEY = [PIDGEY_WINGS_DOWN, PIDGEY_WINGS_UP, PIDGEY_WINGS_UP];

const CATERPIE_1 = [
  '...........r....',
  '..........rr....',
  '.........gggg...',
  '........ggggkw..',
  '..ggg...ggggkk..',
  '.ggggg.gggggggg.',
  'gggggggggggggyy.',
  'gyyggyyggyyggyy.',
  '.gg.gg.gg.gg.g..',
];
const CATERPIE_2 = [
  '...........r....',
  '..........rr....',
  '.........gggg...',
  '....g...ggggkw..',
  '...ggg..ggggkk..',
  '..ggggggggggggg.',
  '.ggggggggggggyy.',
  '.gyyggyyggyygyy.',
  '..g.gg.gg.gg.g..',
];
const CATERPIE = [CATERPIE_1, CATERPIE_2, CATERPIE_2];

const BULBASAUR = withFeet(
  [
    '.....G..........',
    '....gGg.........',
    '...ggGgg........',
    '..ggGgGgg.......',
    '..gggGggg..tt...',
    '...ggggg..tttt..',
    '..ttttttttttkwt.',
    '.tdttttttttkrtt.',
    '.ttttdtttttttttt',
    '.tttttttdttttwt.',
    '..tttttttttttt..',
    '..dttttttttttd..',
  ],
  [
    ['..tt...tt..tt...', '.ttt..ttt.ttt...'],
    ['...tt.tt...tt.tt', '..ttt.tt..ttt.tt'],
    ['..tttttttttt....', '..tt......tt....'],
  ],
);

const CHARMANDER = withFeet(
  [
    '.......nnnn.....',
    '......nnnnnn....',
    '.....nnnnnkwn...',
    '.....nnnnnkkn...',
    '.....nnnnnnnnn..',
    '......nnnnnnn...',
    '.......nnnn.....',
    '......nllll.n...',
    '..r..nnllllnn...',
    '.ryr.nnlllln....',
    '.ryr.nnllllnn...',
    '..nnnnnllllnn...',
    '......nnllnn....',
  ],
  [
    ['......nn..nn....', '.....nnn..nnn...'],
    ['.......nnnn.....', '......nnn.nnn...'],
    ['......nnnnnn....', '.....nn....nn...'],
  ],
);

const SQUIRTLE = withFeet(
  [
    '.......uuuu.....',
    '......uuuuuu....',
    '.....uuuuukwu...',
    '.....uuuuukku...',
    '.....uuuuuuuuu..',
    '......uuuuuuu...',
    '...bbbblllu.....',
    '..bbmbbllllu....',
    '.ubmmmbllllu....',
    'uubbmbbllll.....',
    '.uubbbbllll.....',
    '...bbbbblll.....',
  ],
  [
    ['.....uu..uu.....', '....uuu..uuu....'],
    ['......uuuu......', '.....uuu.uuu....'],
    ['.....uuuuuu.....', '....uu....uu....'],
  ],
);

export const POKEMON_ART: Record<SpeciesId, string[][]> = {
  pikachu: PIKACHU,
  rattata: RATTATA,
  pidgey: PIDGEY,
  caterpie: CATERPIE,
  bulbasaur: BULBASAUR,
  charmander: CHARMANDER,
  squirtle: SQUIRTLE,
};

export const POKEBALL = [
  '....kkkk....',
  '..kkrrrrkk..',
  '.krwrrrrrrk.',
  '.krrrrrrrrk.',
  'krrrrrrrrrrk',
  'kkkkkwwkkkkk',
  'kwwwkwwkwwwk',
  'kwwwwkkwwwwk',
  '.kwwwwwwwwk.',
  '.kwwwwwwwwk.',
  '..kkwwwwkk..',
  '....kkkk....',
];
