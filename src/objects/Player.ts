import Phaser from 'phaser';

const RUN_ACCEL = 700;
const MAX_RUN = 130;
const GROUND_DRAG = 900;
const AIR_DRAG = 200;
const JUMP_SPEED = 330;
const JUMP_CUT_SPEED = 120; // letting go of jump early makes a shorter hop
const COYOTE_MS = 90; // you can still jump just after running off a ledge
const JUMP_BUFFER_MS = 110; // pressing jump just before landing still counts

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private keys: {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    space: Phaser.Input.Keyboard.Key;
  };
  private lastGroundedAt = 0;
  private jumpPressedAt = -Infinity;
  frozen = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pikachu', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(10, 14).setOffset(2, 2);
    this.body.setMaxVelocity(MAX_RUN, 500);
    this.setDepth(10);

    const keyboard = scene.input.keyboard!;
    this.keys = {
      cursors: keyboard.createCursorKeys(),
      space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  /** Small upward bounce, e.g. after stomping an enemy. */
  bounce() {
    this.body.setVelocityY(-220);
  }

  update(time: number) {
    if (this.frozen) return;

    const { cursors, space } = this.keys;
    const onGround = this.body.blocked.down;
    if (onGround) this.lastGroundedAt = time;

    // Run left / right
    if (cursors.left.isDown) {
      this.body.setAccelerationX(-RUN_ACCEL);
      this.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.body.setAccelerationX(RUN_ACCEL);
      this.setFlipX(false);
    } else {
      this.body.setAccelerationX(0);
    }
    this.body.setDragX(onGround ? GROUND_DRAG : AIR_DRAG);

    // Jump
    if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(space)) {
      this.jumpPressedAt = time;
    }
    const canJump = time - this.lastGroundedAt <= COYOTE_MS;
    if (canJump && time - this.jumpPressedAt <= JUMP_BUFFER_MS) {
      this.body.setVelocityY(-JUMP_SPEED);
      this.jumpPressedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
    }
    const jumpHeld = cursors.up.isDown || space.isDown;
    if (!jumpHeld && this.body.velocity.y < -JUMP_CUT_SPEED) {
      this.body.setVelocityY(-JUMP_CUT_SPEED);
    }

    // Animation
    if (!onGround) this.anims.play('pika-jump', true);
    else if (Math.abs(this.body.velocity.x) > 10) this.anims.play('pika-walk', true);
    else this.anims.play('pika-idle', true);
  }
}
