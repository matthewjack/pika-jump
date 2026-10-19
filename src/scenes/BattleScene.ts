import Phaser from 'phaser';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config';
import { CATCH_CHANCE, damageAt, maxHpAt, type Move, SPECIES, type SpeciesId, XP_PER_LEVEL, xpForWin } from '../pokemon/species';
import { getActiveIndex, getTeam, saveTeam, setActiveIndex, teamIsFull, type TeamMember } from '../pokemon/team';

export type BattleResult = 'won' | 'caught' | 'ran' | 'fainted';

export interface BattleData {
  species: SpeciesId;
  level: number;
  onEnd: (result: BattleResult) => void;
}

type Action =
  | { kind: 'move'; move: Move }
  | { kind: 'ball' }
  | { kind: 'switch'; index: number }
  | { kind: 'run' };

const TEXT = { fontFamily: 'monospace', color: '#202020' };
const BOX_Y = 168;
const MINE_X = 110;
const MINE_Y = 164;
const WILD_X = 300;
const WILD_Y = 92;
const BAR_WIDTH = 100;

/** One side of the fight: a sprite plus its name and HP bar. */
interface Fighter {
  species: SpeciesId;
  level: number;
  hp: number;
  maxHp: number;
  sprite: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
  /** Only your own Pokémon shows an XP bar. */
  xpBar?: Phaser.GameObjects.Rectangle;
}

interface MenuOptions {
  columns: number;
  x: number;
  y: number;
  colWidth?: number;
  rowHeight?: number;
  /** Items that can't be picked (e.g. a fainted Pokémon). */
  disabled?: boolean[];
}

export class BattleScene extends Phaser.Scene {
  private battleData!: BattleData;
  private team: TeamMember[] = [];
  private activeIndex = 0;
  private mine!: Fighter;
  private wild!: Fighter;
  private message!: Phaser.GameObjects.Text;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private menuChoice = 0;
  private menuColumns = 1;
  private menuDisabled: boolean[] = [];
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
    this.team = getTeam(this.registry).map((m) => ({ ...m }));
    this.activeIndex = getActiveIndex(this.registry);

    // Scenery
    this.add.rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0xf0f8d8).setOrigin(0);
    this.add.ellipse(WILD_X, WILD_Y, 130, 26, 0xb8d890);
    this.add.ellipse(MINE_X, MINE_Y + 2, 150, 28, 0xb8d890);

    const { species, level } = this.battleData;
    this.wild = this.makeFighter(species, level, maxHpAt(species, level), WILD_X, WILD_Y, 14, 14);
    this.wild.sprite.setFlipX(true).anims.play(`${species}-walk`);
    const active = this.team[this.activeIndex];
    this.mine = this.makeFighter(active.species, active.level, active.hp, MINE_X, MINE_Y, 236, 112, true);

    // Message box along the bottom
    this.add.rectangle(4, BOX_Y + 2, VIEW_WIDTH - 8, VIEW_HEIGHT - BOX_Y - 6, 0xffffff).setOrigin(0).setStrokeStyle(3, 0x485890);
    this.message = this.add.text(14, BOX_Y + 10, '', { ...TEXT, fontSize: '11px', wordWrap: { width: 200 } });

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => this.handleKey(e));
    this.cameras.main.fadeIn(250, 255, 255, 255);

    void this.run();
  }

  private makeFighter(species: SpeciesId, level: number, hp: number, x: number, y: number, boxX: number, boxY: number, showXp = false): Fighter {
    const sprite = this.add.sprite(x, y, species, 0).setOrigin(0.5, 1).setScale(4);
    this.add.rectangle(boxX, boxY, 150, 42, 0xf8f8f0).setOrigin(0).setStrokeStyle(2, 0x404040);
    const nameText = this.add.text(boxX + 8, boxY + 4, '', { ...TEXT, fontSize: '11px', fontStyle: 'bold' });
    this.add.text(boxX + 8, boxY + 20, 'HP', { ...TEXT, fontSize: '9px', color: '#e08000', fontStyle: 'bold' });
    this.add.rectangle(boxX + 24, boxY + 21, BAR_WIDTH + 4, 9, 0x404040).setOrigin(0);
    const bar = this.add.rectangle(boxX + 26, boxY + 23, BAR_WIDTH, 5, 0x40c040).setOrigin(0);
    const hpText = this.add.text(boxX + 142, boxY + 30, '', { ...TEXT, fontSize: '9px' }).setOrigin(1, 0);
    let xpBar: Phaser.GameObjects.Rectangle | undefined;
    if (showXp) {
      this.add.text(boxX + 8, boxY + 31, 'XP', { ...TEXT, fontSize: '8px', color: '#3870d0', fontStyle: 'bold' });
      this.add.rectangle(boxX + 24, boxY + 34, BAR_WIDTH * 0.6, 3, 0xd0d0d0).setOrigin(0);
      xpBar = this.add.rectangle(boxX + 24, boxY + 34, 0, 3, 0x3870d0).setOrigin(0);
    }

    const fighter: Fighter = { species, level, hp, maxHp: 0, sprite, nameText, bar, hpText, xpBar };
    this.showFighter(fighter, species, level, hp);
    return fighter;
  }

  /** Puts a (possibly different) Pokémon into a fighter slot. */
  private showFighter(fighter: Fighter, species: SpeciesId, level: number, hp: number) {
    fighter.species = species;
    fighter.level = level;
    fighter.hp = hp;
    fighter.maxHp = maxHpAt(species, level);
    fighter.sprite.setTexture(species, 0);
    fighter.nameText.setText(`${SPECIES[species].name} Lv${level}`);
    this.drawHp(fighter, false);
    if (fighter.xpBar) fighter.xpBar.width = (BAR_WIDTH * 0.6 * this.team[this.activeIndex].xp) / XP_PER_LEVEL;
  }

  private nameOf(fighter: Fighter) {
    const name = SPECIES[fighter.species].name;
    return fighter === this.wild ? `Wild ${name}` : name;
  }

  // ---------- The battle itself ----------

  private async run() {
    await this.say(`A wild ${SPECIES[this.wild.species].name} appeared!`);
    await this.say(`Go! ${this.nameOf(this.mine)}!`);

    while (true) {
      const action = await this.chooseAction();

      if (action.kind === 'run') {
        await this.say('Got away safely!');
        return this.finish('ran');
      }
      if (action.kind === 'ball') {
        const outcome = await this.throwBall();
        if (outcome === 'caught') {
          await this.gainXp(xpForWin(this.wild.level));
          return this.finish('caught');
        }
        if (outcome === 'no-throw') continue;
      }
      if (action.kind === 'switch') {
        await this.switchIn(action.index, true);
      }
      if (action.kind === 'move') {
        await this.useMove(this.mine, this.wild, action.move);
        if (this.wild.hp <= 0) {
          await this.faint(this.wild);
          await this.say(`${this.nameOf(this.wild)} fainted!`);
          await this.gainXp(xpForWin(this.wild.level));
          return this.finish('won');
        }
      }

      // The wild Pokémon's turn
      await this.useMove(this.wild, this.mine, Phaser.Utils.Array.GetRandom(SPECIES[this.wild.species].moves));
      if (this.mine.hp <= 0) {
        await this.faint(this.mine);
        await this.say(`${this.nameOf(this.mine)} fainted!`);
        if (!this.team.some((m) => m.hp > 0)) return this.finish('fainted');
        await this.say('Choose your next POKEMON!');
        await this.switchIn(await this.chooseTeamMember(false), false);
      }
    }
  }

  private async chooseAction(): Promise<Action> {
    while (true) {
      this.message.setText(`What will ${this.nameOf(this.mine)} do?`);
      const balls = this.registry.get('balls');
      const pick = await this.menu(['FIGHT', `BALL x${balls}`, 'POKEMON', 'RUN'], { columns: 2, x: 222, y: BOX_Y + 12, colWidth: 88 });

      if (pick === 0) {
        this.message.setText('');
        const moves = SPECIES[this.mine.species].moves;
        const labels = [...moves.map((m) => `${m.name} (${damageAt(m, this.mine.level)})`), 'BACK'];
        const choice = await this.menu(labels, { columns: 2, x: 20, y: BOX_Y + 12, colWidth: 190 });
        if (choice < moves.length) return { kind: 'move', move: moves[choice] };
      } else if (pick === 1) {
        return { kind: 'ball' };
      } else if (pick === 2) {
        const index = await this.chooseTeamMember(true);
        if (index >= 0) return { kind: 'switch', index };
      } else {
        return { kind: 'run' };
      }
    }
  }

  private async useMove(attacker: Fighter, target: Fighter, move: Move) {
    await this.say(`${this.nameOf(attacker)} used ${move.name}!`, 400);

    if (Math.random() > move.accuracy) {
      await this.say(`${this.nameOf(attacker)}'s attack missed!`);
      return;
    }

    await this.playEffect(move, attacker, target);
    const damage = damageAt(move, attacker.level);
    target.hp = Math.max(0, target.hp - damage);
    if (target === this.mine) this.saveMyHp();
    await this.drawHp(target, true);
    await this.say(`It did ${damage} damage!`);
  }

  private saveMyHp() {
    this.team[this.activeIndex].hp = this.mine.hp;
    saveTeam(this.registry, this.team);
  }

  /** Swap in a different team member. */
  private async switchIn(index: number, callBack: boolean) {
    const sprite = this.mine.sprite;
    if (callBack) {
      await this.say(`Come back, ${this.nameOf(this.mine)}!`, -400);
      await this.tween({ targets: sprite, scale: 0, alpha: 0, duration: 250 });
    }
    this.activeIndex = index;
    setActiveIndex(this.registry, index);
    const member = this.team[index];
    this.showFighter(this.mine, member.species, member.level, member.hp);
    sprite.setScale(0).setAlpha(1).setY(MINE_Y);
    await this.tween({ targets: sprite, scale: 4, duration: 250, ease: 'Back.easeOut' });
    await this.say(`Go! ${this.nameOf(this.mine)}!`);
  }

  /** Throws a Poké Ball at the wild Pokémon — a 50/50 chance to catch it. */
  private async throwBall(): Promise<'caught' | 'broke-free' | 'no-throw'> {
    if (this.registry.get('balls') <= 0) {
      await this.say("You don't have any POKE BALLS! Collect some in the level.");
      return 'no-throw';
    }
    if (teamIsFull(this.registry)) {
      await this.say('Your team is full!');
      return 'no-throw';
    }

    this.registry.inc('balls', -1);
    await this.say('You threw a POKE BALL!', -600);

    const target = this.wild.sprite;
    const ball = this.add.image(MINE_X + 20, MINE_Y - 60, 'pokeball').setScale(2);
    const from = { x: ball.x, y: ball.y };
    const to = { x: target.x, y: target.y - 20 };
    await this.counter(550, (t) => {
      ball.x = Phaser.Math.Linear(from.x, to.x, t);
      ball.y = Phaser.Math.Linear(from.y, to.y, t) - Math.sin(Math.PI * t) * 70;
      ball.angle = t * 720;
    });

    // The Pokémon gets sucked into the ball, and the ball drops to the ground.
    ball.angle = 0;
    await this.tween({ targets: target, scale: 0, alpha: 0, duration: 250 });
    await this.tween({ targets: ball, y: target.y - 12, duration: 400, ease: 'Bounce.easeOut' });

    const caught = Math.random() < CATCH_CHANCE;
    const wobbles = caught ? 3 : Phaser.Math.Between(1, 2);
    for (let i = 0; i < wobbles; i++) {
      await this.wait(300);
      await this.tween({ targets: ball, angle: i % 2 ? 25 : -25, duration: 120, yoyo: true });
    }
    await this.wait(400);

    const name = SPECIES[this.wild.species].name;
    if (caught) {
      this.sparkle(ball.x, ball.y);
      await this.say(`Gotcha! ${name} was caught!`);
      this.team.push({ species: this.wild.species, level: this.wild.level, xp: 0, hp: Math.max(1, this.wild.hp) });
      saveTeam(this.registry, this.team);
      await this.say(`${name} joined your team!`);
      return 'caught';
    }

    // It broke free!
    ball.destroy();
    this.cameras.main.flash(150, 255, 255, 255);
    await this.tween({ targets: target, scale: 4, alpha: 1, duration: 200 });
    await this.say(`Oh no! ${name} broke free!`);
    return 'broke-free';
  }

  // ---------- Levelling up and evolving ----------

  /** Gives XP to the Pokémon in battle, levelling up (and evolving) as needed. */
  private async gainXp(amount: number) {
    const member = this.team[this.activeIndex];
    await this.say(`${this.nameOf(this.mine)} gained ${amount} XP!`);
    member.xp += amount;
    await this.animateXpBar(member.xp);

    while (member.xp >= XP_PER_LEVEL) {
      member.xp -= XP_PER_LEVEL;
      member.level++;
      member.hp += 2; // levelling up adds 2 max HP — and heals that much
      saveTeam(this.registry, this.team);
      this.showFighter(this.mine, member.species, member.level, member.hp);
      this.sparkle(this.mine.sprite.x, this.mine.sprite.y - 32);
      await this.say(`${this.nameOf(this.mine)} grew to level ${member.level}!`);

      const evolution = SPECIES[member.species].evolvesTo;
      if (evolution && member.level >= evolution.level) await this.evolve(member, evolution.species);
      await this.animateXpBar(member.xp);
    }
    saveTeam(this.registry, this.team);
  }

  private animateXpBar(xp: number) {
    const bar = this.mine.xpBar;
    if (!bar) return Promise.resolve();
    return this.tween({ targets: bar, width: (BAR_WIDTH * 0.6 * Math.min(xp, XP_PER_LEVEL)) / XP_PER_LEVEL, duration: 400 });
  }

  /** The classic evolution: the sprite flickers between old and new, faster and faster. */
  private async evolve(member: TeamMember, into: SpeciesId) {
    const oldName = SPECIES[member.species].name;
    const oldMax = maxHpAt(member.species, member.level);
    await this.say(`What? ${oldName} is evolving!`);

    const sprite = this.mine.sprite;
    const from = member.species;
    for (let i = 0, delay = 320; i < 14; i++, delay = Math.max(50, delay * 0.8)) {
      sprite.setTexture(i % 2 ? from : into, 0);
      await this.tween({ targets: sprite, scale: 4.4, duration: delay / 2, yoyo: true });
    }
    sprite.setTexture(into, 0);
    this.cameras.main.flash(400, 255, 255, 255);
    this.sparkle(sprite.x, sprite.y - 32);

    // Keep the same amount of damage taken, but with the bigger HP of the new form.
    member.species = into;
    member.hp = Math.max(1, maxHpAt(into, member.level) - (oldMax - member.hp));
    saveTeam(this.registry, this.team);
    this.showFighter(this.mine, member.species, member.level, member.hp);
    await this.say(`Congratulations! ${oldName} evolved into ${SPECIES[into].name}!`, 600);
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
    const lunge = attacker === this.mine ? 16 : -16;
    const from = { x: attacker.sprite.x, y: attacker.sprite.y - 30 };
    const to = { x: target.sprite.x, y: target.sprite.y - 24 };
    switch (move.effect) {
      case 'bolt':
        for (let i = 0; i < 3; i++) {
          const bolt = this.drawBolt(target.sprite.x, 0, target.sprite.y - 10, 5);
          await this.wait(90);
          bolt.destroy();
          await this.wait(50);
        }
        this.cameras.main.shake(200, 0.01);
        break;
      case 'spark':
        for (let i = 0; i < 4; i++) {
          const x = target.sprite.x + Phaser.Math.Between(-30, 30);
          const y = target.sprite.y - Phaser.Math.Between(20, 50);
          const spark = this.drawBolt(x, y - 20, y + 10, 3);
          await this.wait(70);
          spark.destroy();
        }
        break;
      case 'fire':
        await this.projectiles(from, to, [0xf85020, 0xf8a020, 0xf8d030], 8, 5);
        break;
      case 'water':
        await this.projectiles(from, to, [0x3890f8, 0x70c0f8, 0xffffff], 8, 4);
        break;
      case 'leaf':
        await this.projectiles(from, to, [0x58b030, 0x2f7a1c], 6, 4);
        break;
      case 'wind':
        await this.projectiles(from, to, [0xffffff, 0xd8e8f0], 6, 6);
        break;
      case 'bug':
        await this.projectiles(from, to, [0xa8d040, 0xffffff], 5, 3);
        break;
      case 'psychic':
        await this.projectiles(from, to, [0xc060e0, 0xf0a0f8], 7, 5);
        this.cameras.main.shake(150, 0.006);
        break;
      case 'dash':
        await this.tween({ targets: attacker.sprite, x: attacker.sprite.x + lunge * 4, duration: 90, yoyo: true });
        break;
      case 'tackle':
        await this.tween({ targets: attacker.sprite, x: attacker.sprite.x + lunge * 2, duration: 120, yoyo: true });
        break;
    }
    await this.tween({ targets: target.sprite, alpha: 0, duration: 60, yoyo: true, repeat: 2 });
  }

  /** A stream of little coloured balls flying from the attacker to the target. */
  private async projectiles(from: { x: number; y: number }, to: { x: number; y: number }, colours: number[], count: number, size: number) {
    const shots = [];
    for (let i = 0; i < count; i++) {
      const dot = this.add.circle(from.x, from.y, size, colours[i % colours.length]);
      shots.push(
        this.tween({
          targets: dot,
          x: to.x + Phaser.Math.Between(-10, 10),
          y: to.y + Phaser.Math.Between(-10, 10),
          duration: 320,
          delay: i * 45,
        }).then(() => dot.destroy()),
      );
    }
    await Promise.all(shots);
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

  private sparkle(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const star = this.add.star(x, y, 4, 2, 5, 0xf8d030);
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 500,
        onComplete: () => star.destroy(),
      });
    }
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
    const width = Math.max(0, BAR_WIDTH * ratio);
    if (!animate) {
      fighter.bar.width = width;
      return Promise.resolve();
    }
    return this.tween({ targets: fighter.bar, width, duration: 400 });
  }

  // ---------- Menus and messages ----------

  /** Full-screen list of your team. Resolves with the chosen index, or -1 for BACK. */
  private async chooseTeamMember(canGoBack: boolean): Promise<number> {
    const panel = this.add.container(0, 0);
    panel.add(this.add.rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0xf8f8f0).setOrigin(0).setStrokeStyle(4, 0x485890));
    panel.add(this.add.text(VIEW_WIDTH / 2, 8, 'Choose a POKEMON', { ...TEXT, fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5, 0));

    const labels: string[] = [];
    const disabled: boolean[] = [];
    this.team.forEach((member, i) => {
      const name = SPECIES[member.species].name;
      const status = member.hp <= 0 ? 'FAINTED' : i === this.activeIndex ? 'IN BATTLE' : '';
      const hp = `${String(member.hp).padStart(2)}/${maxHpAt(member.species, member.level)}`;
      labels.push(`${name.padEnd(10)} Lv${String(member.level).padEnd(2)}  HP ${hp}  ${status}`);
      disabled.push(member.hp <= 0 || i === this.activeIndex);
      panel.add(this.add.image(36, 38 + i * 26, member.species, 0).setAlpha(member.hp > 0 ? 1 : 0.4));
    });
    if (canGoBack) {
      labels.push('BACK');
      disabled.push(false);
    }

    const pick = await this.menu(labels, { columns: 1, x: 50, y: 32, rowHeight: 26, disabled });
    panel.destroy();
    return pick < this.team.length ? pick : -1;
  }

  private menu(items: string[], options: MenuOptions): Promise<number> {
    const { columns, x, y, colWidth = 0, rowHeight = 18, disabled = [] } = options;
    this.clearMenu();
    this.menuItems = items.map((label, i) =>
      this.add
        .text(x + (i % columns) * colWidth, y + Math.floor(i / columns) * rowHeight, label, { ...TEXT, fontSize: '11px' })
        .setAlpha(disabled[i] ? 0.45 : 1),
    );
    this.menuColumns = columns;
    this.menuDisabled = disabled;
    this.menuChoice = Math.max(0, disabled.findIndex((d) => !d));
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
        if (!this.menuDisabled[this.menuChoice]) this.onMenuPick(this.menuChoice);
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

  /** Runs `step` with t going from 0 to 1 over `duration` ms. */
  private counter(duration: number, step: (t: number) => void) {
    return new Promise<void>((resolve) =>
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        onUpdate: (tween) => step(tween.getValue() ?? 0),
        onComplete: () => resolve(),
      }),
    );
  }
}
