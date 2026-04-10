# Product Review Generator — Webpage Specification

## Overview

A single-page web application that allows users to generate realistic, AI-powered product reviews using the OpenAI API. Users configure the product details, review tone, and generation parameters, then receive a polished review they can copy or export.

---

## Page Layout

### Header
- App title: **"Review Generator"** (or similar brand name)
- Subtitle: *"Generate realistic product reviews powered by AI"*
- Clean, minimal top bar — no navigation needed

---

## Input Form

The form is the core of the page. All fields are required unless noted as optional.

### 1. API Configuration (Collapsible Section or Top Card)
- **OpenAI API Key** — Password-type text input
  - Placeholder: `sk-...`
  - Note beneath: *"Your key is never stored or transmitted beyond this session."*
  - Link: *"Get your API key →"* pointing to `https://platform.openai.com/api-keys`
- **Model Selector** — Dropdown
  - Options (in order): `GPT-4o`, `GPT-4o mini`, `GPT-4-turbo`, `GPT-3.5-turbo`
  - Default: `GPT-4o`

---

### 2. Product Details (Card)

| Field | Type | Notes |
|---|---|---|
| **Product Name** | Text input | e.g. *"Sony WH-1000XM5 Headphones"* |
| **Product Category** | Dropdown or text input with suggestions | e.g. Electronics, Clothing, Beauty, Kitchen, Fitness, Software, Books, Food & Beverage, etc. Allow free-form entry |

---

### 3. Review Configuration (Card)

#### Response Length
- **Label:** "Review Length"
- **Control:** Segmented button group or radio pills
  - `Short` (~75–100 words)
  - `Medium` (~200–250 words)
  - `Long` (~400–500 words)
- Default: `Medium`

#### Writing Style
- **Label:** "Writing Style"
- **Control:** Dropdown
  - Options: `Casual`, `Professional`, `Enthusiastic`, `Skeptical`, `Technical`, `Story-driven`
- Default: `Casual`

#### Sentiment Slider
- **Label:** "Sentiment"
- **Control:** Horizontal range slider
  - Left end label: 😤 **Negative**
  - Right end label: 😍 **Positive**
  - Range: 1–10
  - Default: 7 (leaning positive)
  - Display current value as a descriptor beneath the slider:
    - 1–2: *"Very Negative"*
    - 3–4: *"Mostly Negative"*
    - 5: *"Mixed / Neutral"*
    - 6–7: *"Mostly Positive"*
    - 8–10: *"Very Positive"*

#### Keywords & Comments *(Optional)*
- **Label:** "Additional Notes or Keywords"
- **Control:** Textarea (3–4 rows)
- Placeholder: *"e.g. mention battery life, compare to previous model, include a complaint about the packaging..."*
- Helper text: *"The AI will weave these details into the review naturally."*

---

### 4. Generate Button

- Large, prominent CTA button: **"Generate Review"**
- Full-width or centered, visually distinct (primary color)
- Disabled state while a request is in flight
- Loading state: spinner + label *"Generating..."*

---

## Output Section

Appears below (or beside, on wide screens) the form after generation.

### Review Output Card
- **Header:** "Your Generated Review" with a star rating display (derived from sentiment slider value, rounded to nearest 0.5 ★)
- **Body:** The generated review text, displayed in a readable serif or neutral font
- **Word count** shown beneath the review text (e.g. *"213 words"*)

### Action Buttons (below the review)
| Button | Action |
|---|---|
| 📋 Copy to Clipboard | Copies plain text of review |
| 🔄 Regenerate | Re-sends the same prompt for a new variation |
| ✏️ Edit Prompt & Retry | Scrolls back to form with all values preserved |

---

## Behavior & UX Details

### Validation
- Show inline errors if:
  - API key field is empty on submit
  - Product name is empty
  - API call fails (surface the OpenAI error message in a friendly error card)

### API Request Construction
The prompt sent to OpenAI should be constructed from all form inputs. Example system prompt structure:

```
You are a realistic product reviewer. Write a [LENGTH] [STYLE] product review for "[PRODUCT NAME]" in the [CATEGORY] category. 
The review sentiment should be [SENTIMENT DESCRIPTOR] (score [X]/10). 
[If keywords provided]: Naturally incorporate the following details or keywords: [KEYWORDS].
Do not break character. Write only the review text — no labels, no preamble.
```

### Session Persistence
- Store the API key in `sessionStorage` so it persists across page refreshes but is cleared when the tab is closed
- All other form values persist in component state during the session

### Responsive Design
- Mobile-first layout: single column stacked
- Tablet/desktop: two-column layout (form left, output right) when viewport ≥ 768px

---

## Tech Stack Recommendation

| Concern | Recommendation |
|---|---|
| Framework | React (with hooks) or plain HTML/CSS/JS |
| Styling | Tailwind CSS or a minimal custom design system |
| API calls | `fetch` directly to `https://api.openai.com/v1/chat/completions` |
| State | `useState` / `useReducer` (no backend needed) |
| Deployment | Static hosting (Vercel, Netlify, GitHub Pages) |

> ⚠️ **Security Note:** Because this is a client-side app, the API key is exposed in the browser. This is acceptable for a personal/demo tool but should never be used in a public-facing production app without a backend proxy.

---

## Stretch Goals (Post-MVP)

- **Review History** — Store past generations in `localStorage` with timestamps
- **Multiple Reviews at Once** — Generate 2–3 variations side by side
- **Platform Templates** — Format output to match Amazon, Yelp, Google Reviews, or App Store style
- **Export Options** — Download as `.txt` or `.docx`
- **Persona Selector** — Choose reviewer archetype (e.g. *Power User*, *Casual Buyer*, *Gift Recipient*)
