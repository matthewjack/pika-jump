// Every Pokémon in the game: HP, moves, evolutions and how it moves around.
// Change these numbers to make battles easier or harder, or add new moves.
// (Each Pokémon can have up to 3 moves — the 4th menu slot is BACK.)

export type MoveEffect = 'bolt' | 'spark' | 'dash' | 'tackle' | 'fire' | 'water' | 'leaf' | 'wind' | 'bug' | 'psychic';

export interface Move {
  name: string;
  /** Damage at level 5. Higher levels hit a little harder (see damageAt). */
  damage: number;
  /** Chance to hit, from 0 (never) to 1 (always). */
  accuracy: number;
  effect: MoveEffect;
}

export interface Species {
  name: string;
  /** HP at level 5. Each level adds 2 more (see maxHpAt). */
  maxHp: number;
  moves: Move[];
  /** Walking speed when wild. */
  speed: number;
  /** Flies back and forth instead of walking. */
  flies?: boolean;
  /** Evolves into this Pokémon on reaching this level. */
  evolvesTo?: { species: SpeciesId; level: number };
}

export type SpeciesId =
  | 'pikachu' | 'raichu'
  | 'rattata' | 'raticate'
  | 'pidgey' | 'pidgeotto'
  | 'caterpie' | 'metapod' | 'butterfree'
  | 'bulbasaur' | 'ivysaur'
  | 'charmander' | 'charmeleon'
  | 'squirtle' | 'wartortle';

export const SPECIES: Record<SpeciesId, Species> = {
  pikachu: {
    name: 'PIKACHU',
    maxHp: 30,
    speed: 40,
    evolvesTo: { species: 'raichu', level: 10 },
    moves: [
      { name: 'THUNDERBOLT', damage: 10, accuracy: 0.8, effect: 'bolt' },
      { name: 'THUNDER SHOCK', damage: 6, accuracy: 0.95, effect: 'spark' },
      { name: 'QUICK ATTACK', damage: 5, accuracy: 1, effect: 'dash' },
    ],
  },
  raichu: {
    name: 'RAICHU',
    maxHp: 38,
    speed: 40,
    moves: [
      { name: 'THUNDER', damage: 15, accuracy: 0.7, effect: 'bolt' },
      { name: 'THUNDERBOLT', damage: 12, accuracy: 0.85, effect: 'bolt' },
      { name: 'QUICK ATTACK', damage: 6, accuracy: 1, effect: 'dash' },
    ],
  },
  rattata: {
    name: 'RATTATA',
    maxHp: 20,
    speed: 35,
    evolvesTo: { species: 'raticate', level: 9 },
    moves: [
      { name: 'TACKLE', damage: 3, accuracy: 0.95, effect: 'tackle' },
      { name: 'BITE', damage: 5, accuracy: 0.85, effect: 'tackle' },
      { name: 'HYPER FANG', damage: 7, accuracy: 0.75, effect: 'dash' },
    ],
  },
  raticate: {
    name: 'RATICATE',
    maxHp: 28,
    speed: 40,
    moves: [
      { name: 'HYPER FANG', damage: 9, accuracy: 0.85, effect: 'dash' },
      { name: 'BITE', damage: 6, accuracy: 0.95, effect: 'tackle' },
      { name: 'QUICK ATTACK', damage: 5, accuracy: 1, effect: 'dash' },
    ],
  },
  pidgey: {
    name: 'PIDGEY',
    maxHp: 18,
    speed: 40,
    flies: true,
    evolvesTo: { species: 'pidgeotto', level: 9 },
    moves: [
      { name: 'GUST', damage: 5, accuracy: 0.95, effect: 'wind' },
      { name: 'QUICK ATTACK', damage: 4, accuracy: 1, effect: 'dash' },
      { name: 'WING ATTACK', damage: 7, accuracy: 0.85, effect: 'tackle' },
    ],
  },
  pidgeotto: {
    name: 'PIDGEOTTO',
    maxHp: 28,
    speed: 45,
    flies: true,
    moves: [
      { name: 'WING ATTACK', damage: 9, accuracy: 0.9, effect: 'tackle' },
      { name: 'GUST', damage: 7, accuracy: 0.95, effect: 'wind' },
      { name: 'QUICK ATTACK', damage: 5, accuracy: 1, effect: 'dash' },
    ],
  },
  caterpie: {
    name: 'CATERPIE',
    maxHp: 14,
    speed: 18,
    evolvesTo: { species: 'metapod', level: 7 },
    moves: [
      { name: 'TACKLE', damage: 3, accuracy: 0.95, effect: 'tackle' },
      { name: 'BUG BITE', damage: 4, accuracy: 0.9, effect: 'bug' },
    ],
  },
  metapod: {
    name: 'METAPOD',
    maxHp: 22,
    speed: 10,
    evolvesTo: { species: 'butterfree', level: 9 },
    moves: [
      { name: 'TACKLE', damage: 4, accuracy: 0.95, effect: 'tackle' },
      { name: 'BUG BITE', damage: 5, accuracy: 0.9, effect: 'bug' },
    ],
  },
  butterfree: {
    name: 'BUTTERFREE',
    maxHp: 30,
    speed: 35,
    flies: true,
    moves: [
      { name: 'CONFUSION', damage: 10, accuracy: 0.85, effect: 'psychic' },
      { name: 'GUST', damage: 7, accuracy: 0.95, effect: 'wind' },
      { name: 'BUG BITE', damage: 6, accuracy: 1, effect: 'bug' },
    ],
  },
  bulbasaur: {
    name: 'BULBASAUR',
    maxHp: 26,
    speed: 25,
    evolvesTo: { species: 'ivysaur', level: 9 },
    moves: [
      { name: 'VINE WHIP', damage: 6, accuracy: 0.95, effect: 'leaf' },
      { name: 'RAZOR LEAF', damage: 8, accuracy: 0.8, effect: 'leaf' },
      { name: 'TACKLE', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
  ivysaur: {
    name: 'IVYSAUR',
    maxHp: 34,
    speed: 25,
    moves: [
      { name: 'RAZOR LEAF', damage: 11, accuracy: 0.85, effect: 'leaf' },
      { name: 'VINE WHIP', damage: 8, accuracy: 0.95, effect: 'leaf' },
      { name: 'TACKLE', damage: 5, accuracy: 1, effect: 'tackle' },
    ],
  },
  charmander: {
    name: 'CHARMANDER',
    maxHp: 24,
    speed: 30,
    evolvesTo: { species: 'charmeleon', level: 9 },
    moves: [
      { name: 'EMBER', damage: 7, accuracy: 0.95, effect: 'fire' },
      { name: 'FLAMETHROWER', damage: 10, accuracy: 0.75, effect: 'fire' },
      { name: 'SCRATCH', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
  charmeleon: {
    name: 'CHARMELEON',
    maxHp: 32,
    speed: 32,
    moves: [
      { name: 'FLAMETHROWER', damage: 12, accuracy: 0.8, effect: 'fire' },
      { name: 'EMBER', damage: 9, accuracy: 0.95, effect: 'fire' },
      { name: 'SLASH', damage: 6, accuracy: 1, effect: 'dash' },
    ],
  },
  squirtle: {
    name: 'SQUIRTLE',
    maxHp: 26,
    speed: 28,
    evolvesTo: { species: 'wartortle', level: 9 },
    moves: [
      { name: 'WATER GUN', damage: 7, accuracy: 0.95, effect: 'water' },
      { name: 'BUBBLE', damage: 5, accuracy: 1, effect: 'water' },
      { name: 'TACKLE', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
  wartortle: {
    name: 'WARTORTLE',
    maxHp: 34,
    speed: 30,
    moves: [
      { name: 'HYDRO PUMP', damage: 13, accuracy: 0.75, effect: 'water' },
      { name: 'WATER GUN', damage: 9, accuracy: 0.95, effect: 'water' },
      { name: 'BITE', damage: 6, accuracy: 1, effect: 'tackle' },
    ],
  },
};

/** Pokémon that can turn up when the level map says 'E'. */
export const RANDOM_WILD: SpeciesId[] = ['rattata', 'caterpie', 'bulbasaur', 'charmander', 'squirtle'];

/** Most Pokémon you can have on your team, like the real games. */
export const MAX_TEAM = 6;

/** Chance a thrown Poké Ball catches the wild Pokémon. */
export const CATCH_CHANCE = 0.5;

// ---------- Levels ----------

export const START_LEVEL = 5;

/** XP needed to go up one level. */
export const XP_PER_LEVEL = 25;

/** XP for beating (or catching) a wild Pokémon of this level. */
export function xpForWin(wildLevel: number) {
  return 10 + wildLevel * 3;
}

export function maxHpAt(species: SpeciesId, level: number) {
  return Math.max(5, SPECIES[species].maxHp + (level - START_LEVEL) * 2);
}

export function damageAt(move: Move, level: number) {
  return Math.max(1, move.damage + Math.floor((level - START_LEVEL) / 2));
}
