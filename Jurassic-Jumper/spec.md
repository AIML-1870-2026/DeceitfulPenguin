# Endless Jumper Game — Spec for Claude Code

## Overview
A colorful, cartoonish endless vertical platformer. A little character bounces upward by jumping off platforms. The player controls left/right movement. The screen scrolls up as the player climbs higher — falling below the screen means game over.

---

## Tech Stack
- Single HTML file (HTML5 Canvas + vanilla JavaScript)
- No external dependencies

---

## Visual Style
- **Theme:** Colorful & cartoonish
- Bright background (light blue sky gradient, or similar cheerful color)
- Bold outlines on platforms and UI elements
- Score displayed prominently in a fun font (e.g. a Google Font like "Fredoka One" or fallback to sans-serif)

---

## Player Character
- **Sprite:** PNG image provided by the user — load from a file named `guy.png` in the same directory
- Dimensions: render at ~50x50px (scale sprite to fit)
- The character bounces **automatically** — no jump button needed. When the character lands on a platform from above, it immediately bounces upward with a set jump velocity
- The character can pass **through platforms from below** (no collision when moving upward through a platform), but **bounces off platforms when falling down onto them from above**
- **Controls:** Left/right arrow keys (or A/D) to move horizontally
- The character **wraps around** horizontally — going off the left edge reappears on the right and vice versa

---

## Camera / Scrolling
- The camera only scrolls **upward** — it tracks the player's highest point reached
- The camera never scrolls back down
- Platforms and other objects move down relative to the camera as the player climbs
- If the player falls **below the bottom of the screen**, the game ends

---

## Platforms
Platforms should be generated procedurally as the player climbs. Each platform is a rounded rectangle with a cartoonish outline.

### Platform Types (mix all three in increasing difficulty as score rises):

| Type | Description | Visual Suggestion |
|---|---|---|
| **Static** | Doesn't move. The most common type, especially early on. | Solid bright green with outline |
| **Moving** | Slides side to side at a set speed. Speed/range increases with height. | Bright blue/purple, maybe with little arrows |
| **Breakable** | Disappears after the player lands on it once. | Brown / cracked look, shatters with a brief animation |
| **Spring** | Launches the player at 2× normal jump height. | Yellow with a coil/spring visual on top |

### Platform Generation Rules:
- Platforms should always be reachable from the one below (gap should never exceed max jump height)
- As the player climbs higher (score increases), platforms become:
  - More sparse (greater vertical gaps)
  - More likely to be moving or breakable
  - Moving platforms move faster
- Each platform should be wide enough to land on (~80–140px wide, randomized)

---

## Scoring
- Score = the maximum height the player has reached (in arbitrary units or pixels)
- Display score in the top-center of the screen at all times during gameplay
- Score does **not** go down if the player falls — it's a "high point reached" counter

---

## Game Over Screen
Triggered when the player falls below the bottom of the screen.

- Show a colorful "GAME OVER" message
- Show the player's final score
- Show a "Play Again" button (or press Space/Enter to restart)
- Restart resets the score, player position, and regenerates platforms

---

## Game Start / Initial State
- Show a simple start screen: game title, brief instructions ("Arrow keys to move — don't fall!"), and a "Start" button or press Space to begin
- Player starts near the bottom of the screen on a guaranteed static platform

---

## Audio (Optional / Nice to Have)
- If easy to add with the Web Audio API: a small boing sound on bounce, a crack sound on breakable platforms, and a sad trombone / jingle on game over
- If it adds complexity, skip it — visuals are the priority

---

## File Structure
```
index.html       ← entire game in one file
guy.png          ← player sprite (provided by user, load this file)
```

---

## Implementation Notes
- Use `requestAnimationFrame` for the game loop
- Keep a `cameraY` variable representing the highest point reached — only update it when the player goes higher
- Platforms off the **bottom** of the screen (below camera view) should be removed from memory
- Pre-generate a buffer of platforms above the current camera view so they're ready before the player reaches them
- Collision detection: only trigger bounce if player is **moving downward** (positive Y velocity) AND player's bottom is near the top of the platform
