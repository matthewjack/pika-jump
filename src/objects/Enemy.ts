import Phaser from 'phaser';

const WALK_SPEED = 35;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private awake = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'rattata', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(14, 8);
    this.anims.play('rat-walk');
  }

  /** Enemies stand still until they come on screen, like in Mario. */
  wake() {
    if (this.awake) return;
    this.awake = true;
    this.body.setVelocityX(-WALK_SPEED);
  }

  update() {
    if (!this.awake || !this.body.enable) return;
    // Turn around on bumping into a wall. Sprite faces left by default.
    if (this.body.blocked.left) this.body.setVelocityX(WALK_SPEED);
    else if (this.body.blocked.right) this.body.setVelocityX(-WALK_SPEED);
    this.setFlipX(this.body.velocity.x > 0);
  }

  squash() {
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
