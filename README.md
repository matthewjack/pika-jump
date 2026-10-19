# Pika Jump

A Mario-style platformer starring Pikachu, built with [Phaser 4](https://phaser.io) and TypeScript. A personal project for the kids.

## Play

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

| Key | Action |
|---|---|
| ← → | Run |
| ↑ or Space | Jump (hold for higher) |

Stomp the Rattatas, collect the Poké Balls, bonk the Poké Ball blocks from underneath, and reach the flag.

## Where things live

| File | What it is |
|---|---|
| `src/levels/level1.ts` | The level, drawn as text. Each character is one tile, so it's easy to edit. |
| `src/art/sprites.ts` | Pikachu, Rattata and the Poké Ball as text pixel art, plus the colour palette. |
| `src/art/textures.ts` | Turns the pixel art into textures, and draws tiles, clouds, hills and the flag. |
| `src/objects/Player.ts` | Movement and jump feel. The constants at the top tune speed and jump height. |
| `src/objects/Enemy.ts` | Rattata walking and squashing. |
| `src/scenes/GameScene.ts` | Builds the level, plus collisions, scoring, dying and winning. |

## Using real sprite images instead

Put PNG sprite sheets in `public/assets/`, load them in `BootScene.preload()`, and remove the matching `makePixelTexture` call:

```ts
preload() {
  this.load.spritesheet('pikachu', 'assets/pikachu.png', { frameWidth: 16, frameHeight: 16 });
}
```

Keep the same texture keys (`pikachu`, `rattata`, `pokeball`). The walk animation uses frames 0 and 1, and the jump uses frame 2. If the frames aren't 16×16, adjust `body.setSize` in `Player.ts` / `Enemy.ts`.
