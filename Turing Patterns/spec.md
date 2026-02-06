# Turing Patterns Explorer - Specification Document

## Project Overview

A web-based interactive simulation of Turing patterns (reaction-diffusion systems) that balances educational value with creative exploration. The application allows users to experiment with pattern formation in real-time while understanding the underlying principles of reaction-diffusion systems.

## Core Purpose

- **Primary Goal**: Mix of education and creative exploration
- **User Level**: Moderate control - key parameters exposed without overwhelming complexity
- **Focus**: Real-time experimentation and pattern discovery

## Technical Foundation

### Simulation Model

**Gray-Scott Reaction-Diffusion System**
- Two chemical species: U (inhibitor) and V (activator)
- Equations:
  ```
  dU/dt = Du * ∇²U - U*V² + F*(1-U)
  dV/dt = Dv * ∇²V + U*V² - (F+k)*V
  ```
- Where:
  - Du, Dv: diffusion rates for U and V
  - F: feed rate
  - k: kill rate
  - ∇²: Laplacian operator (spatial diffusion)

### Grid System

- **Default Grid Size**: 256x256 (adjustable: 128x128, 256x256, 512x512)
- **Boundary Conditions**: Periodic (wrapping) or fixed edges
- **Data Structure**: Two 2D arrays for U and V concentrations (values 0.0-1.0)
- **Integration Method**: Euler method with adjustable timestep

### Performance Requirements

- Target: 60 FPS on modern hardware for 256x256 grid
- Use requestAnimationFrame for smooth animation
- Consider Web Workers or WebGL for computation if needed
- Implement pause/play controls and adjustable simulation speed

## User Interface Layout

### Main Canvas Area (70% of viewport)

- **Central Display**: Large canvas showing the current pattern
- **Visualization**: Color-mapped representation of chemical concentrations
- **Interaction**: Click/drag to seed new patterns or disturb existing ones
- **Controls Overlay**: Subtle play/pause, reset, and speed controls in corner

### Control Panel (30% of viewport, collapsible sidebar)

Organized into logical sections:

#### 1. Quick Start Section
- **Preset Patterns**: Dropdown or button grid with 6-10 named presets
  - Examples: "Spots", "Stripes", "Waves", "Coral", "Maze", "Spirals"
  - Each preset loads specific F, k, Du, Dv values
- **Description**: Brief explanation of selected preset

#### 2. Key Parameters Section
- **Feed Rate (F)**: Slider (0.000 - 0.100, step 0.001)
  - Default: 0.055
  - Tooltip: "Rate at which U is added to the system"
- **Kill Rate (k)**: Slider (0.000 - 0.100, step 0.001)
  - Default: 0.062
  - Tooltip: "Rate at which V is removed from the system"
- **Diffusion Rate U (Du)**: Slider (0.01 - 0.30, step 0.01)
  - Default: 0.16
  - Tooltip: "How fast inhibitor diffuses"
- **Diffusion Rate V (Dv)**: Slider (0.01 - 0.30, step 0.01)
  - Default: 0.08
  - Tooltip: "How fast activator diffuses"
- **Real-time Update**: Parameters apply immediately without restart

#### 3. Simulation Controls
- **Speed**: Slider (0.1x - 5x, default 1x)
- **Timestep (dt)**: Slider (0.5 - 2.0, default 1.0)
- **Play/Pause**: Toggle button
- **Reset**: Button to reinitialize with current parameters
- **Step Forward**: Single iteration advance (when paused)

#### 4. Visualization Settings
- **Color Scheme**: Dropdown
  - Grayscale (default)
  - Heat map (blue → red)
  - Viridis
  - Custom (green → purple)
- **Brightness**: Slider (0.5 - 2.0, default 1.0)
- **Contrast**: Slider (0.5 - 2.0, default 1.0)
- **Show Which Chemical**: Toggle (U, V, or Combination)

#### 5. Grid Settings
- **Grid Size**: Dropdown (128², 256², 512²)
- **Boundary Mode**: Toggle (Periodic/Fixed)

#### 6. Pattern Management
- **Save Current Pattern**: Button
  - Saves parameters + current state
  - Generates downloadable JSON file
- **Load Pattern**: File input button
  - Accepts JSON files
- **Random Seed**: Button to add random noise
- **Clear Grid**: Reset to baseline state

## Educational Features

### Information Panel (Expandable)
- **"How It Works"**: Brief explanation of reaction-diffusion
- **"About This Pattern"**: Dynamic text explaining current parameter regime
- **Parameter Space Map**: Small 2D visualization showing (F, k) position with labeled regions
- **Tips**: Contextual hints for exploration

### Guided Exploration Mode (Optional)
- Preset "tours" through interesting parameter combinations
- Step-by-step tutorials for beginners

## Interaction Features

### Mouse/Touch Interactions
1. **Click to Seed**: Single click adds high V concentration at point
2. **Click and Drag**: Paint trail of high V concentration
3. **Right-Click (optional)**: Add inhibitor (high U)
4. **Brush Size**: Adjustable radius for painting (5-50 pixels)

### Keyboard Shortcuts
- `Space`: Play/Pause
- `R`: Reset
- `S`: Save current pattern
- `+/-`: Adjust simulation speed
- `N`: Add random noise

## Data Format for Save/Load

```json
{
  "version": "1.0",
  "timestamp": "2024-02-05T10:30:00Z",
  "parameters": {
    "F": 0.055,
    "k": 0.062,
    "Du": 0.16,
    "Dv": 0.08,
    "gridSize": 256,
    "boundaryMode": "periodic"
  },
  "state": {
    "U": "base64_encoded_array",
    "V": "base64_encoded_array"
  },
  "metadata": {
    "name": "My Cool Pattern",
    "description": "Optional user description",
    "preset": "coral"
  }
}
```

## Preset Patterns Library

### Recommended Presets (F, k values)

1. **Spots** (α)
   - F: 0.055, k: 0.062
   - Description: "Stable spots that repel each other"

2. **Stripes** (β)
   - F: 0.035, k: 0.065
   - Description: "Parallel stripe patterns"

3. **Waves** (γ)
   - F: 0.014, k: 0.054
   - Description: "Traveling wave patterns"

4. **Coral** (δ)
   - F: 0.062, k: 0.061
   - Description: "Coral-like branching structures"

5. **Maze** (ε)
   - F: 0.029, k: 0.057
   - Description: "Labyrinth-like patterns"

6. **Spirals** (ζ)
   - F: 0.018, k: 0.051
   - Description: "Rotating spiral waves"

7. **Pulsating Spots** (η)
   - F: 0.046, k: 0.065
   - Description: "Spots that grow and shrink"

8. **Worms** (θ)
   - F: 0.078, k: 0.061
   - Description: "Writhing worm-like structures"

## Color Schemes Specification

### 1. Grayscale
- Black (0.0) → White (1.0)
- Simple and clean for scientific observation

### 2. Heat Map
- Blue (low) → Cyan → Yellow → Red (high)
- RGB interpolation through defined color stops

### 3. Viridis
- Perceptually uniform, colorblind-friendly
- Purple → Blue → Green → Yellow

### 4. Custom (Green-Purple)
- Dark purple (0.0) → Pink → White → Cyan → Green (1.0)
- Aesthetically pleasing for creative exploration

## Technical Implementation Notes

### Recommended Tech Stack
- **Framework**: React (for UI state management) or vanilla HTML/Canvas
- **Rendering**: HTML5 Canvas 2D or WebGL for performance
- **Computation**: JavaScript (consider WebGL shaders for 512² grid)
- **Styling**: CSS with responsive design
- **File Handling**: File API for save/load

### Algorithm Optimization
```javascript
// Pseudo-code for main loop
function simulate() {
  for each cell (x, y):
    // Compute Laplacian using 3x3 kernel
    laplaceU = neighbors weighted by [0.05, 0.2, 0.05]
                                      [0.2,  -1,  0.2]
                                      [0.05, 0.2, 0.05]
    laplaceV = same for V
    
    // Apply Gray-Scott equations
    reaction = U[x][y] * V[x][y]^2
    
    U_next[x][y] = U[x][y] + 
                   (Du * laplaceU - reaction + F * (1 - U[x][y])) * dt
    
    V_next[x][y] = V[x][y] + 
                   (Dv * laplaceV + reaction - (F + k) * V[x][y]) * dt
    
    // Clamp to [0, 1]
    U_next[x][y] = clamp(U_next[x][y], 0, 1)
    V_next[x][y] = clamp(V_next[x][y], 0, 1)
}
```

### Performance Considerations
- Use typed arrays (Float32Array) for numerical stability and performance
- Implement double buffering (swap U/V arrays each frame)
- Allow multiple iterations per frame for faster pattern development
- Debounce parameter changes to avoid overwhelming the system

## Responsive Design

### Desktop (≥1024px)
- Side-by-side layout: canvas (70%) and controls (30%)
- Full parameter panel visible

### Tablet (768px - 1023px)
- Canvas takes 65% width
- Collapsible control panel (35%)
- Slightly reduced control sizes

### Mobile (<768px)
- Full-width canvas
- Bottom sheet or modal for controls
- Simplified preset selection
- Touch-optimized controls

## Accessibility

- Keyboard navigation for all controls
- ARIA labels for sliders and buttons
- Alt text for canvas describing current pattern type
- High contrast mode option
- Screen reader announcements for parameter changes

## Future Enhancement Ideas (Out of Scope for V1)

- Multiple reaction-diffusion models (FitzHugh-Nagumo, etc.)
- 3D visualization
- Animation recording/export as GIF/MP4
- Community pattern sharing
- Custom equation editor
- GPU acceleration with WebGL compute
- Guided parameter space exploration with ML suggestions

## Success Criteria

1. **Performance**: Smooth 60 FPS at 256x256 on modern devices
2. **Usability**: New users can create interesting patterns within 2 minutes
3. **Educational**: Users understand basic concepts of reaction-diffusion
4. **Creative**: Users can save and share unique pattern discoveries
5. **Reliability**: Save/load functionality preserves exact states

## Development Phases

### Phase 1: Core Simulation
- Implement Gray-Scott equations
- Canvas rendering with grayscale
- Basic play/pause/reset controls
- Single preset working

### Phase 2: Parameter Controls
- All parameter sliders functional
- Real-time parameter updates
- 6-8 presets implemented
- Mouse interaction for seeding

### Phase 3: Polish & Features
- Multiple color schemes
- Save/load functionality
- Educational info panel
- Responsive design
- Performance optimization

### Phase 4: Testing & Refinement
- Cross-browser testing
- Performance profiling
- User feedback integration
- Documentation

## Resources for Implementation

### Mathematical References
- Pearson, J.E. (1993). "Complex Patterns in a Simple System"
- Gray-Scott parameter space maps

### Code References
- Karl Sims' Reaction-Diffusion Tutorial
- WebGL implementations for performance comparison

### Design Inspiration
- Scientific visualization tools
- Creative coding platforms (Processing, p5.js examples)

---

## Questions for Claude Code Implementation

When handing this spec to Claude Code, consider clarifying:

1. **Framework preference**: React vs. vanilla JavaScript?
2. **Rendering approach**: Canvas 2D vs. WebGL?
3. **File structure**: Single-page or modular components?
4. **Styling approach**: CSS framework or custom CSS?
5. **Browser support**: Modern evergreen browsers only?

## Notes

- This spec prioritizes clarity and moderate complexity
- Assumes single-page web application
- Designed for modern browsers (ES6+)
- Balances performance with accessibility
- Leaves room for future expansion

---

**Version**: 1.0  
**Last Updated**: February 5, 2025  
**Author**: Created for Turing Patterns Explorer Project
