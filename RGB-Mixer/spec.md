# RGB Color Explorer — Spec

## Overview

A single-page interactive web app for exploring RGB color mixing, generating harmonious palettes, simulating color blindness, and checking contrast accessibility. The aesthetic should feel like a **dark-mode science instrument** — think color lab meets designer's toolkit. Deep dark backgrounds, glowing light effects, precise typography, and satisfying interactions. Use a monospace or technical display font for numbers/labels and a clean geometric font for UI. Everything should feel calibrated and precise.

---

## Feature 1: Flashlight Color Mixer

### Concept
Three circular "flashlights" — one red, one green, one blue — sit on a dark canvas. Each emits a colored glow. Where they overlap, colors mix additively (like real projected light). The user drags them around; the overlapping regions update in real time.

### Behavior
- Each flashlight is a draggable circle with a radial gradient glow in its color (R, G, or B).
- Overlapping regions blend colors additively:
  - Red + Green = Yellow
  - Red + Blue = Magenta
  - Green + Blue = Cyan
  - Red + Green + Blue = White
- The canvas is dark (near-black). Blending is done via CSS `mix-blend-mode: screen` or via Canvas 2D compositing.
- Each flashlight has a label (R / G / B) and a slider below the canvas to control its **intensity** (0–255). Intensity affects the brightness/opacity of that light.
- Display the current hex/RGB value of the center-of-overlap region (or wherever the user hovers/clicks on the canvas) in a readout panel.

### Implementation Notes
- Use an HTML5 Canvas element for rendering, or absolutely-positioned divs with `mix-blend-mode: screen` on a dark background.
- Flashlights should snap back if dragged off-canvas.
- Show a small coordinate indicator when dragging.

---

## Feature 2: Harmonious Color Palette Generator

### Concept
The user picks a base color (via a color picker or by clicking anywhere on the mixer canvas to sample that color). The app generates a harmonious palette using standard color theory relationships.

### Behavior
- **Input**: A color picker (HTML `<input type="color">` styled to match the UI) plus an option to "sample from mixer."
- **Harmony modes** (user selects one):
  - Complementary (opposite on color wheel)
  - Analogous (adjacent colors, ±30°)
  - Triadic (three evenly spaced colors, 120° apart)
  - Split-Complementary (base + two colors adjacent to its complement)
  - Tetradic / Square (four colors, 90° apart)
- **Output**: A row of color swatches. Each swatch shows:
  - The color fill
  - Hex code
  - RGB values
  - A copy-to-clipboard button
- The palette updates live as the base color or harmony mode changes.

### Implementation Notes
- Convert hex → HSL for rotation math, then back to hex/RGB for display.
- Animate swatches in when they update (fade/slide).

---

## Feature 3: Color Blindness Simulator

### Concept
A toggle that applies a real-time color blindness simulation filter over the entire page (or a specific preview panel). The user can select the type of color blindness to see how all the colors on screen appear to someone with that condition.

### Behavior
- **Toggle switch**: "Color Blindness Simulation — ON/OFF"
- **Selector** (visible when ON): dropdown or pill-buttons for:
  - Protanopia (red-blind)
  - Deuteranopia (green-blind)
  - Tritanopia (blue-blind)
  - Protanomaly (red-weak)
  - Deuteranomaly (green-weak)
  - Tritanomaly (blue-weak)
  - Achromatopsia (total color blindness / grayscale)
- When active, apply an SVG `<feColorMatrix>` filter (or CSS filter) to a designated preview container. The filter matrices for each type are well-established (use Brettel/Viénot/Machado matrices or the commonly used approximations).
- Optionally: show a split-view where left half is normal and right half is simulated.

### Filter Matrices (use these or equivalent)
Provide accurate color transformation matrices for each type in the code. These are widely published approximations:
- Protanopia, Deuteranopia, Tritanopia (dichromacy)
- Protanomaly, Deuteranomaly, Tritanomaly (anomalous trichromacy)
- Achromatopsia (luminance-only grayscale)

---

## Feature 4: WCAG Contrast Checker

### Concept
The user selects two colors — a foreground and a background — and the tool calculates the contrast ratio and reports WCAG 2.1 pass/fail for AA and AAA levels.

### Behavior
- Two color pickers: "Text Color" and "Background Color"
- A live preview panel showing sample text rendered in those colors
  - Sample text sizes: normal text (18px regular / 14px bold = "small text") and large text (24px+ = "large text")
- **Contrast ratio display**: Shows the ratio formatted as `X.XX : 1` in large type
- **WCAG results table**:

  | Level | Normal Text | Large Text |
  |-------|-------------|------------|
  | AA    | ≥ 4.5:1     | ≥ 3:1      |
  | AAA   | ≥ 7:1       | ≥ 4.5:1    |

  Each cell shows ✓ PASS or ✗ FAIL with appropriate color coding.
- A "Swap Colors" button.
- Option to sample colors from the mixer canvas or palette swatches.

### Implementation Notes
- Use the WCAG relative luminance formula:
  - Convert sRGB to linear: `c_linear = (c/255)^2.2` (simplified) or the precise piecewise formula.
  - `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
  - `Contrast = (L_lighter + 0.05) / (L_darker + 0.05)`
- Use the precise WCAG 2.1 sRGB linearization formula, not the simplified one.

---

## Visual Design Direction

**Aesthetic**: Dark science instrument. Color lab. Feels like an expensive piece of calibration hardware.

- **Background**: Very dark desaturated navy/charcoal (`#0a0b0f` or similar), not pure black.
- **Panels**: Slightly lighter dark cards with subtle borders (`1px solid rgba(255,255,255,0.08)`).
- **Typography**:
  - Display/headings: Something geometric and technical — e.g., `DM Mono`, `Space Mono`, or `IBM Plex Mono` for numeric readouts; `Syne` or `Outfit` for labels.
  - Body: Clean, slightly condensed sans.
  - Load from Google Fonts.
- **Accent colors**: Use the actual RGB primaries sparingly as accents (red glow, green glow, blue glow where appropriate). White text at ~90% opacity.
- **Glows and shadows**: Use `box-shadow` with colored glows on interactive elements. The flashlight circles should have a strong radial glow.
- **Layout**: Single scrollable page with clear section divisions. Each feature is a full-width section. Use a sticky header with the app name and perhaps a subtle animated color gradient.
- **Micro-interactions**: Hover states, smooth transitions (200–300ms ease), subtle scale transforms on interactive elements.
- **No purple gradients. No generic SaaS look.**

---

## Technical Requirements

- **Single HTML file** — all CSS and JS inline. No build tools, no npm, no external JS frameworks.
- Vanilla JS only (no React, Vue, etc.).
- External resources allowed: Google Fonts via `<link>`, no other CDN dependencies.
- Must work in modern Chrome/Firefox/Safari without any server — open directly as a local file.
- Fully responsive down to 768px width minimum.
- No accessibility violations in the chrome from the tool itself (ironic to have an inaccessible contrast checker).

---

## File Output

- Single file: `index.html`
- All features on one page, smooth scroll between sections.
- Section IDs: `#mixer`, `#palette`, `#colorblind`, `#contrast`
- A nav bar at top with links to each section.
