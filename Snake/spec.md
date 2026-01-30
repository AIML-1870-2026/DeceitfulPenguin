# Snake Game Specification

## Overview

A polished, feature-rich HTML/CSS/JavaScript implementation of the classic Snake game with multiple visual themes, game modes, and an achievement system that unlocks unique snake skins.

**Tech Stack**: Single HTML file with embedded CSS and JavaScript. No external dependencies or build tools.

**Design Philosophy**: Casual, forgiving gameplay with satisfying visual feedback and progression systems that encourage replayability.

---

## Game Modes

### 1. Classic
- Standard endless snake gameplay
- Eat food to grow and score points
- Game ends on collision with walls or self
- Score = number of food eaten

### 2. Time Attack
- Objective: Eat 20 food as fast as possible
- Timer counts up from 0
- Game ends when 20 food eaten (win) or on collision (lose)
- Score = completion time (lower is better)

### 3. Survival
- Obstacles spawn every 10 seconds
- Obstacles are stationary wall blocks placed randomly (not on snake or food)
- Game ends on collision with walls, obstacles, or self
- Score = survival time in seconds

### 4. Maze
- Procedurally generated maze walls
- Food spawns in open areas
- Eat 10 food to complete a level, then generate new maze
- Game ends on collision
- Score = total food eaten across all levels
- Maze generation algorithm: Recursive backtracking, then remove ~30% of walls to create multiple paths

### 5. Zen
- No collisions (snake wraps through walls and passes through itself)
- No score tracking
- Purely relaxing, endless play
- Food still spawns and snake still grows

---

## Visual Themes

All themes are selectable from the settings menu at any time. Theme affects colors, background, and particle effects.

### Theme Specifications

| Theme | Background | Snake Head | Snake Body | Food | Grid Lines | Particle Color |
|-------|------------|------------|------------|------|------------|----------------|
| **Neon Cyber** | #0a0a0a | #00ffff | #00ff88 | #ff00ff | #1a1a2e (subtle) | cyan/magenta |
| **Retro Arcade** | #000000 | #00ff00 | #00cc00 | #ff0000 | None | green/red |
| **Minimalist** | #f5f5f5 | #333333 | #555555 | #e74c3c | #e0e0e0 | gray |
| **Nature** | #90EE90 | #228B22 | #2E7D32 | #FF6B6B | None | green/yellow |
| **Ocean** | #006994 | #00CED1 | #20B2AA | #FFD700 | None (caustics optional) | blue/gold |
| **Space** | #0c0c1e | #E0E0E0 | #A0A0A0 | #FFD700 | None (stars) | white/gold |

### Theme-Specific Effects

- **Neon Cyber**: Glow/bloom effect on snake and food (CSS box-shadow), subtle grid
- **Retro Arcade**: Pixelated edges, optional CRT scanline overlay (CSS)
- **Minimalist**: Clean anti-aliased shapes, subtle drop shadows
- **Nature**: Organic shapes (rounded), gentle swaying animation on food
- **Ocean**: Floating particle bubbles in background, wavy motion
- **Space**: Twinkling star background, comet trail on snake

---

## Snake Skins

Skins modify the snake's appearance independent of theme colors. Each skin has a unique visual characteristic.

| Skin Name | Visual Description |
|-----------|--------------------|
| **Classic Green** | Solid green, standard appearance |
| **Blue Racer** | Solid blue with subtle speed lines |
| **Lightning Yellow** | Yellow with small lightning bolt patterns |
| **Golden Serpent** | Metallic gold gradient |
| **Rainbow Shifter** | Cycles through rainbow colors along body |
| **Camo Snake** | Green/brown camouflage pattern |
| **Brick Pattern** | Red brick texture |
| **Pastel Gradient** | Soft pink-to-blue gradient |
| **Chrono Silver** | Metallic silver with clock-like markings |
| **Chonky Thicc Snake** | Wider body segments (1.5x normal width) |
| **Diamond Sparkle** | Light blue with sparkle particles |
| **Neon Purple** | Purple with neon glow effect |
| **Ghost Transparent** | 50% opacity with ethereal wisps |
| **Cosmic Starfield** | Dark body with animated star pattern inside |

---

## Achievement System

Achievements are tracked per session and reset on page refresh. When an achievement is unlocked, display a notification popup with the achievement name and the skin that was unlocked.

### Achievement Definitions

```
ACHIEVEMENT: First Bite
REQUIREMENT: Eat 1 food (any mode except Zen)
UNLOCKS: Classic Green
NOTE: This is pre-unlocked as the default skin

ACHIEVEMENT: Getting Longer
REQUIREMENT: Reach snake length of 15 in a single game
UNLOCKS: Blue Racer

ACHIEVEMENT: Speed Eater
REQUIREMENT: Eat 5 food within 8 seconds
UNLOCKS: Lightning Yellow
TRACKING: Store timestamp of each food eaten, check if 5 within rolling 8-second window

ACHIEVEMENT: Century Club
REQUIREMENT: Score 100 or more in Classic mode
UNLOCKS: Golden Serpent

ACHIEVEMENT: Explorer
REQUIREMENT: Play all 5 game modes at least once
UNLOCKS: Rainbow Shifter
TRACKING: Set of played modes, check when size === 5

ACHIEVEMENT: Survivor
REQUIREMENT: Survive for 120 seconds in Survival mode
UNLOCKS: Camo Snake

ACHIEVEMENT: Maze Runner
REQUIREMENT: Complete 5 maze levels (eat 50 total food in Maze mode in one game)
UNLOCKS: Brick Pattern

ACHIEVEMENT: Zen Master
REQUIREMENT: Play Zen mode continuously for 180 seconds
UNLOCKS: Pastel Gradient

ACHIEVEMENT: Time Lord
REQUIREMENT: Complete Time Attack in under 45 seconds
UNLOCKS: Chrono Silver

ACHIEVEMENT: Gluttonous
REQUIREMENT: Eat 50 food in a single game (Classic, Survival, or Maze)
UNLOCKS: Chonky Thicc Snake

ACHIEVEMENT: Corner Hunter
REQUIREMENT: Eat food in all 4 corners of the play area in a single game
UNLOCKS: Diamond Sparkle
TRACKING: Define corner zones (e.g., 3x3 cells in each corner), track which have had food eaten

ACHIEVEMENT: Night Owl
REQUIREMENT: Start 10 games (any mode counts)
UNLOCKS: Neon Purple

ACHIEVEMENT: Untouchable
REQUIREMENT: Eat 30 food in Maze mode without dying (single game)
UNLOCKS: Ghost Transparent

ACHIEVEMENT: Dedicated
REQUIREMENT: Unlock 10 other achievements
UNLOCKS: Cosmic Starfield
```

---

## Controls

### Keyboard
- **Arrow Keys**: Change direction
- **WASD**: Alternative direction controls
- **Space**: Pause/unpause game
- **Enter**: Start game / Restart after game over
- **Escape**: Return to main menu

### Touch (Mobile Support)
- **Swipe**: Change direction
- **Tap**: Pause/unpause when in game

---

## UI Layout

### Main Menu Screen
```
+----------------------------------+
|          🐍 SNAKE GAME           |
|                                  |
|      [ Classic Mode     ]        |
|      [ Time Attack      ]        |
|      [ Survival         ]        |
|      [ Maze             ]        |
|      [ Zen              ]        |
|                                  |
|   [Settings]  [Skins]  [Awards]  |
+----------------------------------+
```

### Settings Panel (Modal)
- Theme selector (dropdown or visual grid)
- Sound toggle (on/off) - for future use, can be placeholder
- Show grid toggle
- Snake speed (Slow / Normal / Fast) - affects base game speed

### Skins Panel (Modal)
- Grid of all 14 skins
- Locked skins shown grayed out with lock icon
- Hover/tap shows achievement requirement
- Click unlocked skin to select it
- Currently selected skin has highlight border

### Achievements Panel (Modal)
- List of all 14 achievements
- Each shows: name, description, progress (if applicable), locked/unlocked status
- Unlocked achievements show the skin reward
- Progress bars for trackable achievements (e.g., "7/10 games played")

### In-Game HUD
```
+----------------------------------+
| Score: 42        Mode: Classic   |
|                                  |
|                                  |
|         [GAME CANVAS]            |
|                                  |
|                                  |
|      ⏸ Space to Pause           |
+----------------------------------+
```

### Pause Overlay
- Semi-transparent dark overlay
- "PAUSED" text
- [Resume] [Restart] [Main Menu] buttons

### Game Over Overlay
- "GAME OVER" text
- Final score display
- New achievements earned (if any) with skin unlocks
- [Play Again] [Main Menu] buttons

### Achievement Notification (Toast)
- Slides in from top-right
- Shows achievement icon, name, and unlocked skin
- Auto-dismisses after 3 seconds
- Stackable if multiple unlock at once

---

## Game Mechanics

### Grid & Movement
- Canvas-based rendering
- Grid size: 20x20 cells (configurable)
- Cell size: Calculated to fit container (target ~400-600px play area)
- Snake moves one cell per tick
- Base tick rate by speed setting:
  - Slow: 150ms
  - Normal: 100ms
  - Fast: 70ms

### Snake Behavior
- Starts at length 3, centered, moving right
- Cannot reverse direction (pressing opposite direction ignored)
- Direction change queued and applied on next tick (prevents rapid-tap deaths)
- Grows by 1 cell when eating food

### Food Spawning
- One food item on screen at a time (except Zen which can have up to 3)
- Spawns in random empty cell (not on snake, walls, or obstacles)
- Food spawn has brief "pop-in" animation

### Collision Detection
- Check head position against:
  - Walls (except Zen mode - wrap around)
  - Snake body (except Zen mode - pass through)
  - Obstacles (Survival/Maze modes)
- Collision triggers game over sequence

### Procedural Maze Generation
- Use recursive backtracking to generate perfect maze
- Grid for maze: Same as game grid (20x20)
- After generation, remove 25-35% of internal walls randomly to create multiple paths
- Ensure food can always spawn (at least 30% open cells)
- Regenerate maze each time a level is completed

### Second Chance Mechanic (Optional/Future)
- Not implemented in v1
- Placeholder in settings (grayed out "Coming Soon")

---

## Visual Effects

### Particle System
- Lightweight particle emitter for:
  - Food collection burst (8-12 particles, theme-colored)
  - Snake trail in certain skins (e.g., Diamond Sparkle)
  - Background ambiance (Ocean bubbles, Space stars)
- Particles have: position, velocity, lifetime, color, size
- Update and render each frame, remove when lifetime expires

### Animations
- **Food pulse**: Subtle scale oscillation (CSS or JS)
- **Snake movement**: Smooth interpolation between grid cells (optional, can be snappy)
- **UI transitions**: Fade/slide for modals and menus
- **Achievement popup**: Slide in from top, slight bounce

### Screen Effects
- **Game over**: Brief red flash or shake
- **Level complete (Maze)**: Brief green flash
- **Achievement unlock**: Golden shimmer on screen edge

---

## Technical Implementation Notes

### State Management
```javascript
// Core game state structure
const gameState = {
  currentScreen: 'menu' | 'game' | 'paused' | 'gameover',
  gameMode: 'classic' | 'timeattack' | 'survival' | 'maze' | 'zen',
  snake: [{ x, y }, ...],
  direction: { x, y },
  nextDirection: { x, y },
  food: [{ x, y }, ...],
  obstacles: [{ x, y }, ...],
  score: 0,
  timeElapsed: 0,
  mazeLevel: 0,
  mazeWalls: [{ x, y }, ...],
};

// Session state (persists across games but not page refresh)
const sessionState = {
  selectedTheme: 'neon',
  selectedSkin: 'classic_green',
  unlockedSkins: Set(['classic_green']),
  unlockedAchievements: Set(['first_bite']),
  achievementProgress: {
    gamesPlayed: 0,
    modesPlayed: Set(),
    // ... other trackable progress
  },
  settings: {
    speed: 'normal',
    showGrid: true,
    sound: true,
  },
};
```

### Rendering Loop
- Use `requestAnimationFrame` for smooth rendering
- Separate game logic tick (setInterval at speed rate) from render loop
- Clear and redraw canvas each frame
- Layer order: Background → Grid → Maze walls → Obstacles → Food → Snake → Particles

### Responsive Design
- Canvas scales to fit container while maintaining aspect ratio
- Touch targets minimum 44px for mobile
- Media queries for mobile layout adjustments
- Test at: 320px, 768px, 1024px+ widths

### Performance Considerations
- Limit particles to ~50 active at once
- Use object pooling for particles if needed
- Avoid creating new objects in game loop
- Cache theme colors and skin properties

---

## File Structure

Single HTML file containing:
1. HTML structure (semantic, accessible)
2. `<style>` block with all CSS
3. `<script>` block with all JavaScript

Organize JavaScript into clear sections:
```javascript
// ============== CONSTANTS ==============
// ============== STATE ==============
// ============== THEMES ==============
// ============== SKINS ==============
// ============== ACHIEVEMENTS ==============
// ============== MAZE GENERATION ==============
// ============== GAME LOGIC ==============
// ============== RENDERING ==============
// ============== PARTICLES ==============
// ============== UI ==============
// ============== INPUT HANDLING ==============
// ============== AUDIO (PLACEHOLDER) ==============
// ============== INIT ==============
```

---

## Testing Checklist

### Gameplay
- [ ] Snake moves correctly in all 4 directions
- [ ] Cannot reverse direction
- [ ] Food spawns in valid locations
- [ ] Score increments on food collection
- [ ] Game over triggers on wall collision (non-Zen)
- [ ] Game over triggers on self collision (non-Zen)
- [ ] Zen mode wraps and passes through self

### Modes
- [ ] Classic: Endless play, score tracking
- [ ] Time Attack: Timer works, ends at 20 food
- [ ] Survival: Obstacles spawn, timer tracks
- [ ] Maze: Generates valid mazes, level progression
- [ ] Zen: No death possible, relaxing play

### Themes
- [ ] All 6 themes selectable
- [ ] Colors apply correctly
- [ ] Theme-specific effects render

### Skins
- [ ] All 14 skins render distinctly
- [ ] Locked skins not selectable
- [ ] Skin selection persists across games

### Achievements
- [ ] All 14 achievements can be unlocked
- [ ] Progress tracks correctly
- [ ] Notification displays on unlock
- [ ] Skin unlocks with achievement

### UI
- [ ] All menus navigate correctly
- [ ] Pause works mid-game
- [ ] Game over shows correct info
- [ ] Mobile touch controls work

---

## Future Enhancements (Out of Scope for v1)

- Sound effects and music
- Local storage persistence
- Online leaderboards
- Additional game modes
- Power-ups
- Second chance mechanic
- Custom theme creator
- More skins and achievements
