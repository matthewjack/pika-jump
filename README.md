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

Collect the Poké Balls, bonk the Poké Ball blocks from underneath, and reach the flag.

**Battles:** bump into a Rattata and you have to battle it, Pokémon-style. Jump over it to avoid the battle. In a battle, use the arrow keys and Space/Enter to choose **FIGHT** (Thunderbolt, Thunder Shock or Quick Attack) or **RUN**. Pikachu's HP carries over between battles, and each Poké Ball you collect heals 1 HP. If Pikachu faints, you lose a life.

## Where things live

| File | What it is |
|---|---|
| `src/levels/level1.ts` | The level, drawn as text. Each character is one tile, so it's easy to edit. |
| `src/art/sprites.ts` | Pikachu, Rattata and the Poké Ball as text pixel art, plus the colour palette. |
| `src/art/textures.ts` | Turns the pixel art into textures, and draws tiles, clouds, hills and the flag. |
| `src/objects/Player.ts` | Movement and jump feel. The constants at the top tune speed and jump height. |
| `src/objects/Enemy.ts` | Rattata walking and fainting. |
| `src/battle/moves.ts` | Battle numbers: HP, moves, damage and accuracy. Easy to tweak or add moves. |
| `src/scenes/BattleScene.ts` | The Pokémon-style battle screen. |
| `src/scenes/GameScene.ts` | Builds the level, plus collisions, scoring, starting battles, dying and winning. |

## Using real sprite images instead

Put PNG sprite sheets in `public/assets/`, load them in `BootScene.preload()`, and remove the matching `makePixelTexture` call:

```ts
preload() {
  this.load.spritesheet('pikachu', 'assets/pikachu.png', { frameWidth: 16, frameHeight: 16 });
}
```

Keep the same texture keys (`pikachu`, `rattata`, `pokeball`). The walk animation uses frames 0 and 1, and the jump uses frame 2. If the frames aren't 16×16, adjust `body.setSize` in `Player.ts` / `Enemy.ts`.
