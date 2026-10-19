import Phaser from 'phaser';
import { TILE, VIEW_WIDTH } from '../config';
import { PIKACHU_MAX_HP } from '../battle/moves';
import { LEVEL_1 } from '../levels/level1';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';
import type { BattleData, BattleResult } from './BattleScene';

type Image = Phaser.Physics.Arcade.Image;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private balls!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private flag!: Image;
  private hud!: Phaser.GameObjects.Text;
  private worldWidth = 0;
  private worldHeight = 0;
  private headHits: Image[] = [];
  private state: 'playing' | 'battle' | 'dying' | 'won' = 'playing';
  private ranFrom: Enemy | null = null;

  constructor() {
    super('Game');
  }

  create() {
    this.state = 'playing';
    this.headHits = [];
    this.ranFrom = null;

    const rows = LEVEL_1;
    this.worldWidth = Math.max(...rows.map((r) => r.length)) * TILE;
    this.worldHeight = rows.length * TILE;

    this.createBackground();

    this.solids = this.physics.add.staticGroup();
    this.balls = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group({ runChildUpdate: true });

    let start = { x: 3 * TILE, y: 10 * TILE };
    rows.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const x = c * TILE + TILE / 2;
        const y = r * TILE + TILE / 2;
        switch (ch) {
          case '#': {
            const isTop = rows[r - 1]?.[c] !== '#';
            this.solids.create(x, y, isTop ? 'grass' : 'dirt');
            break;
          }
          case 'X':
            this.solids.create(x, y, 'stone');
            break;
          case 'B':
            this.solids.create(x, y, 'brick').setData('kind', 'brick');
            break;
          case '?':
            this.solids.create(x, y, 'question').setData('kind', 'question');
            break;
          case 'o':
            this.balls.create(x, y, 'pokeball');
            break;
          case 'E': {
            const enemy = new Enemy(this, x, (r + 1) * TILE - 4);
            this.enemies.add(enemy);
            enemy.setCollideWorldBounds(true);
            break;
          }
          case 'P':
            start = { x, y };
            break;
          case 'F':
            this.flag = this.physics.add.staticImage(x, (r + 1) * TILE, 'flag').setOrigin(0.5, 1);
            this.flag.refreshBody();
            this.flag.body!.setSize(4, this.flag.height).setOffset(10, 0);
            break;
        }
      });
    });

    this.player = new Player(this, start.x, start.y);
    this.player.setCollideWorldBounds(true);

    // Let things fall out the bottom of the world (into pits).
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight + 200, true, true, true, false);

    this.physics.add.collider(this.player, this.solids, (_p, block) => {
      if (this.player.body.blocked.up) this.headHits.push(block as Image);
    });
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.overlap(this.player, this.balls, (_p, ball) => this.collectBall(ball as Image));
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => this.touchEnemy(enemy as Enemy));
    this.physics.add.overlap(this.player, this.flag, () => this.win());

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.2, 0.2);

    this.hud = this.add
      .text(6, 4, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', stroke: '#202020', strokeThickness: 3 })
      .setScrollFactor(0)
      .setDepth(100);
    this.refreshHud();
  }

  update(time: number) {
    if (this.state === 'playing') {
      this.player.update(time);
      this.handleHeadHits();
      if (this.player.y > this.worldHeight + 16) this.die(false);
      if (this.ranFrom && !this.physics.overlap(this.player, this.ranFrom)) this.ranFrom = null;
    }

    const wakeLine = this.cameras.main.scrollX + VIEW_WIDTH + TILE;
    for (const enemy of this.enemies.getChildren() as Enemy[]) {
      if (enemy.x < wakeLine) enemy.wake();
      if (enemy.y > this.worldHeight + 32) enemy.destroy();
    }
  }

  private createBackground() {
    for (let x = 0; x < this.worldWidth * 0.3 + VIEW_WIDTH; x += 140) {
      this.add.image(x, 24 + ((x / 140) % 3) * 18, 'cloud').setScrollFactor(0.3).setOrigin(0, 0);
    }
    for (let x = 0; x < this.worldWidth * 0.6 + VIEW_WIDTH; x += 220) {
      this.add.image(x, this.worldHeight - 2 * TILE, 'hill').setScrollFactor(0.6).setOrigin(0, 1);
    }
  }

  /** When Pikachu bonks a block from below, bump the one closest to its head. */
  private handleHeadHits() {
    if (this.headHits.length === 0) return;
    const block = this.headHits.reduce((a, b) =>
      Math.abs(a.x - this.player.x) <= Math.abs(b.x - this.player.x) ? a : b,
    );
    this.headHits = [];

    const kind = block.getData('kind');
    if (!kind || block.getData('bumping')) return;

    block.setData('bumping', true);
    this.tweens.add({
      targets: block,
      y: block.y - 4,
      duration: 70,
      yoyo: true,
      onComplete: () => block.setData('bumping', false),
    });

    if (kind === 'question') {
      block.setTexture('used').setData('kind', 'used');
      this.popBall(block.x, block.y - TILE);
    }
  }

  private popBall(x: number, y: number) {
    const ball = this.add.image(x, y, 'pokeball');
    this.tweens.add({
      targets: ball,
      y: y - 24,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => ball.destroy(),
    });
    this.addBalls(1);
  }

  private collectBall(ball: Image) {
    ball.destroy();
    this.addBalls(1);
  }

  /** Each Poké Ball also heals Pikachu by 1 HP. */
  private addBalls(n: number) {
    this.registry.inc('balls', n);
    this.registry.set('hp', Math.min(PIKACHU_MAX_HP, this.registry.get('hp') + n));
    this.registry.inc('score', 10 * n);
    this.refreshHud();
  }

  private touchEnemy(enemy: Enemy) {
    if (this.state !== 'playing' || !enemy.body.enable || enemy === this.ranFrom) return;
    this.startBattle(enemy);
  }

  /** Bumping into a Rattata starts a Pokémon battle. Jump over it to avoid one! */
  private startBattle(enemy: Enemy) {
    this.state = 'battle';
    this.physics.pause();
    this.player.anims.stop();
    this.cameras.main.flash(300, 255, 255, 255);

    const data: BattleData = { onEnd: (result) => this.endBattle(enemy, result) };
    this.time.delayedCall(300, () => {
      this.scene.pause();
      this.scene.launch('Battle', data);
    });
  }

  private endBattle(enemy: Enemy, result: BattleResult) {
    this.scene.resume();
    this.input.keyboard!.resetKeys();
    this.physics.resume();
    this.state = 'playing';
    this.refreshHud();

    if (result === 'won') {
      enemy.squash();
      this.registry.inc('score', 100);
      this.refreshHud();
    } else if (result === 'ran') {
      // The Rattata wanders off, and won't battle again until you've separated.
      this.ranFrom = enemy;
      enemy.walkAwayFrom(this.player.x);
      this.tweens.add({ targets: this.player, alpha: 0.3, duration: 100, yoyo: true, repeat: 9 });
    } else {
      this.die(true);
    }
  }

  private die(withHop: boolean) {
    this.state = 'dying';
    this.player.frozen = true;
    this.registry.inc('lives', -1);
    this.registry.set('hp', PIKACHU_MAX_HP);
    this.refreshHud();

    const body = this.player.body;
    body.checkCollision.none = true;
    body.setAcceleration(0, 0).setVelocity(0, withHop ? -300 : 0);
    this.player.setCollideWorldBounds(false);
    this.player.anims.play('pika-jump');
    this.cameras.main.stopFollow();

    this.time.delayedCall(1500, () => {
      if (this.registry.get('lives') > 0) {
        this.scene.restart();
      } else {
        this.showMessage('GAME OVER', 'Press SPACE to try again');
      }
    });
  }

  private win() {
    if (this.state !== 'playing') return;
    this.state = 'won';
    this.player.frozen = true;
    const body = this.player.body;
    body.setAcceleration(0, 0).setVelocity(0, 0);
    this.player.anims.play('pika-idle');
    this.registry.inc('score', 1000);
    this.refreshHud();
    this.showMessage('YOU DID IT!', 'Press SPACE to play again');
  }

  private showMessage(title: string, subtitle: string) {
    const cx = VIEW_WIDTH / 2;
    const style = { fontFamily: 'monospace', color: '#ffffff', stroke: '#202020', strokeThickness: 4 };
    this.add.text(cx, 80, title, { ...style, fontSize: '24px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.add.text(cx, 110, subtitle, { ...style, fontSize: '10px' }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.registry.set({ score: 0, balls: 0, lives: 3, hp: PIKACHU_MAX_HP });
      this.scene.restart();
    });
  }

  private refreshHud() {
    const score = String(this.registry.get('score')).padStart(6, '0');
    const balls = String(this.registry.get('balls')).padStart(2, '0');
    const hp = `${this.registry.get('hp')}/${PIKACHU_MAX_HP}`;
    this.hud.setText(`SCORE ${score}   POKE BALLS x${balls}   HP ${hp}   LIVES ${this.registry.get('lives')}`);
  }
}
