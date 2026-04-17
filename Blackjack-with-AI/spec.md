# Blackjack Game — Project Spec

## Overview
A single-player blackjack game built as a single HTML/CSS/JS file. Clean, minimal aesthetic with smooth animations and a chip-based betting system.

---

## Tech Stack
- **Single file**: Plain HTML, CSS, and JavaScript — no frameworks, no build tools
- All styles and scripts embedded inline in one `.html` file

---

## Visual Style
- Clean and minimal — lots of whitespace, simple typography
- Green felt table implied through subtle color (e.g. deep green background for the play area)
- Cards should look crisp and modern — white background, clear suit/value typography
- No loud colors or decorative clutter
- Responsive enough to be playable on a desktop browser

---

## Game Rules

### Deck
- 6 standard decks (312 cards) shuffled together
- Deck is reshuffled when ~75% of cards have been dealt (i.e. after ~234 cards)

### Gameplay
- Standard blackjack rules:
  - Dealer hits on soft 16, stands on soft 17
  - Blackjack pays 3:2
  - Player can Hit or Stand on any hand
  - No split, no double down, no insurance (not in scope)
- Dealer's first card is face-down (hole card), revealed when player stands or busts
- Ace counts as 11 or 1 (whichever keeps the hand ≤ 21)

---

## Betting System

### Starting Balance
- Player starts each session with **$1,000**
- No persistence — balance resets on page refresh

### Chip Denominations
- **$10** (e.g. blue chip)
- **$50** (e.g. green chip)
- **$100** (e.g. black chip)

### Betting Flow
1. Before each hand, player clicks chips to add to their bet
2. A "Clear Bet" button removes the current bet
3. A "Deal" button starts the hand (disabled if bet is $0 or exceeds balance)
4. Minimum bet: $10. Maximum bet: player's full balance.
5. Winnings/losses are applied to the balance after each hand resolves

### Win/Loss Resolution
- Win: player receives 1× their bet (net +bet)
- Blackjack: player receives 1.5× their bet (net +1.5× bet)
- Push (tie): bet returned, no change to balance
- Loss/bust: bet is lost
- If balance reaches $0, show a "You're broke!" message with a "New Game" button to reset to $1,000

---

## Animations

All animations should feel smooth and polished but not slow. Suggested durations are guidelines.

- **Card deal**: Cards slide/fly from a deck position to the player/dealer area (~300ms per card, staggered)
- **Card flip**: Dealer's hole card flips face-up with a CSS 3D flip animation (~400ms)
- **Chip placement**: Chips drop into the bet area with a subtle bounce
- **Bust / win / push banner**: A result label fades in over the hand area after resolution
- Use CSS transitions and `@keyframes` — no external animation libraries

---

## UI Layout

### Sections (top to bottom)
1. **Header** — Game title ("Blackjack") and current session win/loss record (e.g. "W: 4 | L: 3 | P: 1")
2. **Dealer area** — Dealer's cards + hand value (hide value while hole card is face-down)
3. **Player area** — Player's cards + hand value
4. **Bet area** — Displays current bet amount and chip stack visual
5. **Controls row** — Chip buttons ($10 / $50 / $100), "Clear Bet", "Deal" / "Hit" / "Stand" (context-sensitive)
6. **Balance display** — "Balance: $1,000" shown prominently near controls

### State-based button visibility
| Game State     | Visible Buttons                        |
|----------------|----------------------------------------|
| Betting phase  | Chip buttons, Clear Bet, Deal          |
| Player's turn  | Hit, Stand                             |
| Hand resolving | None (disabled during animations)      |
| Hand over      | Next Hand (resets to betting phase)    |

---

## Session Tracking
- Displayed in the header throughout the session
- Tracks: **Wins**, **Losses**, **Pushes**
- Resets on page refresh (no localStorage)

---

## Out of Scope
- Split hands
- Double down
- Insurance
- Multiplayer
- Sound effects
- Mobile/touch optimization
- Persistent storage
