# Readability Explorer — Build Spec

## Overview
A single-page web application that lets users explore how typography, color, and vision differences affect text readability. The tool provides real-time feedback on contrast ratios and luminosity values as the user adjusts visual parameters.

---

## Aesthetic Direction
**Editorial / Scientific Instrument** — Think a high-quality optometry chart meets a modern type specimen sheet. Use a clean, utilitarian aesthetic with a monospaced or slab-serif UI font paired with an elegant serif for the sample text display. Dark-themed control panel alongside a light or variable display area. The experience should feel precise and purposeful — like a calibrated tool, not a toy.

Suggested fonts (load from Google Fonts or similar):
- UI/labels: `"IBM Plex Mono"` or `"Space Mono"`
- Sample text: `"Playfair Display"` or `"Lora"`

Color palette: near-black UI chrome (`#111`), off-white panel backgrounds, accent in amber or teal. Use CSS custom properties throughout.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Readability Explorer" + short subtitle             │
├───────────────────────┬──────────────────────────────────────┤
│  CONTROL PANEL        │  TEXT DISPLAY AREA                   │
│  (left column ~380px) │  (right column, fills remaining)     │
│                       │                                      │
│  Vision Type          │  [Sample text rendered here]         │
│  Color Controls       │                                      │
│  Text Size            │                                      │
│                       │                                      │
├───────────────────────┴──────────────────────────────────────┤
│  METRICS BAR: Contrast Ratio | Text Luminance | BG Luminance │
└──────────────────────────────────────────────────────────────┘
```

Responsive: stack vertically on narrow viewports (< 768px), metrics bar moves below both columns.

---

## Controls

### 1. Vision Type Selector
- A segmented button group or styled radio group with five options:
  - `Normal`
  - `Protanopia` (red-blind)
  - `Deuteranopia` (green-blind)
  - `Tritanopia` (blue-blind)
  - `Monochromacy` (achromatopsia / total color blindness)
- **When any non-Normal option is active:**
  - All RGB sliders are **disabled** and visually grayed out with an overlay or reduced opacity.
  - A small informational tooltip or inline note explains: *"Sliders are disabled in simulation mode — the displayed colors are simulated, not editable."*
  - The color swatches and text display area update to show the simulated appearance.
- Selecting `Normal` re-enables all sliders.
- Default: `Normal`

### 2. Background Color (RGB Sliders)
Three labeled sliders, each range `0–255`, labeled `R`, `G`, `B`.
- Show a live color swatch next to the label or inline.
- Default: `R:255, G:255, B:255` (white)

### 3. Text Color (RGB Sliders)
Same structure as background color.
- Default: `R:0, G:0, B:0` (black)

### 4. Text Size Slider
- Range: `10px` to `72px`
- Step: `1px`
- Show current value as a numeric readout (e.g., `"32px"`)
- Default: `18px`

---

## Text Display Area
- Fills the right column.
- Background color = current background RGB (or simulated equivalent).
- Text color = current text RGB (or simulated equivalent).
- Font size = current text size slider value.
- Font family = the chosen specimen serif.
- Contains a multi-paragraph text sample, approximately 150–250 words. Suggested content: a passage about perception, light, color, or typography (public domain). Something like an excerpt from Goethe's *Theory of Colors* or a short lorem-style passage about reading and visual acuity. Make it feel intentional, not placeholder.
- Padding: generous (at least `2rem`).
- The display area should update **instantly** on any slider or vision type change (no submit button).

---

## Metrics Bar / Panel

Displayed prominently — large numbers, clearly labeled. Update in real time.

### Contrast Ratio
- Calculated per **WCAG 2.1 relative luminance formula**.
- Display as `X.XX:1` (e.g., `"4.54:1"`).
- Color-code the ratio value based on WCAG thresholds:
  - ≥ 7:1 → green (AAA)
  - ≥ 4.5:1 → yellow/amber (AA)
  - ≥ 3:1 → orange (AA Large)
  - < 3:1 → red (Fail)
- Show a badge or label indicating the WCAG level: `AAA`, `AA`, `AA Large`, or `Fail`.
- Note: use the **simulated** colors for the calculation when a vision simulation is active.

### Text Luminance
- Relative luminance of the text color (or simulated equivalent), range `0.000` to `1.000`.
- Display as `L: 0.XXX`

### Background Luminance
- Same for background.
- Display as `L: 0.XXX`

---

## Color Vision Simulation

Implement color blindness simulation using the **Brettel / Viénot / Mollon** transformation matrices (or the widely used approximations from Machado et al. 2009 or the harlequin/colorblind-simulation approach).

The simulation must:
1. Take the user's selected RGB values for text and background.
2. Apply the appropriate matrix transformation for the selected vision type.
3. Display the **transformed** colors in the text area and swatches.
4. Use the **transformed** colors for contrast ratio and luminance calculations.

### Transformation Matrices (LMS-based, linearized sRGB)

Use these standard LMS simulation matrices (apply in linear light after sRGB linearization):

**Protanopia:**
```
| 0.56667  0.43333  0.00000 |
| 0.55833  0.44167  0.00000 |
| 0.00000  0.24167  0.75833 |
```

**Deuteranopia:**
```
| 0.625    0.375    0.000   |
| 0.700    0.300    0.000   |
| 0.000    0.300    0.700   |
```

**Tritanopia:**
```
| 0.95     0.05     0.000   |
| 0.000    0.43333  0.56667 |
| 0.000    0.475    0.525   |
```

**Monochromacy (Achromatopsia):**
Convert to luminance: `R' = G' = B' = 0.2126·R + 0.7152·G + 0.0722·B` (standard luminance weights, applied in linear light).

**Pipeline per color:**
1. Normalize RGB to `[0, 1]`
2. Linearize (gamma expand): `c_lin = (c/12.92)` if `c ≤ 0.04045`, else `((c + 0.055)/1.055)^2.4`
3. Apply the transformation matrix (or luminance formula for monochromacy)
4. Gamma compress back to sRGB: `c_srgb = 12.92·c_lin` if `c_lin ≤ 0.0031308`, else `1.055·c_lin^(1/2.4) − 0.055`
5. Clamp to `[0, 1]` and multiply by 255

Apply this to both text and background colors independently.

---

## Synchronization / Reactivity

All updates must be **synchronous and immediate** — no debounce, no animation delay on the values themselves. Use the `input` event (not `change`) on all sliders so updates fire while dragging.

Every time any input changes:
1. Read all current slider values.
2. If vision type ≠ Normal, compute simulated colors for text and background.
3. Update the text display area CSS (background-color, color, font-size).
4. Recompute contrast ratio and both luminance values.
5. Update the metrics display and WCAG badge.
6. Update color swatches.

---

## Accessibility (Meta-irony noted — the tool itself must be accessible)
- All controls must have proper `<label>` associations or `aria-label`.
- Sliders should show current value in a visible `<output>` or `<span>`.
- Focus indicators must be visible.
- The tool does not need to pass WCAG at every configuration (by design), but the chrome/controls themselves should.

---

## Technical Constraints
- **Single HTML file** — all CSS and JS inline or in `<style>` / `<script>` tags.
- No build tools, no frameworks. Vanilla HTML/CSS/JS only.
- Fonts may be loaded from Google Fonts CDN.
- No external JS dependencies.
- Must work in modern browsers (Chrome, Firefox, Safari, Edge).

---

## Deliverable
A single file: `readability-explorer.html`
