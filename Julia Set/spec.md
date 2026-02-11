# Julia Set Explorer — Specification

## Overview

A visually polished, dual-view web application for exploring Julia sets. The left panel displays the Mandelbrot set as a "map" for selecting the complex parameter c, while the right panel renders the corresponding Julia set in real-time. Designed for casual exploration with beautiful aesthetics and curated presets.

---

## Architecture

### Technology Stack
- **Rendering**: WebGL 2.0 (with Canvas 2D fallback)
- **Framework**: Vanilla JS or lightweight framework (Preact/Svelte optional)
- **Styling**: CSS with custom properties for theming
- **Build**: Single HTML file for simplicity, or Vite for development

### Performance Strategy
- Progressive rendering: immediate low-resolution preview → refinement to full resolution
- Render on hover uses reduced resolution; locked view renders at full quality
- WebGL shaders handle per-pixel iteration in parallel
- Throttle hover events to ~30fps during mouse movement

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: "Julia Set Explorer" (minimal, dark)                  │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│      Mandelbrot Set         │         Julia Set                 │
│      (c selector)           │         (main view)               │
│                             │                                   │
│   [hover to preview]        │   [current c value display]       │
│   [click to lock]           │                                   │
│                             │                                   │
├─────────────────────────────┴───────────────────────────────────┤
│  Control Bar: [Presets ▾] [Colors ▾] [Iterations] [Reset]      │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (>1024px)**: Side-by-side panels, equal width
- **Tablet (768-1024px)**: Stacked vertically, Mandelbrot on top (smaller)
- **Mobile (<768px)**: Tab switching between views, swipe to toggle

---

## Features

### 1. Dual-Panel Visualization

#### Mandelbrot Panel (Left)
- Displays the Mandelbrot set as a navigation map
- Crosshair cursor indicating current c position
- Click to lock a c value; hover for live preview
- Independent zoom and pan controls
- Subtle pulsing indicator on currently selected point

#### Julia Panel (Right)
- Renders the Julia set for the current c value
- Displays c value in elegant overlay (e.g., "c = -0.7269 + 0.1889i")
- Independent zoom and pan
- "Locked" indicator when c is fixed (vs live preview mode)

### 2. Interaction

| Action | Mandelbrot Panel | Julia Panel |
|--------|------------------|-------------|
| Hover | Preview Julia set for that c | — |
| Click | Lock c value | — |
| Drag | Pan view | Pan view |
| Scroll/Pinch | Zoom in/out | Zoom in/out |
| Double-click | Zoom in centered | Zoom in centered |

#### Preview vs Lock Mode
- **Preview mode**: Julia set updates as mouse moves over Mandelbrot (throttled, lower res)
- **Lock mode**: Click to fix c; Julia set renders at full resolution
- Visual indicator distinguishes modes (e.g., dashed vs solid border on Julia panel)

### 3. Preset Gallery

Curated presets with evocative names and thumbnail previews:

| Name | c Value | Character |
|------|---------|-----------|
| Dendrite | c = 0 + 1i | Tree-like branching |
| Spiral Galaxy | c = -0.7269 + 0.1889i | Classic spiral arms |
| Seahorse Valley | c = -0.75 + 0.1i | Seahorse-shaped spirals |
| Lightning | c = -0.1 + 0.651i | Electric branching |
| Rabbit | c = -0.123 + 0.745i | Connected "rabbit" shape |
| Dragon | c = -0.8 + 0.156i | Dragon curve-like |
| Starfish | c = -0.5251993 + 0.5251993i | Five-fold symmetry |
| Frost | c = -0.4 + 0.6i | Crystalline patterns |
| San Marco | c = -0.75 + 0i | Basilica-like symmetry |
| Douady Rabbit | c = -0.122561 + 0.744862i | Classic connected set |
| Siegel Disk | c = -0.390541 - 0.586788i | Smooth circular region |
| Cantor Dust | c = 0.36 + 0.1i | Disconnected dust |

Preset UI:
- Dropdown or modal gallery
- Hover shows thumbnail preview
- Click applies preset (sets c, optionally resets zoom)

### 4. Color Schemes

Named palettes with smooth gradient interpolation:

| Name | Description |
|------|-------------|
| Twilight | Purple → pink → orange → dark blue |
| Ocean | Deep blue → cyan → white foam |
| Ember | Black → red → orange → yellow |
| Monochrome | Black → white with smooth gradients |
| Aurora | Green → cyan → purple → pink |
| Vintage | Muted earth tones, sepia feel |
| Electric | Black → blue → cyan → white |
| Infrared | Black → purple → red → white |

Color implementation:
- Smooth iteration count (escape-time + fractional part)
- Palette stored as color stops; interpolate in shader
- Both panels use the same active palette

### 5. Controls

#### Iteration Depth
- Slider: 50 → 500 (default: 200)
- Higher = more detail, slower render
- Label shows current value

#### Reset Buttons
- "Reset Mandelbrot" — return to default view (centered, zoomed out)
- "Reset Julia" — return to default view for current c
- "Reset All" — full reset including c value

#### View Options (optional, in settings)
- Toggle coordinate display
- Toggle preview-on-hover vs click-only mode
- Resolution quality selector (Performance / Balanced / Quality)

---

## Visual Design

### Theme
Dark mode primary, with option for light mode.

### Colors
- Background: `#0a0a0f` (near-black with slight blue)
- Panel background: `#12121a`
- Accent: `#6366f1` (indigo)
- Text: `#e2e8f0` (light gray)
- Muted text: `#64748b`

### Typography
- Font: System font stack or Inter/JetBrains Mono for coordinates
- Sizes: Minimal, elegant headers

### UI Elements
- Frosted glass effect on control bar (backdrop-blur)
- Subtle borders: 1px `rgba(255,255,255,0.1)`
- Rounded corners: 8px on panels, 4px on buttons
- Smooth transitions: 150ms ease on all interactive elements

### Coordinate Display
- Positioned in corner of Julia panel
- Semi-transparent background
- Format: `c = -0.7269 + 0.1889i` (4 decimal places)
- Subtle fade-in on change

### Loading States
- Shimmer effect during high-res render
- Or subtle progress indicator in corner
- Never block interaction

---

## Technical Implementation

### WebGL Shader (Julia Set)

```glsl
// Pseudocode for fragment shader
uniform vec2 c;           // Julia constant
uniform vec2 center;      // View center
uniform float zoom;       // Zoom level
uniform int maxIter;      // Iteration limit
uniform sampler2D palette; // Color palette texture

void main() {
    vec2 z = (gl_FragCoord.xy - resolution/2.0) / zoom + center;
    
    int iter = 0;
    for (int i = 0; i < maxIter; i++) {
        if (dot(z, z) > 4.0) break;
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        iter++;
    }
    
    // Smooth coloring
    float smoothed = float(iter) - log2(log2(dot(z,z)));
    vec3 color = texture(palette, vec2(smoothed / float(maxIter), 0.5)).rgb;
    
    gl_FragColor = vec4(color, 1.0);
}
```

### State Management

```javascript
const state = {
    c: { re: -0.7269, im: 0.1889 },  // Current Julia constant
    locked: false,                    // Whether c is locked
    
    mandelbrot: {
        center: { re: -0.5, im: 0 },
        zoom: 1.5
    },
    
    julia: {
        center: { re: 0, im: 0 },
        zoom: 1.5
    },
    
    maxIterations: 200,
    colorScheme: 'twilight',
    
    ui: {
        presetOpen: false,
        colorsOpen: false
    }
};
```

### Event Handling

```javascript
// Mandelbrot panel
mandelbrotCanvas.addEventListener('mousemove', throttle((e) => {
    if (!state.locked) {
        state.c = screenToComplex(e, mandelbrotCanvas, state.mandelbrot);
        renderJulia(/* lowRes: */ true);
    }
}, 33)); // ~30fps

mandelbrotCanvas.addEventListener('click', (e) => {
    state.c = screenToComplex(e, mandelbrotCanvas, state.mandelbrot);
    state.locked = true;
    renderJulia(/* lowRes: */ false);
});
```

---

## File Structure

```
julia-explorer/
├── index.html          # Main HTML with inline critical CSS
├── style.css           # Full styles
├── main.js             # Application entry, state, UI
├── renderer.js         # WebGL setup and rendering
├── shaders/
│   ├── mandelbrot.glsl
│   └── julia.glsl
├── palettes.js         # Color scheme definitions
├── presets.js          # Preset c values and metadata
└── utils.js            # Math helpers, throttle, etc.
```

Or for simplicity: single `index.html` with embedded JS/CSS.

---

## Future Enhancements (Out of Scope for V1)

- Animation mode: c travels along a path, creating video-like exploration
- Share button: encode state in URL for sharing specific views
- Download image: export current Julia set as PNG
- Custom color palette editor
- Higher-power Julia sets (z³ + c, z⁴ + c, etc.)
- Orbit visualization: show iteration path for a clicked point
- Audio-reactive mode: c modulated by microphone input

---

## Success Criteria

1. **Smooth interaction**: Hovering over Mandelbrot shows Julia preview with no perceptible lag
2. **Visual quality**: Renders look publication-quality with smooth gradients, no banding
3. **Intuitive UX**: First-time user understands interaction within 10 seconds
4. **Performance**: Maintains 30fps during interaction on mid-range hardware
5. **Polish**: Transitions, loading states, and details feel considered

---

## Development Phases

### Phase 1: Core Rendering
- WebGL setup for both panels
- Basic Julia and Mandelbrot shaders
- Pan and zoom on both canvases

### Phase 2: Interaction
- Hover preview on Mandelbrot
- Click to lock c value
- Coordinate display

### Phase 3: Polish
- Color schemes and palette system
- Presets with thumbnails
- UI styling and transitions
- Progressive rendering

### Phase 4: Responsive & Extras
- Mobile/tablet layouts
- Touch gesture support
- Settings and quality options
