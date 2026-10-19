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
  q: '#98d870', // light green
  R: '#e05030', // charmeleon red
  v: '#8890e0', // wartortle blue
  i: '#f088a8', // pink
  P: '#5848a0', // butterfree purple
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

const RAICHU = withFeet(
  [
    'b..........b....',
    'bb........bb....',
    'bnb......bnb....',
    '.bnb....bnb.....',
    '..nnnnnnnn......',
    '.nnnnnnnnnn.....',
    '.nnknnnnknn..yy.',
    '.yynnnknnyy.yy..',
    '.yynnnnnnyy.yy..',
    '..nnnnnnnn..k...',
    '.nnnllllnnn.k...',
    '.nnllllllnnk....',
    '..nllllllnk.....',
    '..nnnnnnnn......',
  ],
  [
    ['...nn....nn.....', '..bnn....nnb....'],
    ['..nn......nn....', '.bn........nb...'],
    ['...nnnnnnnn.....', '....bb..bb......'],
  ],
);

const RATICATE = withFeet(
  [
    '.......mm.mm....',
    '......mmmmmm....',
    '.....mmmmmrmm...',
    '....mmmmmmmmmmk.',
    'k..mmmmmmmmmlwwk',
    '.kmmmmmmmmmllww.',
    '..mmmmmmmmlll...',
    '.mmmmmmmmllll...',
    'mmmmmmmlllll....',
    'm.mmmmmmmmm.....',
  ],
  [
    ['...mm....mm.....', '..mmm...mmm.....'],
    ['....mm..mm......', '...mmm.mmm......'],
    ['...mmmmmmmm.....', '..mm.....mm.....'],
  ],
);

const PIDGEOTTO_WINGS_DOWN = [
  '.....rry........',
  '......rryy......',
  '.......rbbbb....',
  '......bbbbkwb...',
  '......bbbbkkbo..',
  '.....bbllllbboo.',
  '.bbbbbblllllb...',
  'bmmmmbbllllllb..',
  '.bmmmmbllllllb..',
  '..bmmmmbllllb...',
  '...bbbbbbbbb....',
  '....bbbbbbbb....',
  '.....o....o.....',
  '....oo...oo.....',
];
const PIDGEOTTO_WINGS_UP = [
  '.....rry........',
  '......rryy......',
  '.bb....rbbbb....',
  '.bmmb.bbbbkwb...',
  '..bmmmbbbbkkbo..',
  '...bmmbllllbboo.',
  '....bbblllllb...',
  '.....bbllllllb..',
  '......bllllllb..',
  '......bbllllb...',
  '...bbbbbbbbb....',
  '....bbbbbbbb....',
  '.....o....o.....',
  '....oo...oo.....',
];
const PIDGEOTTO = [PIDGEOTTO_WINGS_DOWN, PIDGEOTTO_WINGS_UP, PIDGEOTTO_WINGS_UP];

const METAPOD_BODY = [
  '.......gggg.....',
  '......ggggqg....',
  '.....gggggqgg...',
  '.....ggkkkgggg..',
  '.....ggggggggg..',
  '....ggggggggGg..',
  '....gGggggggGg..',
  '....ggGgggggg...',
  '....gggGggggg...',
  '....ggggGgggg...',
  '.....ggggggg....',
  '.....gggggg.....',
  '......gggg......',
];
// Metapod can't walk, so it hops: the second frame sits one pixel higher.
const METAPOD = [METAPOD_BODY, [...METAPOD_BODY, '................'], [...METAPOD_BODY, '................', '................']];

const BUTTERFREE_OPEN = [
  '....k......k....',
  '.....k....k.....',
  'kkk...PPPP...kkk',
  'kwwkk.PrrP.kkwwk',
  'kwwwwkPPPPkwwwwk',
  'kwwkwwkPPkwwkwwk',
  '.kwwwwkPPkwwwwk.',
  '..kkkkkPPkkkkk..',
  '..kwwwkPPkwwwk..',
  '...kwwkPPkwwk...',
  '....kk.PP.kk....',
  '.......kk.......',
  '................',
];
const BUTTERFREE_CLOSED = [
  '....k......k....',
  '.....k....k.....',
  '......PPPP......',
  '....kkPrrPkk....',
  '...kwwkPPkwwk...',
  '...kwwwPPwwwk...',
  '...kwwkPPkwwk...',
  '....kwkPPkwk....',
  '....kwwPPwwk....',
  '.....kkPPkk.....',
  '.......PP.......',
  '.......kk.......',
  '................',
];
const BUTTERFREE = [BUTTERFREE_OPEN, BUTTERFREE_CLOSED, BUTTERFREE_OPEN];

const IVYSAUR = withFeet(
  [
    '.....iii........',
    '....iiiii.......',
    '..gg.iii.gg.....',
    '.ggggGiGgggg....',
    '..gggGGGggg.tt..',
    '...gggggg..tttt.',
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

const CHARMELEON = withFeet(
  [
    '....R...........',
    '.....RRRRR......',
    '....RRRRRRR.....',
    '....RRRRRkwR....',
    '....RRRRRkkRR...',
    '....RRRRRRRRRR..',
    '.....RRRRRRRR...',
    '......RRRR......',
    '.....RllllR.R...',
    '..r..RRllllRR...',
    '.ryr.RRllllR....',
    '.ryr.RRllllRR...',
    '..RRRRRllllRR...',
    '......RRllRR....',
  ],
  [
    ['......RR..RR....', '.....RRR..RRR...'],
    ['.......RRRR.....', '......RRR.RRR...'],
    ['......RRRRRR....', '.....RR....RR...'],
  ],
);

const WARTORTLE = withFeet(
  [
    '....w..vvvv.....',
    '...wwwvvvvvv....',
    '....wvvvvvkwv...',
    '.....vvvvvkkv...',
    '.....vvvvvvvvvv.',
    '......vvvvvvvv..',
    '.ww.bbbblllv....',
    'wwwwbbmbbllllv..',
    '.wwwbmmmbllllv..',
    '..wwbbmbbllll...',
    '...wbbbbbllll...',
    '....bbbbbblll...',
  ],
  [
    ['.....vv..vv.....', '....vvv..vvv....'],
    ['......vvvv......', '.....vvv.vvv....'],
    ['.....vvvvvv.....', '....vv....vv....'],
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
  raichu: RAICHU,
  raticate: RATICATE,
  pidgeotto: PIDGEOTTO,
  metapod: METAPOD,
  butterfree: BUTTERFREE,
  ivysaur: IVYSAUR,
  charmeleon: CHARMELEON,
  wartortle: WARTORTLE,
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
