import Phaser from 'phaser';
import { createAnimations, createTextures } from '../art/textures';
import { PIKACHU_MAX_HP } from '../battle/moves';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createTextures(this);
    createAnimations(this);
    this.registry.set({ score: 0, balls: 0, lives: 3, hp: PIKACHU_MAX_HP });
    this.scene.start('Game');
  }
}
