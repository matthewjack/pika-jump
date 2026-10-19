import Phaser from 'phaser';
import { createAnimations, createTextures } from '../art/textures';
import { startingTeam } from '../pokemon/team';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createTextures(this);
    createAnimations(this);
    this.registry.set({ score: 0, balls: 0, lives: 3, team: startingTeam(), active: 0 });
    this.scene.start('Game');
  }
}
