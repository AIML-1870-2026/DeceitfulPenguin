# Decision Neuron Simulator: "Should I Go Flying Today?"

## Overview

An interactive educational web application that demonstrates how a single artificial neuron makes decisions, using the relatable real-world scenario of a pilot deciding whether to go flying. The visualization shows how multiple weighted inputs combine with a bias to produce a decision through a sigmoid activation function.

## Educational Purpose

This demo teaches:
1. **Inputs and Weights**: How different factors contribute to a decision with varying importance
2. **Weighted Sum**: How inputs are multiplied by weights and summed
3. **Bias**: How a baseline inclination shifts the decision threshold
4. **Activation Function**: How the sigmoid function transforms the sum into a probability (0-1)
5. **Decision Boundary**: How the 0.5 threshold converts probability to yes/no

## User Interface Layout

### Section 1: Animated Neuron Diagram (Hero/Center)

A large, animated visualization of a single neuron showing:

```
[Wind Speed]──────(w₁)──┐
                        │
[Stress Level]────(w₂)──┤
                        ├──→ [Σ + b] ──→ [σ] ──→ [Output]
[Rental Price]────(w₃)──┤
                        │
[Airport Traffic]─(w₄)──┘
                        ↑
                      [Bias]
```

**Animation Features:**
- Input values flow along connection lines as colored pulses/particles
- Line thickness represents weight magnitude
- Color coding: green for positive contribution to "go flying", red for negative
- The summation node pulses when calculating
- Sigmoid curve animates showing where the sum falls
- Output node glows green (GO) or red (NO-GO) with intensity based on confidence

### Section 2: Input Sliders (Left Panel)

Four sliders for contributing factors, each showing:
- Current value with units
- Visual indicator of how this input affects the decision (positive/negative contribution)

#### Wind Speed
- **Range**: 0 kts to 40 kts
- **Default**: 8 kts
- **Labels**: "Calm" (0), "Breezy" (15), "Strong" (25), "Dangerous" (40)
- **Note**: Higher wind = LESS inclined to fly (negative weight effect)

#### Personal Stress Level
- **Range**: 1 to 10
- **Default**: 3
- **Labels**: "Relaxed" (1), "Moderate" (5), "Stressed" (8), "Overwhelmed" (10)
- **Note**: Higher stress = LESS inclined to fly (negative weight effect)

#### Aircraft Rental Price
- **Range**: $100/hr to $300/hr
- **Default**: $175/hr
- **Labels**: "$100" (cheap), "$175" (typical), "$250" (expensive), "$300" (premium)
- **Note**: Higher price = LESS inclined to fly (negative weight effect)

#### Airport Traffic
- **Range**: 0 to 20 other aircraft
- **Default**: 5
- **Labels**: "Empty" (0), "Light" (5), "Moderate" (10), "Busy" (15), "Congested" (20)
- **Note**: More traffic = LESS inclined to fly (negative weight effect)

### Section 3: Bias Slider (Below inputs or separate)

#### Flying Inclination (Bias)
- **Range**: -3 to +3
- **Default**: 0
- **Labels**: "Reluctant Pilot" (-3), "Neutral" (0), "Eager Pilot" (+3)
- **Explanation**: "Your natural baseline inclination to go flying, before considering any factors"

### Section 4: Math Breakdown (Right Panel or Below)

A step-by-step calculation display that updates in real-time:

```
STEP 1: Normalize Inputs
━━━━━━━━━━━━━━━━━━━━━━━
Wind Speed:     8 kts   →  x₁ = 0.20   (0-40 scaled to 0-1)
Stress Level:   3       →  x₂ = 0.22   (1-10 scaled to 0-1)  
Rental Price:   $175    →  x₃ = 0.375  ($100-$300 scaled to 0-1)
Airport Traffic: 5      →  x₄ = 0.25   (0-20 scaled to 0-1)

STEP 2: Apply Weights
━━━━━━━━━━━━━━━━━━━━━━━
w₁ × x₁ = -5.0 × 0.20  = -1.00  (wind penalty)
w₂ × x₂ = -3.0 × 0.22  = -0.67  (stress penalty)
w₃ × x₃ = -1.5 × 0.375 = -0.56  (price penalty)
w₄ × x₄ = -2.0 × 0.25  = -0.50  (traffic penalty)

STEP 3: Sum + Bias
━━━━━━━━━━━━━━━━━━━━━━━
Weighted Sum: -1.00 + -0.67 + -0.56 + -0.50 = -2.73
Bias (b):     +2.50
─────────────────────
z = Σ(wᵢxᵢ) + b = -0.23

STEP 4: Activation (Sigmoid)
━━━━━━━━━━━━━━━━━━━━━━━
σ(z) = 1 / (1 + e^(-z))
σ(-0.23) = 1 / (1 + e^(0.23))
         = 1 / (1 + 1.26)
         = 0.44 = 44%

DECISION: 44% < 50% → NO-GO ✗
```

### Section 5: Output Display (Prominent)

A large, clear decision display:
- **Confidence Gauge**: A semicircular gauge from 0% to 100% with the needle showing current probability
- **Decision Text**: "GO FLYING! ✓" (green) or "STAY GROUNDED ✗" (red)
- **Probability**: "73% confident you should fly" or similar

## Fixed Weights (Research-Based)

Based on aviation safety research, the weights reflect relative importance to flight safety:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Wind Speed | **w₁ = -5.0** | Highest weight. Wind is the #1 cause of GA accidents during landing. Most pilots comfortable up to ~17 kts, dangerous above 25 kts. Near-exponential risk increase. |
| Stress Level | **w₂ = -3.0** | High weight. Fatigue/stress causes 4-7% of aviation incidents, impairs decision-making, reduces situational awareness. Direct safety impact. |
| Airport Traffic | **w₃ = -2.0** | Moderate weight. 45% of midair collisions occur in traffic patterns. Risk scales with density but manageable with vigilance. |
| Rental Price | **w₄ = -1.5** | Lowest weight. Economic factor only—doesn't directly affect safety. Included to show not all inputs are equal. |

**Base Bias Offset**: The model includes an implicit +2.5 added to the user-adjustable bias so that with neutral settings (mid-range inputs, bias=0), the output is approximately 50%. This represents "reasonable conditions for a typical flight."

### Weight Justification Display

Include a collapsible "Why these weights?" section explaining the research:
- Wind: AOPA data shows wind is primary cause in majority of GA landing accidents
- Stress: NTSB identified fatigue in 4-7% of civil aviation incidents; impairs judgment
- Traffic: FAA notes high percentage of near-midair collisions within 30 miles of airports
- Price: Economic consideration only; no direct safety correlation

## Technical Implementation

### Normalization

All inputs are normalized to 0-1 range:
- `x_wind = wind_speed / 40`
- `x_stress = (stress - 1) / 9`
- `x_price = (price - 100) / 200`
- `x_traffic = traffic / 20`

### Neuron Calculation

```javascript
// Normalized inputs
const x1 = windSpeed / 40;
const x2 = (stressLevel - 1) / 9;
const x3 = (rentalPrice - 100) / 200;
const x4 = airportTraffic / 20;

// Fixed weights (negative because higher values = less inclined to fly)
const w1 = -5.0;  // wind
const w2 = -3.0;  // stress
const w3 = -1.5;  // price
const w4 = -2.0;  // traffic

// Base offset + user bias
const baseOffset = 2.5;
const b = baseOffset + userBias;  // userBias ranges -3 to +3

// Weighted sum
const z = (w1 * x1) + (w2 * x2) + (w3 * x3) + (w4 * x4) + b;

// Sigmoid activation
const probability = 1 / (1 + Math.exp(-z));

// Decision
const decision = probability >= 0.5 ? "GO" : "NO-GO";
```

### Example Scenarios

**Perfect Conditions (Should output ~90%+ GO):**
- Wind: 0 kts, Stress: 1, Price: $100, Traffic: 0, Bias: 0
- z = 0 + 0 + 0 + 0 + 2.5 = 2.5
- σ(2.5) ≈ 0.92 = 92% GO ✓

**Marginal Conditions (Should output ~50%):**
- Wind: 15 kts, Stress: 5, Price: $175, Traffic: 8, Bias: 0
- x = [0.375, 0.44, 0.375, 0.4]
- z = (-5×0.375) + (-3×0.44) + (-1.5×0.375) + (-2×0.4) + 2.5
- z = -1.875 - 1.33 - 0.56 - 0.8 + 2.5 = -2.07
- σ(-2.07) ≈ 0.11 = 11% → needs bias adjustment to hit 50%

**Note**: Fine-tune the baseOffset during implementation so that "typical good flying day" conditions produce ~70-75% confidence.

**Terrible Conditions (Should output ~5% GO):**
- Wind: 35 kts, Stress: 9, Price: $280, Traffic: 18, Bias: 0
- All factors near maximum negative contribution

## Animation Specifications

### Data Flow Animation
- When any slider changes, animate a "pulse" traveling from that input node through the weight connection to the summation node
- Pulse color: intensity based on the weighted contribution magnitude
- Travel time: ~300ms per pulse
- Multiple inputs can have pulses traveling simultaneously

### Sigmoid Visualization
- Show a small sigmoid curve graph next to or within the neuron
- Animate a dot traveling along the curve to the current z value
- Vertical line drops from the curve to show the output probability

### Decision Indicator
- Smooth color transition between red (0%) and green (100%)
- Subtle pulsing glow on the output node
- "Confidence bar" fills proportionally

## Responsive Design

- **Desktop**: Three-column layout (inputs | neuron | math)
- **Tablet**: Stacked layout (neuron on top, inputs and math below in tabs)
- **Mobile**: Single column, collapsible sections

## Accessibility

- All sliders keyboard accessible
- Color-blind friendly palette (use patterns/icons in addition to color)
- Screen reader descriptions for the animated visualization
- High contrast mode option

## Optional Enhancements (Future)

1. **Preset Scenarios**: Buttons to load example conditions ("Perfect Day", "Challenging Conditions", "No-Go Day")
2. **Learning Mode**: Let users adjust weights to see how they affect decisions
3. **Comparison View**: Show two neurons side-by-side (cautious pilot vs. bold pilot)
4. **History Trail**: Show last N decisions as a strip below the main visualization

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Styling (or Tailwind classes)
├── neuron.js           # Core neuron logic
├── animation.js        # D3/Canvas animation code
└── README.md           # Setup instructions
```

## Dependencies

- **React** or vanilla JS (implementer's choice)
- **D3.js** or **Canvas API** for the neuron animation
- **CSS animations** for simpler effects
- No backend required (entirely client-side)

---

## Summary

This spec defines an interactive single-neuron visualization that teaches neural network fundamentals through a relatable aviation decision-making scenario. The fixed weights are grounded in aviation safety research, and the interface clearly shows how inputs combine mathematically to produce a probabilistic decision.
