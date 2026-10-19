// Battle numbers — change these to make battles easier or harder.

export type MoveEffect = 'thunderbolt' | 'shock' | 'dash' | 'tackle' | 'bite';

export interface Move {
  name: string;
  damage: number;
  /** Chance to hit, from 0 (never) to 1 (always). */
  accuracy: number;
  effect: MoveEffect;
}

export const PIKACHU_MAX_HP = 30;
export const RATTATA_MAX_HP = 20;

export const PIKACHU_MOVES: Move[] = [
  { name: 'THUNDERBOLT', damage: 10, accuracy: 0.8, effect: 'thunderbolt' },
  { name: 'THUNDER SHOCK', damage: 6, accuracy: 0.95, effect: 'shock' },
  { name: 'QUICK ATTACK', damage: 5, accuracy: 1, effect: 'dash' },
];

export const RATTATA_MOVES: Move[] = [
  { name: 'TACKLE', damage: 3, accuracy: 0.95, effect: 'tackle' },
  { name: 'BITE', damage: 5, accuracy: 0.85, effect: 'bite' },
];
