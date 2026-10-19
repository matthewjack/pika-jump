import Phaser from 'phaser';
import { TILE } from '../config';
import { PALETTE, PIKA_FRAMES, POKEBALL, RAT_FRAMES } from './sprites';

/** Paints text-art frames side by side into one texture with frames named 0, 1, 2... */
function makePixelTexture(scene: Phaser.Scene, key: string, frames: string[][]) {
  const w = Math.max(...frames.flat().map((row) => row.length));
  const h = Math.max(...frames.map((f) => f.length));
  const tex = scene.textures.createCanvas(key, w * frames.length, h)!;
  const ctx = tex.getContext();

  frames.forEach((rows, i) => {
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const colour = PALETTE[ch];
        if (!colour) return;
        ctx.fillStyle = colour;
        ctx.fillRect(i * w + x, y, 1, 1);
      });
    });
    tex.add(i, 0, i * w, 0, w, h);
  });
  tex.refresh();
}

/** Draws with a Graphics object, then bakes it into a texture. */
function bake(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
  const g = scene.make.graphics({}, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

export function createTextures(scene: Phaser.Scene) {
  makePixelTexture(scene, 'pikachu', PIKA_FRAMES);
  makePixelTexture(scene, 'rattata', RAT_FRAMES);
  makePixelTexture(scene, 'pokeball', [POKEBALL]);

  const T = TILE;

  bake(scene, 'dirt', T, T, (g) => {
    g.fillStyle(0xc87838).fillRect(0, 0, T, T);
    g.fillStyle(0xa05828);
    for (const [x, y] of [[2, 3], [9, 1], [12, 8], [4, 10], [10, 13], [1, 14]]) g.fillRect(x, y, 2, 2);
  });

  bake(scene, 'grass', T, T, (g) => {
    g.fillStyle(0xc87838).fillRect(0, 0, T, T);
    g.fillStyle(0xa05828).fillRect(3, 9, 2, 2).fillRect(11, 12, 2, 2);
    g.fillStyle(0x58c038).fillRect(0, 0, T, 5);
    g.fillStyle(0x389820).fillRect(0, 5, T, 1);
    for (let x = 1; x < T; x += 4) g.fillRect(x, 6, 2, 1);
  });

  bake(scene, 'brick', T, T, (g) => {
    g.fillStyle(0x6b2a10).fillRect(0, 0, T, T);
    g.fillStyle(0xc85020);
    for (let row = 0; row < 4; row++) {
      const offset = row % 2 ? 4 : 0;
      for (let x = -offset; x < T; x += 8) g.fillRect(x + 1, row * 4 + 1, 7, 3);
    }
  });

  bake(scene, 'stone', T, T, (g) => {
    g.fillStyle(0x505050).fillRect(0, 0, T, T);
    g.fillStyle(0x9a9a9a).fillRect(1, 1, T - 2, T - 2);
    g.fillStyle(0xc8c8c8).fillRect(1, 1, T - 2, 2).fillRect(1, 1, 2, T - 2);
  });

  // A "?" block, with a Poké Ball button instead of a question mark.
  bake(scene, 'question', T, T, (g) => {
    g.fillStyle(0x803800).fillRect(0, 0, T, T);
    g.fillStyle(0xf8b800).fillRect(1, 1, T - 2, T - 2);
    g.fillStyle(0x803800).fillRect(2, 2, 1, 1).fillRect(13, 2, 1, 1).fillRect(2, 13, 1, 1).fillRect(13, 13, 1, 1);
    g.fillStyle(0xe03828).fillRect(5, 4, 6, 4);
    g.fillStyle(0xffffff).fillRect(5, 8, 6, 4);
    g.fillStyle(0x202020).fillRect(4, 7, 8, 2);
    g.fillStyle(0xffffff).fillRect(7, 7, 2, 2);
  });

  bake(scene, 'used', T, T, (g) => {
    g.fillStyle(0x503010).fillRect(0, 0, T, T);
    g.fillStyle(0x987040).fillRect(1, 1, T - 2, T - 2);
  });

  bake(scene, 'flag', 24, 9 * T, (g) => {
    g.fillStyle(0xe0e0e0).fillRect(10, 6, 3, 9 * T - 6);
    g.fillStyle(0x58c038).fillCircle(11.5, 4, 4);
    g.fillStyle(0xe03828).fillRect(0, 10, 10, 20);
    g.fillStyle(0xffffff).fillCircle(5, 20, 3);
  });

  bake(scene, 'cloud', 48, 24, (g) => {
    g.fillStyle(0xffffff);
    g.fillCircle(14, 14, 9).fillCircle(26, 10, 10).fillCircle(36, 15, 8).fillRect(10, 14, 30, 9);
  });

  bake(scene, 'hill', 128, 64, (g) => {
    g.fillStyle(0x88d870).fillEllipse(64, 64, 128, 110);
    g.fillStyle(0x70c058).fillCircle(44, 36, 3).fillCircle(80, 28, 3).fillCircle(64, 46, 3);
  });
}

export function createAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: 'pika-walk',
    frames: scene.anims.generateFrameNumbers('pikachu', { frames: [0, 1] }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({ key: 'pika-idle', frames: [{ key: 'pikachu', frame: 0 }] });
  scene.anims.create({ key: 'pika-jump', frames: [{ key: 'pikachu', frame: 2 }] });
  scene.anims.create({
    key: 'rat-walk',
    frames: scene.anims.generateFrameNumbers('rattata', { frames: [0, 1] }),
    frameRate: 6,
    repeat: -1,
  });
}
