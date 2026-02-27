# Blackjack Advisor Feature Spec

## Overview
Add a toggleable "Advisor" panel to the existing blackjack webpage. When enabled, the advisor analyzes the current game state and recommends the statistically optimal play based on **Basic Strategy** — the mathematically proven optimal blackjack strategy for a standard 6-deck game, dealer stands on soft 17.

---

## UI / Layout

### Advisor Panel
- Position the advisor panel to the **right side** of the game area (or below on mobile).
- The panel contains:
  1. **Advisor portrait** — an `<img>` tag sized at **120×120px** with `src="advisor.png"` and `alt="Advisor"`. Leave this wired up and ready; the image file will be provided separately.
  2. **Advisor name/label** — a small heading, e.g. "Advisor" or a fun name you choose.
  3. **Recommendation box** — a styled callout (speech bubble or card) that displays the advisor's current recommendation as a short phrase (see Recommendation Text below).
  4. **Confidence note** — a single line of smaller text explaining *why* (e.g. "Dealer shows a 6 — never bust them").

### Toggle Button
- Add a **"Advisor: ON / OFF"** toggle button in the game controls area (near the Hit/Stand buttons or in a settings bar).
- When **OFF**: hide the advisor panel entirely; do not show recommendations.
- When **ON**: show the advisor panel; update recommendation in real time as the game state changes.
- Persist the toggle state in `localStorage` so it survives page refreshes.

---

## Recommendation Logic

Implement Basic Strategy as a lookup. The advisor should fire **after the deal** and **after each hit**, whenever it is the player's turn.

### Inputs
- `playerTotal` — numeric total of player's hand
- `playerHand` — array of card values (to detect pairs and soft hands)
- `dealerUpcard` — the dealer's visible card value (Ace = 11 or 1 as appropriate)
- `canDouble` — boolean, true only on the first two cards
- `canSplit` — boolean, true only when player holds a pair

### Decision Priority (check in this order)
1. **Split** (if `canSplit` is true and the pair should be split per Basic Strategy)
2. **Double Down** (if `canDouble` is true and the hand/dealer combo calls for it)
3. **Stand**
4. **Hit**

### Basic Strategy Tables to Implement

#### Pairs — Split or Not
| Pair | Dealer 2–6 | Dealer 7–8 | Dealer 9–10–A |
|------|-----------|-----------|--------------|
| A–A  | Split     | Split     | Split        |
| 10–10| Stand     | Stand     | Stand        |
| 9–9  | Split     | Stand     | Split (not 7,10,A) |
| 8–8  | Split     | Split     | Split        |
| 7–7  | Split     | Split     | Hit          |
| 6–6  | Split     | Hit       | Hit          |
| 5–5  | Double    | Double    | Hit          |
| 4–4  | Hit       | Hit       | Hit          |
| 3–3  | Split     | Split     | Hit          |
| 2–2  | Split     | Split     | Hit          |

#### Soft Hands (hand contains an Ace counted as 11)
| Player Soft Total | Dealer 2–6 | Dealer 7–8 | Dealer 9–10–A |
|-------------------|-----------|-----------|--------------|
| Soft 20 (A+9)     | Stand     | Stand     | Stand        |
| Soft 19 (A+8)     | Stand (Dbl vs 6) | Stand | Stand       |
| Soft 18 (A+7)     | Dbl/Stand | Stand     | Hit          |
| Soft 17 (A+6)     | Double    | Hit       | Hit          |
| Soft 16 (A+5)     | Double    | Hit       | Hit          |
| Soft 15 (A+4)     | Double    | Hit       | Hit          |
| Soft 14 (A+3)     | Double    | Hit       | Hit          |
| Soft 13 (A+2)     | Double    | Hit       | Hit          |

#### Hard Hands
| Player Total | Dealer 2–6 | Dealer 7–8 | Dealer 9–10–A |
|--------------|-----------|-----------|--------------|
| 17+          | Stand     | Stand     | Stand        |
| 16           | Stand     | Hit       | Hit          |
| 15           | Stand     | Hit       | Hit          |
| 14           | Stand     | Hit       | Hit          |
| 13           | Stand     | Hit       | Hit          |
| 12           | Stand (not 2–3) | Hit | Hit         |
| 11           | Double    | Double    | Double (not A)|
| 10           | Double    | Double    | Hit          |
| 9            | Double (3–6) | Hit   | Hit          |
| 8 or less    | Hit       | Hit       | Hit          |

---

## Recommendation Text

The advisor should speak in short, plain phrases. Examples:

| Action     | Display Text              |
|------------|---------------------------|
| Hit        | "Hit"                    |
| Stand      | "Stand"                  |
| Double Down| "Double Down"            |
| Split      | "Split"                  |

The confidence/reason line should be a brief human-readable explanation:
- `"You have a hard 16 vs dealer's 10 — take the hit."`
- `"Dealer shows a 6 — let them bust. Stand."`
- `"Always split Aces and Eights."`
- `"Strong doubling position — press your bet."`

Keep these to one sentence. Tone can be casual/encouraging.

---

## States to Handle

| Game State | Advisor Behavior |
|------------|-----------------|
| Before deal | Show a neutral idle message, e.g. *"Place your bet and deal!"* |
| Player's turn (active) | Show current recommendation, update on each hit |
| Player busted | Show *"Busted!"* — no recommendation |
| Dealer's turn | Show *"Waiting for dealer..."* |
| Round over (win/loss/push) | Show outcome reaction, e.g. *"Nice hand!"* / *"Better luck next time."* |
| Blackjack | Show *"Blackjack! 🎉"* |
| Advisor toggled OFF | Panel hidden entirely |

---

## Image Placeholder

The advisor portrait should be wired up as:
```html
<img id="advisor-portrait" src="advisor.png" alt="Advisor" width="120" height="120" />
```
- The file `advisor.png` will be dropped into the same directory as the webpage.
- If the image fails to load, hide it gracefully (CSS: `img { display: none }` on error via `onerror` handler) so the panel still functions as text-only.

---

## Technical Notes

- Implement the strategy logic as a **pure function** `getRecommendation(playerHand, dealerUpcard, canDouble, canSplit)` that returns `{ action, reason }`.
- The function should be easy to find and modify (clearly commented block or its own `advisor.js` file).
- The advisor reads from the existing game state — do not duplicate card tracking logic.
- No external libraries required; vanilla JS is fine.
- Ensure the toggle and panel are **mobile-friendly** (the panel should stack below the game on small screens).

---

## Acceptance Criteria

- [ ] Advisor panel renders with portrait placeholder wired to `advisor.png`
- [ ] Toggle button shows/hides the panel and persists state across refresh
- [ ] Correct Basic Strategy recommendation shown for hard hands
- [ ] Correct Basic Strategy recommendation shown for soft hands
- [ ] Correct split recommendations shown for all pairs
- [ ] Double Down recommended when appropriate (only on first two cards)
- [ ] Recommendation updates immediately after each hit
- [ ] Idle, bust, dealer-turn, and round-end states all show appropriate messages
- [ ] Image fails gracefully if `advisor.png` is missing
