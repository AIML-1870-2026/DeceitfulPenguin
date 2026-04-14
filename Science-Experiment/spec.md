# Science Experiment Generator — Product Specification

## Overview

A single-page web application that allows educators, parents, and students to generate
age-appropriate science experiments using the OpenAI API. Users provide their own API key
via file upload, configure their preferences, and receive a safe, customized experiment
based on the supplies they already have on hand.

---

## Goals

- Make science experiment ideation fast and accessible for any grade level
- Ensure all generated experiments are safe and non-toxic by design
- Keep the experience simple: no account required, no backend, runs entirely in the browser
- Give users full control over their OpenAI model choice and API key

---

## User Flow

1. User lands on the page and is greeted with a clean, friendly UI
2. User uploads a `.env` or `.csv` file containing their OpenAI API key
3. App parses the file, validates the key format, and confirms it was loaded successfully
4. User selects an OpenAI model from a dynamically populated dropdown
5. User selects a grade level from a predefined dropdown
6. User types in a list of available supplies (free-text, comma-separated or line-by-line)
7. User clicks **"Generate Experiment"**
8. App sends a crafted, safety-enforced prompt to the OpenAI API
9. A structured experiment is displayed: title, objective, materials, steps, and expected outcome

---

## Features

### 1. API Key File Upload

- **Accepted formats:** `.env` and `.csv`
- **Drag-and-drop zone** prominently displayed at the top of the page, with a fallback
  "Browse File" button
- **Parsing rules:**
  - `.env` files: look for a line matching `OPENAI_API_KEY=sk-...`
  - `.csv` files: scan all cells for a value beginning with `sk-`
- **Validation:** Check that the extracted value matches the pattern `sk-[A-Za-z0-9]{32,}`
- **UI feedback:**
  - ✅ Green confirmation badge: "API key loaded successfully"
  - ❌ Red error badge with a plain-language explanation if parsing fails
- **Security note displayed to the user:** "Your API key never leaves your browser. All
  requests are made directly from your device to OpenAI."
- Key is stored only in component state — never written to localStorage, cookies, or any
  external service

---

### 2. Model Selection

- Dropdown populated with the following OpenAI models (hardcoded list, kept current as of
  spec date):
  - `gpt-4o`
  - `gpt-4o-mini`
  - `gpt-4-turbo`
  - `gpt-3.5-turbo`
- Default selection: `gpt-4o-mini` (balance of quality and cost for this use case)
- Dropdown is disabled until a valid API key has been loaded

---

### 3. Grade Level Selection

Predefined dropdown with the following options:

| Value | Label |
|---|---|
| `K-2` | Kindergarten – 2nd Grade |
| `3-5` | 3rd – 5th Grade |
| `6-8` | 6th – 8th Grade |
| `9-10` | 9th – 10th Grade |
| `11-12` | 11th – 12th Grade |
| `college` | College / University |
| `adult` | Adult / Hobbyist |

- The selected grade level is injected into the system prompt to calibrate experiment
  complexity, vocabulary, and required supervision level
- Required field — form cannot be submitted without a selection

---

### 4. Supplies Input

- Large, resizable textarea labeled **"Available Supplies"**
- Placeholder text: `e.g. baking soda, vinegar, food coloring, balloons, mason jars...`
- Accepts comma-separated or newline-separated entries
- Input is trimmed, deduplicated, and formatted into a clean list before being sent to
  the API
- Minimum: 2 supplies required before form submission is allowed
- Character limit: 1,000 characters
- Helper text below the field: "List everything you have — the more you include, the more
  creative the experiment can be!"

---

### 5. Safety Safeguard System

This is a critical feature. Safety is enforced at two layers:

#### Layer 1 — System Prompt Constraints (Primary Safeguard)

The API request always includes a non-negotiable system prompt that instructs the model
to refuse or redirect unsafe requests:

```
You are a science educator assistant. Your sole purpose is to generate safe, educational,
age-appropriate science experiments.

STRICT RULES — you must follow these without exception:
1. Never suggest any experiment involving fire, open flames, or combustion unless the grade
   level is 11-12 or college AND the experiment is a standard supervised lab procedure.
2. Never suggest any experiment involving toxic, corrosive, or hazardous chemicals
   (e.g. bleach, ammonia, strong acids or bases, reactive metals).
3. Never suggest any experiment that could produce toxic gases, fumes, or byproducts.
4. Never suggest any experiment involving electricity above standard AA/AAA battery voltage.
5. Never suggest any experiment that involves animals being harmed.
6. If the user's supplies suggest a dangerous experiment (e.g. mixing bleach and ammonia),
   do NOT generate that experiment. Instead, respond with a safe alternative using a subset
   of the listed supplies.
7. If you cannot generate a safe experiment with the given supplies, clearly say so and
   suggest 2–3 common household items that could be added to enable a safe experiment.

Always err on the side of caution. When in doubt, do not include it.
```

#### Layer 2 — Output Validation (Secondary Safeguard)

After receiving the model's response, the app runs a client-side keyword scan on the
output before rendering it to the user. If any of the following terms are detected in the
experiment steps or materials, the output is blocked and a warning is shown:

**Blocked keywords (case-insensitive):**
`bleach`, `chlorine`, `ammonia`, `acid`, `lye`, `sodium hydroxide`, `hydrogen peroxide >3%`,
`gasoline`, `alcohol lamp`, `bunsen burner`, `thermite`, `explosive`, `flammable`,
`toxic`, `poison`, `mercury`, `lead`, `asbestos`, `cyanide`

- If blocked: display a yellow warning banner — "This experiment was flagged for safety
  review. Please try different supplies or a different grade level."
- Log the flagged response to the browser console (for debugging) but do not display raw
  content to the user

---

### 6. Experiment Output Display

When generation succeeds, display the experiment in a structured card:

```
┌─────────────────────────────────────────────────┐
│  🔬  [Experiment Title]                         │
│  Grade Level: 3rd–5th Grade                     │
├─────────────────────────────────────────────────┤
│  OBJECTIVE                                      │
│  [What the student will learn]                  │
│                                                 │
│  MATERIALS NEEDED                               │
│  • [item 1]                                     │
│  • [item 2]  (only items from user's list)      │
│                                                 │
│  STEPS                                          │
│  1. [Step one]                                  │
│  2. [Step two]                                  │
│  ...                                            │
│                                                 │
│  EXPECTED OUTCOME                               │
│  [What should happen and why]                   │
│                                                 │
│  SAFETY NOTES                                   │
│  [Any supervision or handling notes]            │
└─────────────────────────────────────────────────┘
```

- **Copy to Clipboard** button on the output card
- **Print / Save as PDF** button (uses browser `window.print()`)
- **"Generate Another"** button to regenerate with the same settings
- A subtle **"Estimated API cost"** indicator (calculated from token count × model pricing)

---

## UI & UX Requirements

- **Single HTML file** — no build step, no framework dependencies required (vanilla JS or
  lightweight framework acceptable)
- Fully **responsive** — works on desktop, tablet, and mobile
- Clean, friendly visual design appropriate for an educational tool — think bright accent
  colors, rounded corners, clear typography
- All interactive elements have proper **focus states** and **ARIA labels** for accessibility
- **Loading state** while the API request is in flight: animated spinner + "Generating your
  experiment..." message
- **Error handling** for common API failures:
  - `401 Unauthorized` → "Your API key appears to be invalid. Please check your file and try again."
  - `429 Too Many Requests` → "You've hit your OpenAI rate limit. Please wait a moment and try again."
  - `500 / network error` → "Something went wrong on OpenAI's end. Please try again shortly."
- Form fields remember their last values if the user clicks "Generate Another"

---

## Technical Requirements

| Concern | Decision |
|---|---|
| Runtime | Browser only — no server, no backend |
| API calls | Direct `fetch()` to `https://api.openai.com/v1/chat/completions` |
| File parsing | Native `FileReader` API |
| State management | Vanilla JS or lightweight reactive pattern |
| Styling | CSS custom properties for theming; no heavy UI framework required |
| Browser support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Dependencies | Zero required; optional: marked.js for Markdown rendering of output |

---

## Out of Scope (v1)

- User accounts or saved experiment history
- Sharing experiments via URL
- Support for non-OpenAI providers (Anthropic, Gemini, etc.)
- Image generation to accompany experiments
- Multi-language support
- Backend API proxy

---

## Success Metrics

- User can go from page load to a generated experiment in under 2 minutes
- Zero unsafe experiments rendered to the UI (dual-layer safeguard)
- Works entirely offline after initial page load (except for API calls)
- Page loads under 200KB uncompressed

---

## Open Questions

1. Should the app support manually pasting an API key as a fallback to file upload?
2. Should grade level influence the reading level of the output instructions themselves
   (i.e. simpler words for K–2), or only the experiment complexity?
3. Is there appetite for a v2 "save to PDF" feature with a printable worksheet format?
4. Should the supplies field offer autocomplete suggestions from a common household items list?
