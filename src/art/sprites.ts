// Pixel-art sprites drawn as text. Each character is one pixel and maps to a
// colour in PALETTE ('.' is transparent). Edit these to change how things look,
// or see the README for swapping in PNG sprite sheets instead.

export const PALETTE: Record<string, string> = {
  k: '#202020', // black / outline
  w: '#ffffff', // white
  y: '#f8d030', // pikachu yellow
  o: '#c88820', // dark yellow shading
  r: '#e03828', // red
  b: '#8b5a2b', // brown
  p: '#9058b8', // rattata purple
  l: '#f0e0b0', // cream
};

const PIKA_TOP = [
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
];

// Two walk frames plus a jump frame — only the feet change.
export const PIKA_FRAMES = [
  [...PIKA_TOP, '...yy....yy.....', '..oyy....yyo....'],
  [...PIKA_TOP, '..yy......yy....', '.oy........yo...'],
  [...PIKA_TOP, '...yyyyyyyy.....', '....oo..oo......'],
];

const RAT_TOP = [
  '...pp..pp.......',
  '..pppppppp......',
  '.pprpppppppp....',
  'kpppppppppppp..p',
  '.wwlppppppppppp.',
  '..llllppppppp...',
  '...llllllppp....',
];

export const RAT_FRAMES = [
  [...RAT_TOP, '...pp....pp.....'],
  [...RAT_TOP, '....pp..pp......'],
];

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
