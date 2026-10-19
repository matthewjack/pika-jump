import type Phaser from 'phaser';
import { MAX_TEAM, SPECIES, type SpeciesId } from './species';

// The player's team lives in the game registry so it survives level restarts.

export interface TeamMember {
  species: SpeciesId;
  hp: number;
}

type Registry = Phaser.Data.DataManager;

export function getTeam(registry: Registry): TeamMember[] {
  return registry.get('team');
}

export function saveTeam(registry: Registry, team: TeamMember[]) {
  registry.set('team', team.map((m) => ({ ...m })));
}

export function getActiveIndex(registry: Registry): number {
  return registry.get('active');
}

export function setActiveIndex(registry: Registry, index: number) {
  registry.set('active', index);
}

export function getActive(registry: Registry): TeamMember {
  return getTeam(registry)[getActiveIndex(registry)];
}

export function startingTeam(): TeamMember[] {
  return [{ species: 'pikachu', hp: SPECIES.pikachu.maxHp }];
}

export function healAll(registry: Registry) {
  saveTeam(registry, getTeam(registry).map((m) => ({ ...m, hp: SPECIES[m.species].maxHp })));
}

/** Heals the active Pokémon a little (if it hasn't fainted). */
export function healActive(registry: Registry, amount: number) {
  const team = getTeam(registry);
  const member = team[getActiveIndex(registry)];
  if (member.hp > 0) member.hp = Math.min(SPECIES[member.species].maxHp, member.hp + amount);
  saveTeam(registry, team);
}

export function teamIsFull(registry: Registry) {
  return getTeam(registry).length >= MAX_TEAM;
}
