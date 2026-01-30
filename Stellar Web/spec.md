# Stellar Web - Code Quest Specification

## Overview

Create an interactive webpage that visualizes a "Stellar Web" — a particle system where nodes drift through 3D space and dynamically connect to nearby nodes based on proximity. The visualization demonstrates **emergent networks**: complex structures arising from simple rules.

## Core Concept

Unlike traditional particle systems where each particle acts independently, Stellar Web introduces **relationships between particles**. The key rule:

> "Draw a line (edge) between any two nodes that are close enough."

This single rule — the **connectivity radius** — creates organic, evolving network structures.

---

## Functional Requirements

### 1. Particle System (Nodes)

- Render multiple particles (nodes) on a canvas
- Nodes should drift/float through simulated 3D space
- Each node moves independently with its own velocity
- Nodes should wrap around or bounce at boundaries
- Apply depth effects:
  - Size varies by z-position (closer = larger)
  - Opacity varies by z-position (closer = more opaque)

### 2. Edge Connections

- Calculate distance between all node pairs
- Draw edges (lines) between nodes within the **connectivity radius**
- Edge properties should respond to distance:
  - **Thickness**: Thicker for closer nodes, thinner as they approach the radius limit
  - **Transparency/Opacity**: More opaque for closer connections, fading as distance increases
- Edges should update in real-time as nodes move

### 3. User Controls (Sliders)

Implement sliders to control the following parameters:

| Control | Description |
|---------|-------------|
| **Node Count** | Number of particles in the system |
| **Connectivity Radius** | Distance threshold for edge connections |
| **Node Speed** | Velocity/movement speed of particles |
| **Node Size** | Base size of particle nodes |
| **Edge Thickness** | Base thickness of connecting lines |
| **Edge Opacity** | Base transparency of edges |

### 4. Animation

- Smooth, continuous animation loop
- Real-time updates as parameters change
- Performant rendering (target 60fps)

---

## Visual Requirements

- Dark background (space/stellar theme)
- Nodes rendered as circles or points with glow effects
- Edges rendered as lines connecting node centers
- Depth perception through size and opacity scaling
- Clean, aesthetic appearance

---

## Technical Requirements

- HTML5 Canvas for rendering
- Vanilla JavaScript (or framework of choice)
- Responsive design — canvas fills viewport or designated area
- Slider controls accessible and functional

---

### UI Improvements
- Move sliders outside the animation area
- Implement a collapsible side panel for controls
- Or position controls below the canvas

### Network Statistics Panel
Display real-time metrics:
- Total number of edges
- Average connections per node
- Network density (actual edges / possible edges)

### Additional Enhancements
- Color gradients based on edge length or node velocity
- Mouse interaction (nodes attracted to or repelled by cursor)
- Pulsing effects on nodes or edges
- Customizable color schemes
- Pause/play controls
- Reset/randomize button

---

## Behavior Examples

| Connectivity Radius | Expected Result |
|---------------------|-----------------|
| Small | Sparse, isolated clusters |
| Medium | Delicate webs with local structure |
| Large | Dense meshes approaching full connectivity |

---

## Acceptance Criteria

1. ✅ Canvas renders nodes drifting through 3D space
2. ✅ Edges connect nodes within the connectivity radius
3. ✅ Edge thickness and opacity respond to distance
4. ✅ Depth effects visible (size/opacity by z-position)
5. ✅ All sliders functional and update visualization in real-time
6. ✅ Animation runs smoothly
7. ✅ Visual aesthetic matches stellar/space theme

---

## Resources & Keywords

When prompting or describing the system, consider these terms:
- Node, Edge
- Thickness, Transparency, Opacity
- Connectivity radius
- 3D space, Depth
- Particle system
- Emergent network
