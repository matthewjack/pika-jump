# Pika Jump

A Mario-style platformer with Pokémon, built with [Phaser 4](https://phaser.io) and TypeScript. A personal project for the kids.

## Play

**Play it in your browser: https://matthewjack.github.io/pika-jump/**

Or run it locally:

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

| Key | Action |
|---|---|
| ← → | Run |
| ↑ or Space | Jump (hold for higher) |
| S, or 1–6 | Switch which Pokémon you are |

Run through the forest, collect Poké Balls, bonk the Poké Ball blocks from underneath, and reach the flag.

**Wild Pokémon:** Rattata, Pidgey, Caterpie, Bulbasaur, Charmander and Squirtle wander the level. Bump into one and you battle it, Pokémon-style. Jump over it to avoid the battle.

**Battles:** use the arrow keys and Space/Enter to pick:
- **FIGHT**: use one of your Pokémon's moves. The number is how much damage it does.
- **BALL**: throw a Poké Ball. There's a 50% chance to catch the Pokémon, and then it joins your team (up to 6).
- **POKEMON**: switch to another team member.
- **RUN**: get away.

**Levels and evolution:** winning a battle (or catching a Pokémon) gives XP to the Pokémon that fought. Every 25 XP it goes up a level, with more HP and stronger attacks. At certain levels Pokémon evolve: Pikachu → Raichu (Lv10), Caterpie → Metapod (Lv7) → Butterfree (Lv9), and Rattata, Pidgey, Bulbasaur, Charmander and Squirtle evolve at Lv9. Wild Pokémon get stronger further into the level.

HP carries over between battles, and each Poké Ball you collect heals your current Pokémon by 1. If a Pokémon faints you choose the next one. If your whole team faints you lose a life, and everyone is healed.

## Where things live

| File | What it is |
|---|---|
| `src/levels/level1.ts` | The level, drawn as text. Each character is one tile (the key is at the top of the file), so it's easy to edit. |
| `src/art/sprites.ts` | All the Pokémon and the Poké Ball as text pixel art, plus the colour palette. |
| `src/art/textures.ts` | Turns the pixel art into textures, and draws tiles, trees, bushes and the flag. |
| `src/objects/Player.ts` | Movement and jump feel. The constants at the top tune speed and jump height. |
| `src/objects/Enemy.ts` | Wild Pokémon walking (or flying) around. |
| `src/pokemon/species.ts` | Every Pokémon's HP, moves, damage, accuracy and evolution level, plus the catch chance and XP rules. Easy to tweak or add moves. |
| `src/pokemon/team.ts` | Your team of caught Pokémon. |
| `src/scenes/BattleScene.ts` | The battle screen: fighting, catching and switching. |
| `src/scenes/GameScene.ts` | Builds the level, plus collisions, scoring, starting battles, dying and winning. |

## Using real sprite images instead

Put PNG sprite sheets in `public/assets/`, load them in `BootScene.preload()`, and remove the matching `makePixelTexture` call:

```ts
preload() {
  this.load.spritesheet('pikachu', 'assets/pikachu.png', { frameWidth: 16, frameHeight: 16 });
}
```

Keep the same texture keys (the Pokémon ids in `species.ts`, like `pikachu` or `charmeleon`, plus `pokeball`). The walk animation uses frames 0 and 1, and the jump uses frame 2. Frames should be 16×16.
