# Boids Flocking Simulation — Specification

## Overview

A browser-based simulation of Craig Reynolds' "boids" algorithm, demonstrating emergent flocking behavior through three simple rules: separation, alignment, and cohesion. Features real-time parameter adjustment, aesthetic customization, live statistics, and interactive mouse behavior.

---

## Core Concepts

### What are Boids?

Boids are autonomous agents that simulate the flocking behavior of birds, fish, or other animals. Each boid follows identical rules based only on its local perception of nearby neighbors, yet complex, lifelike group behavior emerges from these simple interactions.

### The Three Rules

1. **Separation** — Steer to avoid crowding nearby boids. Each boid maintains personal space by moving away from neighbors that get too close.

2. **Alignment** — Steer toward the average heading of nearby boids. Each boid adjusts its velocity to match the general direction of its local flockmates.

3. **Cohesion** — Steer toward the average position of nearby boids. Each boid moves toward the center of mass of its neighbors, keeping the flock together.

---

## Technical Specification

### Canvas & Rendering

| Property | Value |
|----------|-------|
| Render target | HTML5 Canvas (2D context) |
| Dimensions | Full viewport width and height |
| Background | Configurable (default: dark) |
| Frame rate | 60 FPS target via `requestAnimationFrame` |

### Boid Properties

Each boid maintains the following state:

```
position: { x, y }       // Current location on canvas
velocity: { x, y }       // Current movement vector
acceleration: { x, y }   // Forces applied this frame
```

### Algorithm

Each frame, for each boid:

1. **Find neighbors** within `neighborRadius`
2. **Calculate steering forces:**
   - Separation: weighted average of vectors pointing away from too-close neighbors
   - Alignment: steer toward average velocity of neighbors
   - Cohesion: steer toward average position (center of mass) of neighbors
3. **Apply mouse interaction** (if enabled)
4. **Apply weights** to each force
5. **Sum forces** into acceleration
6. **Update velocity:** `velocity += acceleration`
7. **Limit speed** to `maxSpeed`
8. **Update position:** `position += velocity`
9. **Wrap edges** (toroidal topology)
10. **Reset acceleration** for next frame

### Edge Behavior

Boids wrap around screen edges (toroidal space):
- Exiting right → enter left
- Exiting bottom → enter top
- And vice versa

---

## User Interface

### Layout

The simulation runs fullscreen with an overlay control panel. The panel should be collapsible to allow unobstructed viewing of the simulation.

### Statistics Display

A persistent stats bar (top or corner of screen) showing real-time metrics:

| Statistic | Description |
|-----------|-------------|
| **FPS** | Frames per second (updated every 500ms for stability) |
| **Boid Count** | Current number of boids in simulation |
| **Avg Speed** | Mean velocity magnitude across all boids |
| **Avg Neighbors** | Mean number of neighbors per boid within perception radius |

---

## Settings Panel

### Simulation Parameters

Core physics and behavior controls:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Boid Count** | 10–500 | 150 | Number of boids in simulation |
| **Separation Weight** | 0–5 | 1.5 | Strength of avoidance behavior |
| **Alignment Weight** | 0–5 | 1.0 | Strength of velocity matching |
| **Cohesion Weight** | 0–5 | 1.0 | Strength of flocking toward center |
| **Neighbor Radius** | 20–200 | 50 | Distance to detect other boids |
| **Max Speed** | 1–10 | 4 | Maximum boid velocity |

### Mouse Interaction

Dropdown or toggle selector for mouse behavior:

| Mode | Behavior |
|------|----------|
| **None** | Mouse has no effect on boids |
| **Attract / Lead** | Boids steer toward mouse cursor position |
| **Repel** | Boids flee from mouse cursor position |

Additional mouse settings:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Mouse Radius** | 50–300 | 100 | Area of effect around cursor |
| **Mouse Strength** | 0–5 | 2.0 | Force multiplier for mouse interaction |

### Predator Mode

A toggleable feature that introduces a predator boid into the simulation. The predator creates dynamic tension as boids flee while still trying to maintain flock cohesion.

**Predator Behavior:**

| Property | Description |
|----------|-------------|
| **Hunting** | Predator steers toward the nearest boid or center of nearest flock cluster |
| **Speed** | Slightly faster than standard boids (110-120% of max speed) |
| **Persistence** | Predator locks onto a target and pursues until it catches it or a closer target appears |

**Boid Response to Predator:**

| Behavior | Description |
|----------|-------------|
| **Detection Range** | Boids detect predator at 2x their normal neighbor radius |
| **Flee Response** | Strong separation force away from predator (overrides normal cohesion when predator is near) |
| **Panic Spreading** | Boids near fleeing boids also begin to flee (cascading alarm) |

**Predator Settings:**

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Predator Enabled** | On / Off | Off | Toggle predator in simulation |
| **Predator Count** | 1–5 | 1 | Number of predators |
| **Predator Speed** | 100%–150% | 115% | Speed relative to boid max speed |
| **Predator Aggression** | 0–5 | 2.0 | How strongly predator pursues prey |
| **Kill Radius** | 5–20 | 10 | Distance at which predator "catches" a boid |
| **Respawn Prey** | On / Off | On | Caught boids respawn at random edge location |

**Predator Appearance:**
- Visually distinct from regular boids (larger, different color — default red)
- More aggressive, angular shape (sharper triangle or arrow)
- Optional: pulsing glow or subtle particle effect to draw attention
- In Airplane preset: becomes a red military interceptor with afterburner glow

### Draw Walls

Allows users to draw obstacles that boids must avoid, creating custom environments and flow patterns.

**Drawing Mechanics:**

| Action | Result |
|--------|--------|
| **Click + Drag** | Draw a wall segment along the mouse path |
| **Release** | Finalize wall segment |
| **Continue drawing** | Click and drag again to add more segments |

**Wall Behavior:**

| Property | Description |
|----------|-------------|
| **Avoidance** | Boids steer away from walls before collision (soft boundary) |
| **Detection Range** | Boids detect walls at ~2x their separation radius |
| **Collision** | If a boid contacts a wall, it reflects/bounces off |
| **Predator Interaction** | Predators also avoid walls (cannot pass through) |

**Wall Settings:**

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Draw Mode** | On / Off | Off | Toggle wall drawing (disables mouse interaction while active) |
| **Wall Thickness** | 2–20 | 8 | Visual and collision thickness in pixels |
| **Wall Color** | Color picker | Gray (#666666) | Color of drawn walls |
| **Wall Opacity** | 0.2–1.0 | 0.8 | Transparency of walls |
| **Clear All Walls** | Button | — | Remove all walls from simulation |
| **Undo Last Wall** | Button | — | Remove most recently drawn wall segment |

**Wall Appearance:**
- Rendered as solid lines/strokes with rounded ends
- Optional subtle glow or outline for visibility
- In Airplane preset: walls could appear as restricted airspace zones (red tinted, dashed border)

**Advanced Wall Options (optional):**

| Feature | Description |
|---------|-------------|
| **Wall Presets** | Quick-add common shapes: circle, corridor, funnel, maze |
| **Moving Walls** | Walls that oscillate or rotate (future enhancement) |

### Aesthetic Settings

Visual customization options:

| Setting | Options / Range | Default | Description |
|---------|-----------------|---------|-------------|
| **Boid Color** | Color picker or presets | White (#ffffff) | Fill color of boids |
| **Background Color** | Color picker or presets | Near-black (#0a0a0a) | Canvas background |
| **Boid Size** | 4–20 | 10 | Length of boid triangle in pixels |
| **Show Trails** | On / Off | Off | Render fading trail behind each boid |
| **Trail Length** | 5–50 | 20 | Number of previous positions to render (if trails enabled) |
| **Trail Opacity** | 0.1–1.0 | 0.3 | Starting opacity of trail |
| **Color Mode** | Static / Velocity / Direction | Static | Dynamic coloring based on boid state |

**Color Mode Options:**
- **Static:** All boids use the selected boid color
- **Velocity:** Color maps to speed (slow = cool colors, fast = warm colors)
- **Direction:** Color based on heading angle (hue mapped to 0–360°)

---

## Presets

Presets are complete visual and behavioral themes that override all individual aesthetic settings. When a preset is active, the individual aesthetic controls are disabled (grayed out). The user can switch back to "Custom" to regain manual control.

### Preset: Airplanes

A realistic aviation theme transforming boids into aircraft flying through the sky.

#### Aircraft Types

The simulation includes a variety of aircraft with visual variation:

| Category | Examples | Characteristics |
|----------|----------|-----------------|
| **Airliners** | Wide-body, narrow-body silhouettes | Largest size, slower turn rate, long contrails |
| **General Aviation** | Single-engine, twin-engine props | Smallest size, moderate agility |
| **Military Fighter** | Swept-wing jet silhouettes | Small-medium size, highest agility |
| **Military Heavy** | Cargo/bomber silhouettes | Large size, slow turn rate, multiple contrails |

- Aircraft type is assigned randomly on spawn with configurable distribution
- Each type has a distinct top-down silhouette shape
- Size varies within each category for additional variety

#### Sky & Background

| Layer | Description |
|-------|-------------|
| **Sky Gradient** | Vertical gradient from light blue (#87CEEB) at horizon to deeper blue (#1E90FF) at top |
| **Sun** | Subtle glow effect in upper corner with optional lens flare |
| **Clouds (far)** | Large, slow-moving cloud shapes at lowest parallax layer |
| **Clouds (mid)** | Medium clouds, moderate parallax speed |
| **Clouds (near)** | Smaller, faster-moving wisps closest to viewer |
| **Ground** | Faint patchwork grid/texture at bottom edge suggesting farmland or terrain far below |

#### Aircraft Details

| Feature | Description |
|---------|-------------|
| **Contrails** | White vapor trails behind engines, length varies by aircraft type, fades to transparent |
| **Navigation Lights** | Blinking lights: red (left wingtip), green (right wingtip), white (tail) — blink pattern staggers across aircraft |
| **Coloring** | Airliners: white/gray with airline-style livery hints. Military: gray/olive. GA: varied colors (white, red, blue) |
| **Shadows** | Soft, offset shadow beneath each aircraft suggesting altitude |

#### Behavioral Modifications

When the Airplane preset is active, the following behavioral changes apply:

| Parameter | Change | Reason |
|-----------|--------|--------|
| **Turn Rate** | Limited max turn per frame | Aircraft bank realistically, cannot pivot |
| **Minimum Speed** | Enforced (50% of max speed) | Planes cannot hover or move too slowly |
| **Banking Visual** | Aircraft tilt/rotate slightly when turning | Visual feedback for direction changes |

#### Time of Day Variants (optional sub-setting)

| Variant | Sky Colors | Lighting |
|---------|------------|----------|
| **Midday** | Bright blue gradient | Full brightness, white sun glow |
| **Dawn** | Orange/pink at horizon fading to blue | Warm golden light, long shadows |
| **Dusk** | Purple/orange gradient | Amber sun glow, reddish tints |
| **Night** | Dark blue to black | Stars visible, aircraft lights more prominent, no shadows |

---

### Preset: Custom (Default)

Manual control mode. All individual aesthetic settings are active and adjustable. This is the default state when no preset is selected.

---

### Future Presets (Placeholder)

Additional presets can be added in future versions:
- **Underwater** — Fish, bubbles, caustic light patterns
- **Space** — Spacecraft, stars, nebulae
- **Birds** — Realistic bird shapes, nature environment

---

## Visual Design

### Boid Rendering (Custom Mode)

- Shape: Isoceles triangle pointing in direction of velocity
- Default size: 10px length, ~6px base width
- Filled with current color (per aesthetic settings)

### Trail Rendering (Custom Mode, when enabled)

- Store last N positions per boid
- Render as fading line or series of smaller shapes
- Opacity decreases linearly from current position backward

### UI Style

- Semi-transparent dark panel background
- Clean, minimal typography
- Smooth slider controls with visible current values
- Panel can be collapsed/expanded via button or keyboard shortcut

---

## Controls Summary

| Input | Action |
|-------|--------|
| Mouse move | Interact with boids (if mode enabled) |
| Click on panel | Adjust settings |
| `H` key | Toggle settings panel visibility |
| `R` key | Reset simulation with current settings |
| `Space` key | Pause / Resume simulation |

---

## Presets

Presets are complete visual and behavioral themes that override all individual aesthetic settings. When a preset is active, the standard aesthetic controls are disabled (grayed out) and the preset's configuration takes over entirely.

### Preset: Airplanes

A fully-realized aviation theme transforming boids into aircraft flying high above the earth.

#### Aircraft Variety

The simulation spawns a mix of aircraft types, each with distinct silhouettes and sizes:

| Type | Examples | Size | Proportion |
|------|----------|------|------------|
| **Airliners** | 737-style, A320-style, wide-body jumbo | Large | ~25% |
| **General Aviation** | Cessna-style single prop, twin-engine prop | Small | ~35% |
| **Fighter Jets** | F-16-style, F-22-style delta wing | Small-Medium | ~25% |
| **Military Heavy** | C-130-style cargo, B-52-style bomber | Large | ~15% |

- Aircraft type is assigned randomly on spawn
- Each type has a unique top-down silhouette shape
- Size differences are visually apparent but don't affect flocking physics

#### Sky & Background

| Layer | Description |
|-------|-------------|
| **Sky Gradient** | Vertical gradient from light blue (#87CEEB) at horizon to deeper blue (#1E90FF) at top |
| **Sun** | Subtle bright spot with soft glow in upper corner (randomly placed on init) |
| **Parallax Clouds** | Multiple cloud layers at different depths |

**Parallax Cloud System:**
- **Far clouds (background):** Large, soft, slow-moving (~10% of boid speed), low opacity
- **Mid clouds:** Medium size, moderate speed (~25% of boid speed)
- **Near clouds (foreground):** Smaller, faster-moving (~50% of boid speed), can partially obscure aircraft
- Clouds drift slowly in a consistent wind direction
- Clouds wrap around screen edges seamlessly

#### Ground Layer

- Faint terrain texture at the very bottom of the canvas
- Patchwork of muted greens and browns suggesting farmland/geography from altitude
- Very low opacity (~10-15%) to keep focus on aircraft
- Subtle parallax movement (slowest layer) to convey altitude and speed

#### Aircraft Details

**Contrails / Vapor Trails:**
- White, semi-transparent trails behind each aircraft
- Length proportional to aircraft size (airliners = longer trails)
- Gradual fade-out over distance
- Slight wavering/dissipation effect

**Navigation Lights:**
- Blinking lights on each aircraft
- Red light on left wingtip, green on right (aviation standard)
- White tail light
- Blink cycle: ~1 second interval, staggered randomly per aircraft so they don't sync

**Aircraft Coloring:**
- Airliners: White fuselage with subtle airline-style livery hints
- GA aircraft: Mixed colors (white, blue, red accents)
- Fighter jets: Gray military paint
- Military heavy: Gray-green camouflage or gray

#### Behavioral Modifications

When the Airplane preset is active, the following physics changes apply:

| Parameter | Standard | Airplane Preset | Reason |
|-----------|----------|-----------------|--------|
| **Turn Rate** | Instant | Gradual (banking) | Planes can't pivot; they bank into turns |
| **Minimum Speed** | 0 | 40% of max speed | Aircraft must maintain airspeed to fly |
| **Max Turn Angle** | Unlimited | ~5° per frame | Smooth, realistic arcing turns |

**Banking Behavior:**
- Aircraft visually tilt (rotate on z-axis) when turning
- Bank angle proportional to turn sharpness
- Gradual return to level flight when flying straight

#### Audio (Optional)

If audio is enabled in settings:
- Ambient wind loop (soft, high-altitude atmosphere)
- Faint, distant jet engine drone
- Volume scales with average boid speed

---

## Implementation Notes

### Performance Considerations

- For boid counts > 200, consider spatial partitioning (grid or quadtree) for neighbor detection
- Use a single canvas clear + redraw per frame (avoid clearing trails area if trails enabled)
- Throttle statistics calculations to avoid per-frame overhead

### Initialization

- Boids spawn at random positions across canvas
- Initial velocities are random unit vectors scaled to ~50% of max speed
- Ensures immediate movement without clustering at start