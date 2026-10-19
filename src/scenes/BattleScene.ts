import Phaser from 'phaser';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config';
import { type Move, PIKACHU_MAX_HP, PIKACHU_MOVES, RATTATA_MAX_HP, RATTATA_MOVES } from '../battle/moves';

export type BattleResult = 'won' | 'ran' | 'fainted';

export interface BattleData {
  onEnd: (result: BattleResult) => void;
}

const TEXT = { fontFamily: 'monospace', color: '#202020' };
const BOX_Y = 168;

/** One side of the fight: a sprite plus its HP bar. */
interface Fighter {
  name: string;
  hp: number;
  maxHp: number;
  sprite: Phaser.GameObjects.Sprite;
  bar: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
  barWidth: number;
}

export class BattleScene extends Phaser.Scene {
  private battleData!: BattleData;
  private pika!: Fighter;
  private rat!: Fighter;
  private message!: Phaser.GameObjects.Text;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private menuChoice = 0;
  private menuColumns = 1;
  private onMenuPick: ((index: number) => void) | null = null;

  constructor() {
    super('Battle');
  }

  init(data: BattleData) {
    this.battleData = data;
    this.menuItems = [];
    this.onMenuPick = null;
  }

  create() {
    // Scenery
    this.add.rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0xf0f8d8).setOrigin(0);
    this.add.ellipse(300, 92, 130, 26, 0xb8d890);
    this.add.ellipse(110, 166, 150, 28, 0xb8d890);

    this.rat = this.makeFighter('RATTATA', RATTATA_MAX_HP, RATTATA_MAX_HP, 'rattata', 300, 92, 14, 14);
    this.rat.sprite.anims.play('rat-walk');
    const hp = this.registry.get('hp') as number;
    this.pika = this.makeFighter('PIKACHU', hp, PIKACHU_MAX_HP, 'pikachu', 110, 164, 236, 112);

    // Message box along the bottom
    this.add.rectangle(4, BOX_Y + 2, VIEW_WIDTH - 8, VIEW_HEIGHT - BOX_Y - 6, 0xffffff).setOrigin(0).setStrokeStyle(3, 0x485890);
    this.message = this.add.text(14, BOX_Y + 10, '', { ...TEXT, fontSize: '11px', wordWrap: { width: 220 } });

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => this.handleKey(e));
    this.cameras.main.fadeIn(250, 255, 255, 255);

    void this.run();
  }

  private makeFighter(name: string, hp: number, maxHp: number, texture: string, x: number, y: number, boxX: number, boxY: number): Fighter {
    const sprite = this.add.sprite(x, y, texture, 0).setOrigin(0.5, 1).setScale(4);

    const barWidth = 100;
    this.add.rectangle(boxX, boxY, 150, 42, 0xf8f8f0).setOrigin(0).setStrokeStyle(2, 0x404040);
    this.add.text(boxX + 8, boxY + 4, name, { ...TEXT, fontSize: '11px', fontStyle: 'bold' });
    this.add.text(boxX + 8, boxY + 20, 'HP', { ...TEXT, fontSize: '9px', color: '#e08000', fontStyle: 'bold' });
    this.add.rectangle(boxX + 24, boxY + 21, barWidth + 4, 9, 0x404040).setOrigin(0);
    const bar = this.add.rectangle(boxX + 26, boxY + 23, barWidth, 5, 0x40c040).setOrigin(0);
    const hpText = this.add.text(boxX + 142, boxY + 30, '', { ...TEXT, fontSize: '9px' }).setOrigin(1, 0);

    const fighter = { name, hp, maxHp, sprite, bar, hpText, barWidth };
    this.drawHp(fighter, false);
    return fighter;
  }

  // ---------- The battle itself ----------

  private async run() {
    await this.say('A wild RATTATA appeared!');
    await this.say('Go! PIKACHU!');

    while (true) {
      const action = await this.chooseAction();
      if (action === 'run') {
        await this.say('Got away safely!');
        return this.finish('ran');
      }

      await this.useMove(this.pika, this.rat, action);
      if (this.rat.hp <= 0) {
        await this.faint(this.rat);
        await this.say('Wild RATTATA fainted!');
        return this.finish('won');
      }

      const ratMove = Phaser.Utils.Array.GetRandom(RATTATA_MOVES);
      await this.useMove(this.rat, this.pika, ratMove);
      if (this.pika.hp <= 0) {
        await this.faint(this.pika);
        await this.say('PIKACHU fainted!');
        return this.finish('fainted');
      }
    }
  }

  /** Shows FIGHT / RUN, then the move list. Resolves with a move, or 'run'. */
  private async chooseAction(): Promise<Move | 'run'> {
    while (true) {
      this.message.setText('What will PIKACHU do?');
      const pick = await this.menu(['FIGHT', 'RUN'], 2, 250, BOX_Y + 22, 70);
      if (pick === 1) return 'run';

      this.message.setText('');
      const moveNames = [...PIKACHU_MOVES.map((m) => `${m.name} (${m.damage})`), 'BACK'];
      const move = await this.menu(moveNames, 2, 20, BOX_Y + 12, 190);
      if (move < PIKACHU_MOVES.length) return PIKACHU_MOVES[move];
    }
  }

  private async useMove(attacker: Fighter, target: Fighter, move: Move) {
    const who = attacker === this.pika ? 'PIKACHU' : 'Wild RATTATA';
    await this.say(`${who} used ${move.name}!`, 400);

    if (Math.random() > move.accuracy) {
      await this.say(`${who}'s attack missed!`);
      return;
    }

    await this.playEffect(move, attacker, target);
    target.hp = Math.max(0, target.hp - move.damage);
    if (target === this.pika) this.registry.set('hp', target.hp);
    await this.drawHp(target, true);
    await this.say(`It did ${move.damage} damage!`);
  }

  private finish(result: BattleResult) {
    this.cameras.main.fadeOut(250, 255, 255, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.battleData.onEnd(result);
    });
  }

  // ---------- Animations ----------

  private async playEffect(move: Move, attacker: Fighter, target: Fighter) {
    const lunge = attacker === this.pika ? 16 : -16;
    switch (move.effect) {
      case 'thunderbolt':
        for (let i = 0; i < 3; i++) {
          const bolt = this.drawBolt(target.sprite.x, 0, target.sprite.y - 10, 5);
          await this.wait(90);
          bolt.destroy();
          await this.wait(50);
        }
        this.cameras.main.shake(200, 0.01);
        break;
      case 'shock':
        for (let i = 0; i < 4; i++) {
          const x = target.sprite.x + Phaser.Math.Between(-30, 30);
          const y = target.sprite.y - Phaser.Math.Between(20, 50);
          const spark = this.drawBolt(x, y - 20, y + 10, 3);
          await this.wait(70);
          spark.destroy();
        }
        break;
      case 'dash':
        await this.tween({ targets: attacker.sprite, x: attacker.sprite.x + lunge * 4, duration: 90, yoyo: true });
        break;
      case 'tackle':
      case 'bite':
        await this.tween({ targets: attacker.sprite, x: attacker.sprite.x + lunge * 2, duration: 120, yoyo: true });
        break;
    }
    await this.tween({ targets: target.sprite, alpha: 0, duration: 60, yoyo: true, repeat: 2 });
  }

  /** A jagged yellow lightning bolt from (x, top) down to (x, bottom). */
  private drawBolt(x: number, top: number, bottom: number, thickness: number) {
    const g = this.add.graphics();
    const points: Phaser.Math.Vector2[] = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const jitter = i === 0 || i === steps ? 0 : Phaser.Math.Between(-12, 12);
      points.push(new Phaser.Math.Vector2(x + jitter, top + ((bottom - top) * i) / steps));
    }
    g.lineStyle(thickness + 4, 0xfff8a0).strokePoints(points);
    g.lineStyle(thickness, 0xf8d030).strokePoints(points);
    return g;
  }

  private async faint(fighter: Fighter) {
    fighter.sprite.anims.stop();
    await this.tween({ targets: fighter.sprite, y: fighter.sprite.y + 30, alpha: 0, duration: 400 });
  }

  private drawHp(fighter: Fighter, animate: boolean) {
    const ratio = fighter.hp / fighter.maxHp;
    const colour = ratio > 0.5 ? 0x40c040 : ratio > 0.2 ? 0xf8c000 : 0xe03828;
    fighter.bar.setFillStyle(colour);
    fighter.hpText.setText(`${fighter.hp}/${fighter.maxHp}`);
    const width = Math.max(0, fighter.barWidth * ratio);
    if (!animate) {
      fighter.bar.width = width;
      return Promise.resolve();
    }
    return this.tween({ targets: fighter.bar, width, duration: 400 });
  }

  // ---------- Menus and messages ----------

  private menu(items: string[], columns: number, x: number, y: number, colWidth: number): Promise<number> {
    this.clearMenu();
    this.menuItems = items.map((label, i) =>
      this.add.text(x + (i % columns) * colWidth, y + Math.floor(i / columns) * 18, label, { ...TEXT, fontSize: '11px' }),
    );
    this.menuColumns = columns;
    this.menuChoice = 0;
    this.highlightMenu();
    return new Promise((resolve) => {
      this.onMenuPick = (index) => {
        this.clearMenu();
        resolve(index);
      };
    });
  }

  private handleKey(e: KeyboardEvent) {
    if (!this.onMenuPick) return;
    const n = this.menuItems.length;
    const cols = this.menuColumns;
    switch (e.code) {
      case 'ArrowLeft': this.menuChoice = (this.menuChoice - 1 + n) % n; break;
      case 'ArrowRight': this.menuChoice = (this.menuChoice + 1) % n; break;
      case 'ArrowUp': this.menuChoice = (this.menuChoice - cols + n) % n; break;
      case 'ArrowDown': this.menuChoice = (this.menuChoice + cols) % n; break;
      case 'Space':
      case 'Enter':
        this.onMenuPick(this.menuChoice);
        return;
      default:
        return;
    }
    this.highlightMenu();
  }

  private highlightMenu() {
    this.menuItems.forEach((item, i) => {
      const label = item.text.replace(/^[> ] /, '');
      item.setText(`${i === this.menuChoice ? '>' : ' '} ${label}`);
      item.setColor(i === this.menuChoice ? '#d03020' : '#202020');
    });
  }

  private clearMenu() {
    this.menuItems.forEach((item) => item.destroy());
    this.menuItems = [];
    this.onMenuPick = null;
  }

  /** Shows a message, then waits long enough to read it. */
  private say(text: string, extraWait = 0) {
    this.message.setText(text);
    return this.wait(900 + text.length * 20 + extraWait);
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms, resolve));
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => this.tweens.add({ ...config, onComplete: () => resolve() }));
  }
}
