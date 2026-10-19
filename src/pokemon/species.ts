// Every Pokémon in the game: HP, moves and how it moves around.
// Change these numbers to make battles easier or harder, or add new moves.
// (Each Pokémon can have up to 3 moves — the 4th menu slot is BACK.)

export type MoveEffect = 'bolt' | 'spark' | 'dash' | 'tackle' | 'fire' | 'water' | 'leaf' | 'wind' | 'bug';

export interface Move {
  name: string;
  damage: number;
  /** Chance to hit, from 0 (never) to 1 (always). */
  accuracy: number;
  effect: MoveEffect;
}

export interface Species {
  name: string;
  maxHp: number;
  moves: Move[];
  /** Walking speed when wild. */
  speed: number;
  /** Flies back and forth instead of walking. */
  flies?: boolean;
}

export type SpeciesId = 'pikachu' | 'rattata' | 'pidgey' | 'caterpie' | 'bulbasaur' | 'charmander' | 'squirtle';

export const SPECIES: Record<SpeciesId, Species> = {
  pikachu: {
    name: 'PIKACHU',
    maxHp: 30,
    speed: 40,
    moves: [
      { name: 'THUNDERBOLT', damage: 10, accuracy: 0.8, effect: 'bolt' },
      { name: 'THUNDER SHOCK', damage: 6, accuracy: 0.95, effect: 'spark' },
      { name: 'QUICK ATTACK', damage: 5, accuracy: 1, effect: 'dash' },
    ],
  },
  rattata: {
    name: 'RATTATA',
    maxHp: 20,
    speed: 35,
    moves: [
      { name: 'TACKLE', damage: 3, accuracy: 0.95, effect: 'tackle' },
      { name: 'BITE', damage: 5, accuracy: 0.85, effect: 'tackle' },
      { name: 'HYPER FANG', damage: 7, accuracy: 0.75, effect: 'dash' },
    ],
  },
  pidgey: {
    name: 'PIDGEY',
    maxHp: 18,
    speed: 40,
    flies: true,
    moves: [
      { name: 'GUST', damage: 5, accuracy: 0.95, effect: 'wind' },
      { name: 'QUICK ATTACK', damage: 4, accuracy: 1, effect: 'dash' },
      { name: 'WING ATTACK', damage: 7, accuracy: 0.85, effect: 'tackle' },
    ],
  },
  caterpie: {
    name: 'CATERPIE',
    maxHp: 14,
    speed: 18,
    moves: [
      { name: 'TACKLE', damage: 3, accuracy: 0.95, effect: 'tackle' },
      { name: 'BUG BITE', damage: 4, accuracy: 0.9, effect: 'bug' },
    ],
  },
  bulbasaur: {
    name: 'BULBASAUR',
    maxHp: 26,
    speed: 25,
    moves: [
      { name: 'VINE WHIP', damage: 6, accuracy: 0.95, effect: 'leaf' },
      { name: 'RAZOR LEAF', damage: 8, accuracy: 0.8, effect: 'leaf' },
      { name: 'TACKLE', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
  charmander: {
    name: 'CHARMANDER',
    maxHp: 24,
    speed: 30,
    moves: [
      { name: 'EMBER', damage: 7, accuracy: 0.95, effect: 'fire' },
      { name: 'FLAMETHROWER', damage: 10, accuracy: 0.75, effect: 'fire' },
      { name: 'SCRATCH', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
  squirtle: {
    name: 'SQUIRTLE',
    maxHp: 26,
    speed: 28,
    moves: [
      { name: 'WATER GUN', damage: 7, accuracy: 0.95, effect: 'water' },
      { name: 'BUBBLE', damage: 5, accuracy: 1, effect: 'water' },
      { name: 'TACKLE', damage: 4, accuracy: 1, effect: 'tackle' },
    ],
  },
};

/** Pokémon that can turn up when the level map says 'E'. */
export const RANDOM_WILD: SpeciesId[] = ['rattata', 'caterpie', 'bulbasaur', 'charmander', 'squirtle'];

/** Most Pokémon you can have on your team, like the real games. */
export const MAX_TEAM = 6;

/** Chance a thrown Poké Ball catches the wild Pokémon. */
export const CATCH_CHANCE = 0.5;
