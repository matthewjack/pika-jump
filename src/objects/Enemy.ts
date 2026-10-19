import Phaser from 'phaser';
import { TILE } from '../config';
import { fitBodyToArt } from '../art/textures';
import { SPECIES, type SpeciesId } from '../pokemon/species';

/** How far a flying Pokémon goes before turning back. */
const FLY_RANGE = 4 * TILE;

/** A wild Pokémon wandering the level. Bump into it to battle! */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  readonly species: SpeciesId;
  readonly level: number;
  private awake = false;
  private readonly speed: number;
  private readonly flies: boolean;
  private readonly homeX: number;
  private readonly homeY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, species: SpeciesId, level: number) {
    super(scene, x, y, species, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.species = species;
    this.level = level;
    this.speed = SPECIES[species].speed;
    this.flies = SPECIES[species].flies ?? false;
    this.homeX = x;
    this.homeY = y;
    fitBodyToArt(this.body, species, 1);
    this.anims.play(`${species}-walk`);
  }

  /** Call after adding to a physics group, since groups reset body settings. */
  setup() {
    this.setCollideWorldBounds(true);
    this.body.setAllowGravity(!this.flies);
    this.setFlipX(true);
  }

  /** Wild Pokémon stand still until they come on screen, like in Mario. */
  wake() {
    if (this.awake) return;
    this.awake = true;
    this.body.setVelocityX(-this.speed);
  }

  /** Walk in the direction away from x (used after the player runs from a battle). */
  walkAwayFrom(x: number) {
    this.awake = true;
    this.body.setVelocityX(this.x < x ? -this.speed : this.speed);
  }

  update(time: number) {
    if (!this.awake || !this.body.enable) return;
    // Turn around on bumping into a wall.
    if (this.body.blocked.left) this.body.setVelocityX(this.speed);
    else if (this.body.blocked.right) this.body.setVelocityX(-this.speed);

    if (this.flies) {
      if (this.x < this.homeX - FLY_RANGE) this.body.setVelocityX(this.speed);
      else if (this.x > this.homeX + FLY_RANGE) this.body.setVelocityX(-this.speed);
      this.y = this.homeY + Math.sin(time / 300) * 6;
    }
    this.setFlipX(this.body.velocity.x < 0);
  }

  /** Fainted after losing a battle. */
  faint() {
    this.body.enable = false;
    this.anims.stop();
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      y: this.y + 3,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }
}
