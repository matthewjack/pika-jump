import Phaser from 'phaser';
import { TILE } from '../config';
import { SPECIES, type SpeciesId } from '../pokemon/species';
import { PALETTE, POKEBALL, POKEMON_ART } from './sprites';

export interface ArtBounds {
  width: number;
  height: number;
}

/** How big each Pokémon's drawing actually is, for sizing its physics body. */
export const POKEMON_BOUNDS = {} as Record<SpeciesId, ArtBounds>;

/**
 * Paints text-art frames side by side into one texture with frames named 0, 1, 2...
 * Frames are padded to at least `minHeight`, lined up along the bottom.
 */
function makePixelTexture(scene: Phaser.Scene, key: string, frames: string[][], minHeight = 0, outline = false): ArtBounds {
  const w = Math.max(...frames.flat().map((row) => row.length));
  const h = Math.max(minHeight, ...frames.map((f) => f.length));
  const tex = scene.textures.createCanvas(key, w * frames.length, h)!;
  const ctx = tex.getContext();
  let left = w, right = 0, top = h;

  frames.forEach((rows, i) => {
    const padTop = h - rows.length;
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const colour = PALETTE[ch];
        if (!colour) return;
        ctx.fillStyle = colour;
        ctx.fillRect(i * w + x, padTop + y, 1, 1);
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, padTop + y);
      });
    });
    if (outline) drawOutline(ctx, i * w, w, h);
    tex.add(i, 0, i * w, 0, w, h);
  });
  tex.refresh();
  return { width: right - left + 1, height: h - top };
}

/** Adds a dark 1px outline around the drawing, like real Pokémon sprites, so it stands out on grass. */
function drawOutline(ctx: CanvasRenderingContext2D, x0: number, w: number, h: number) {
  const pixels = ctx.getImageData(x0, 0, w, h).data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && pixels[(y * w + x) * 4 + 3] > 0;
  ctx.fillStyle = 'rgba(32, 32, 32, 0.85)';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) ctx.fillRect(x0 + x, y, 1, 1);
    }
  }
}

/** Draws with a Graphics object, then bakes it into a texture. */
function bake(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
  const g = scene.make.graphics({}, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

export function createTextures(scene: Phaser.Scene) {
  for (const id of Object.keys(POKEMON_ART) as SpeciesId[]) {
    POKEMON_BOUNDS[id] = makePixelTexture(scene, id, POKEMON_ART[id], 16, true);
  }
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

  // Forest background: far trees are smaller and darker, near trees bigger and brighter.
  bake(scene, 'tree-far', 40, 72, (g) => {
    g.fillStyle(0x5a3a20).fillRect(17, 46, 6, 26);
    g.fillStyle(0x2f6e3a).fillCircle(20, 20, 16).fillCircle(10, 36, 11).fillCircle(30, 36, 11).fillCircle(20, 42, 12);
  });

  bake(scene, 'tree', 64, 104, (g) => {
    g.fillStyle(0x6b4424).fillRect(27, 64, 10, 40);
    g.fillStyle(0x3f8f3a).fillCircle(32, 26, 24).fillCircle(16, 50, 16).fillCircle(48, 50, 16).fillCircle(32, 58, 18);
    g.fillStyle(0x58a848).fillCircle(26, 20, 10).fillCircle(42, 40, 8).fillCircle(18, 46, 6);
  });

  bake(scene, 'bush', 32, 14, (g) => {
    g.fillStyle(0x3f8f3a).fillCircle(8, 9, 7).fillCircle(18, 6, 7).fillCircle(26, 9, 6).fillRect(2, 9, 28, 5);
    g.fillStyle(0x58a848).fillCircle(16, 5, 3);
  });

  bake(scene, 'tuft', 10, 6, (g) => {
    g.fillStyle(0x389820).fillRect(1, 2, 1, 4).fillRect(4, 0, 1, 6).fillRect(7, 1, 1, 5);
    g.fillStyle(0x58c038).fillRect(2, 3, 1, 3).fillRect(5, 2, 1, 4).fillRect(8, 3, 1, 3);
  });
}

export function createAnimations(scene: Phaser.Scene) {
  for (const id of Object.keys(SPECIES) as SpeciesId[]) {
    scene.anims.create({
      key: `${id}-walk`,
      frames: scene.anims.generateFrameNumbers(id, { frames: [0, 1] }),
      frameRate: SPECIES[id].flies ? 8 : 10,
      repeat: -1,
    });
    scene.anims.create({ key: `${id}-idle`, frames: [{ key: id, frame: 0 }] });
    scene.anims.create({ key: `${id}-jump`, frames: [{ key: id, frame: 2 }] });
  }
}

/** Sizes a physics body to fit a Pokémon's drawing, centred and resting on the bottom edge. */
export function fitBodyToArt(body: Phaser.Physics.Arcade.Body, id: SpeciesId, trim: number) {
  const art = POKEMON_BOUNDS[id];
  const w = Math.max(8, art.width - trim * 2);
  const h = Math.max(6, art.height - 1);
  body.setSize(w, h).setOffset((16 - w) / 2, 16 - h);
}
