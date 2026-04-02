# Drug Interaction Checker — Product Specification

**Version:** 1.0  
**Data Source:** [DDInter](https://ddinter.scbdd.com/) (v1) / [DDInter 2.0](https://ddinter2.scbdd.com/)  
**License Note:** DDInter data is published under CC-BY-NC-SA. Display proper attribution in the UI footer.

---

## 1. Overview

A single-page web application that lets users search for two drugs and instantly see whether combining them carries any known interaction risks. Results are pulled from the DDInter database and presented in plain, accessible language alongside educational tooltips that explain medical terminology.

The target audience is general consumers — patients managing multiple prescriptions, caregivers, or curious individuals. The tone should be clear, calm, and informative without replacing professional medical advice.

---

## 2. Goals

- Make drug interaction data approachable to non-medical users.
- Surface severity, mechanism, and management guidance from DDInter in a readable format.
- Educate users about what drug interactions are, why they happen, and what the risk levels mean — through contextual help buttons, not a separate FAQ page.
- Always remind users that results are informational only and a pharmacist or physician should be consulted.

---

## 3. Data Source & API Integration

### 3.1 DDInter Endpoints

DDInter exposes a web interface and an interaction checker at:

```
https://ddinter.scbdd.com/inter-checker/
```

The site provides an autocomplete search for drug names. Reverse-engineered from the public interface, the relevant request patterns are:

| Purpose | Method | URL Pattern |
|---|---|---|
| Drug name autocomplete | GET | `https://ddinter.scbdd.com/api/v1/drug/search/?query={term}` |
| Drug info by ID | GET | `https://ddinter.scbdd.com/api/v1/drug/{ddinter_id}/` |
| Interaction between two drugs | GET | `https://ddinter.scbdd.com/api/v1/interaction/?drug1={id}&drug2={id}` |
| Interaction checker (multi-drug) | POST | `https://ddinter.scbdd.com/inter-checker/` (form-based) |

> **⚠️ Important:** DDInter does not publish a formal public REST API. The endpoints above reflect the internal API inferred from browser network traffic on their public site. Before going live, verify these endpoints work as expected, respect their `robots.txt`, and confirm usage complies with their CC-BY-NC-SA license and terms of service. Consider reaching out to the DDInter team (CBDD Group, Central South University) for API access permission if building a production app.
>
> **Fallback option:** If direct API calls are blocked by CORS or policy, the app can use a lightweight server-side proxy (e.g., a Node/Python microservice) that forwards requests to DDInter and returns results to the browser.

### 3.2 Data Fields Used

From each interaction response, the app will display:

| Field | Description |
|---|---|
| `severity` | Risk level: Minor / Moderate / Major / Contraindicated |
| `mechanism` | Plain-text description of why the interaction occurs |
| `management` | Recommended clinical action (avoid, monitor, adjust dose, etc.) |
| `alternatives` | Other drugs with no known interaction (when available) |
| `drug1_name` / `drug2_name` | Canonical drug names |
| `source` | Citation/reference (displayed as a link if available) |

---

## 4. Page Structure & Layout

### 4.1 Header

- App name: **"MedCheck"** (or chosen brand name)
- Tagline: *"Look up drug interactions in plain language."*
- A persistent disclaimer banner (dismissible): *"This tool is for informational purposes only. Always consult a pharmacist or physician before making medication decisions."*
- Help button `[?]` in the top-right corner that opens an "About" modal explaining what the tool does and where the data comes from.

### 4.2 Drug Search Panel

Two side-by-side search fields labeled **Drug A** and **Drug B**.

Each field:
- Accepts free-text input (drug generic name or common synonym).
- Triggers autocomplete suggestions after 2+ characters, pulling from DDInter's drug search endpoint.
- Shows up to 8 suggestions in a dropdown. Each suggestion shows the generic name and, if available, a common brand name in parentheses.
- Displays a small ❌ button to clear the field.
- Shows a help button `[?]` adjacent to the label (see Section 6).

A prominent **"Check Interaction"** button sits below both fields, disabled until both drugs are selected from the autocomplete (to ensure valid DDInter IDs are used).

A **"Swap Drugs"** icon button (⇄) sits between the two fields for convenience.

### 4.3 Results Panel

Appears below the search panel after a successful lookup. Sections:

#### 4.3.1 Severity Badge

A large, color-coded badge displaying the interaction severity:

| Severity | Color | Icon |
|---|---|---|
| No Interaction Found | Green (#2ecc71) | ✓ |
| Minor | Yellow (#f1c40f) | ⚠ |
| Moderate | Orange (#e67e22) | ⚠ |
| Major | Red (#e74c3c) | ✗ |
| Contraindicated | Dark Red (#922b21) | ✗✗ |

Next to the badge: a `[?]` help button explaining what severity levels mean (see Section 6).

#### 4.3.2 Interaction Summary Card

A card with:
- **Drug A** name and **Drug B** name prominently displayed.
- **Interaction Mechanism** section with the plain-text description from DDInter. A `[?]` help button explains what "mechanism" means.
- **Management Guidance** section. A `[?]` help button explains what management means and gives examples.
- **Alternative Medications** section (shown only if alternatives data is present). Lists drugs that can substitute for Drug A or Drug B without the interaction. A `[?]` help button explains this section.
- **Source / Citation** shown as a small linked footnote at the bottom of the card.

#### 4.3.3 "What Should I Do?" Section

A friendly, plain-language call to action based on severity:

- **No interaction:** "Good news — no known interaction was found between these two drugs. This doesn't guarantee safety; always confirm with your pharmacist."
- **Minor:** "A minor interaction may exist. Watch for unusual symptoms and mention this combination to your doctor."
- **Moderate:** "A moderate interaction has been identified. Talk to your pharmacist or physician before taking these together."
- **Major:** "A major interaction has been identified. Do not combine these drugs without direct guidance from a healthcare provider."
- **Contraindicated:** "These drugs should NOT be taken together. Contact your prescribing physician or pharmacist immediately."

#### 4.3.4 Not Found / Error State

If a drug is not in the DDInter database:
- Show a neutral info banner: *"'[Drug Name]' wasn't found in the DDInter database. DDInter covers ~2,300 approved drugs; some medications may not be included yet."*
- Offer a link to DDInter's full drug list.

If the API is unavailable:
- Show a friendly error: *"We couldn't reach the DDInter database right now. Please try again in a moment."*

---

## 5. Educational Help Buttons

All `[?]` buttons use a consistent design: a small circular button with a question mark icon. On click or tap, they open a small inline tooltip card (not a modal) directly beneath the button. The card closes when the user clicks elsewhere or presses Escape.

Each tooltip should be written in approachable, jargon-free language with a short header and 2–4 sentences of explanation.

### 5.1 Help Button Inventory

| Button Location | Header | Content Summary |
|---|---|---|
| Next to "Drug A" / "Drug B" label | **What is a generic name?** | Drugs have a scientific (generic) name and one or more brand names. For example, "ibuprofen" is the generic name; "Advil" and "Motrin" are brand names. This tool works best with generic names. |
| Severity badge | **What do severity levels mean?** | Explains the four levels: Minor (usually manageable), Moderate (caution advised, doctor check recommended), Major (serious risk, avoid without medical supervision), Contraindicated (combination should never be used). |
| Mechanism section | **What is an interaction mechanism?** | A drug-drug interaction happens when one drug affects how another drug works in the body. The "mechanism" explains the biological reason — for example, one drug slowing down the liver enzyme that breaks down the other drug. |
| Management section | **What does "management" mean?** | Management is the recommended action to take when this interaction is identified. Examples: avoid the combination altogether, monitor for specific symptoms, take the drugs at different times, or adjust the dosage. |
| Alternatives section | **What are alternative medications?** | If two drugs interact badly, sometimes a different drug from the same family can achieve the same effect without the interaction risk. This section lists those alternatives when available. Talk to your doctor before switching. |
| About button (header) | **About MedCheck** | This tool uses data from DDInter, a curated drug-drug interaction database maintained by researchers at Central South University, China. It covers ~300,000+ interaction records for ~2,300 approved drugs. Data is for informational purposes only. |
| Autocomplete results | **Why use the suggested name?** | Selecting from the list ensures we look up the right drug in the database. Different drugs can have very similar names — selecting the suggested option avoids mix-ups. |

---

## 6. Disclaimer & Attribution

### 6.1 Persistent Footer

Contains:
- Attribution: *"Drug interaction data provided by [DDInter](https://ddinter.scbdd.com/) (CC-BY-NC-SA), CBDD Group, Central South University."*
- Medical disclaimer: *"This tool is for informational and educational purposes only. It is not a substitute for professional medical advice. Always consult a licensed healthcare provider before changing your medication regimen."*

### 6.2 Inline Disclaimer on Results

Each results card includes a small italic note: *"Results are based on currently published literature. Some interactions may not yet be documented."*

---

## 7. Interaction States & Loading

| State | UI Behavior |
|---|---|
| Idle | Search panel visible; results panel hidden |
| Typing | Autocomplete dropdown visible after 2 chars; 300ms debounce |
| Searching | Spinner inside the Check button; button disabled |
| Success | Results panel animates in |
| Not found | Inline message in the relevant search field |
| API error | Error banner above results panel |

---

## 8. Accessibility

- All `[?]` tooltip triggers are keyboard-accessible (focusable, activatable with Enter/Space).
- Tooltips use `role="tooltip"` and are linked to their trigger via `aria-describedby`.
- Severity badges use both color and icon/text — never color alone.
- Form fields have visible labels and `aria-label` attributes.
- Autocomplete dropdown uses `role="listbox"` / `role="option"` ARIA pattern.
- Focus is trapped in open tooltips/modals; Escape closes them.
- Minimum color contrast ratio of 4.5:1 for all text.

---

## 9. Technical Stack (Recommended)

| Layer | Recommendation |
|---|---|
| Frontend | React (with hooks) or plain HTML/CSS/JS |
| Styling | Tailwind CSS or custom CSS variables |
| API calls | Fetch API with async/await; 300ms debounce on autocomplete |
| Proxy (if needed) | Node.js + Express, or Cloudflare Worker to relay DDInter requests |
| Hosting | Any static host (Vercel, Netlify, GitHub Pages) if proxy is separate |

---

## 10. Out of Scope (v1)

- User accounts or saved history
- Checking more than 2 drugs at once (DDInter's checker supports up to 5 — consider for v2)
- Drug-food interactions (available in DDInter 2.0 — v2 candidate)
- Drug-disease interactions (v2 candidate)
- Mobile app wrapper
- PDF export of results

---

## 11. Open Questions

1. Will DDInter's API allow direct browser-side requests (CORS)? If not, a proxy is required from day one.
2. Should the app use DDInter v1 or DDInter 2.0 (`ddinter2.scbdd.com`)? v2.0 has more data and drug-food interactions.
3. What is the expected volume of users? If high, caching popular drug lookups server-side will reduce load on DDInter.
4. Is there a preferred brand name for the tool?
5. Should results be shareable via URL (e.g., `?drugA=ibuprofen&drugB=warfarin`)?
