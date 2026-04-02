# NASA Live Data Dashboard — Specification

## Overview

A single-page web dashboard that pulls live data from NASA's public APIs using the provided API key. The dashboard is divided into three tabs, each dedicated to a distinct NASA data domain. The interface is dark-themed, space-inspired, and fully interactive — allowing users to filter, explore, and drill into data without leaving the page.

**API Key:** `MnNoal3z28gQE38nEjYEbe05kN8MKSZw1eqwEn0h`  
**Base URL:** `https://api.nasa.gov`  
**Tech Stack:** Single HTML file (vanilla JS + CSS, no build step required). All API calls made client-side via `fetch()`.

---

## Global UI

- **Header:** NASA logo (SVG inline), dashboard title "NASA Live Dashboard", last-refreshed timestamp (auto-updates on data fetch), and a global "Refresh All" button.
- **Tab Bar:** Three tabs with icons. Active tab is visually highlighted.
- **Color Palette:** Dark background (`#0b0d17`), accent blue (`#1e6bff`), accent orange (`#ff6b35`), white text, subtle grid/star CSS background.
- **Loading States:** Each data panel shows a pulsing skeleton loader while fetching.
- **Error States:** If an API call fails, an inline error banner shows the HTTP status and a "Retry" button — the rest of the dashboard remains functional.
- **Responsive:** Fully usable on mobile (tabs collapse to icon-only on narrow screens).

---

## Tab 1 — Asteroid Watch (NeoWs)

### Data Source
`GET https://api.nasa.gov/neo/rest/v1/feed`  
Parameters: `start_date`, `end_date`, `api_key`

Default range: today ± 3 days (a 7-day window).

### Layout

**Top Controls Bar**
- Date range picker (start date / end date inputs, max 7-day window enforced per API limits).
- "Fetch" button triggers a new API call with the selected range.
- Summary stat chips (auto-populated after fetch):
  - Total NEOs in range
  - Potentially Hazardous count (highlighted in orange if > 0)
  - Largest by estimated diameter (km)
  - Fastest approach velocity (km/s)

**Main Panel — Asteroid Table**

Sortable, filterable table with the following columns:

| Column | Source Field | Notes |
|---|---|---|
| Name | `neo_reference_id` / `name` | Clickable — opens Detail Modal |
| Close Approach Date | `close_approach_data[0].close_approach_date` | |
| Miss Distance (lunar) | `close_approach_data[0].miss_distance.lunar` | Color-coded: <5 LD = red, 5–20 = yellow, >20 = green |
| Velocity (km/h) | `close_approach_data[0].relative_velocity.kilometers_per_hour` | |
| Est. Diameter Max (m) | `estimated_diameter.meters.estimated_diameter_max` | |
| Hazardous? | `is_potentially_hazardous_asteroid` | ⚠️ badge if true |
| Absolute Magnitude | `absolute_magnitude_h` | |

- Column header click: toggles ascending/descending sort.
- Search input: filters table rows by asteroid name in real-time.
- "Hazardous Only" toggle switch: filters to only PHAs.

**Detail Modal**

Clicking an asteroid row opens a modal overlay with:
- Full name and NASA JPL reference ID
- Orbital data: orbit class, first/last observation date, orbital period
- All close approach entries (not just the nearest) in a mini table
- Diameter range (min/max, in meters and feet)
- Link: "View on JPL Small-Body DB →" (external)

**Mini Visualization — Miss Distance Bar Chart**

Below the table: a horizontal bar chart (rendered in SVG/Canvas, no library required) showing the top 10 closest-approaching NEOs by miss distance in lunar distances. Bars are colored using the same red/yellow/green scheme as the table. Hovering a bar shows a tooltip with name + exact distance.

---

## Tab 2 — Earth Events Tracker (EONET)

### Data Source
`GET https://eonet.gsfc.nasa.gov/api/v3/events`  
Parameters: `status`, `limit`, `days`, `category` (optional), `api_key`

Default: `status=open`, `days=60`, `limit=50`.

### Layout

**Top Controls Bar**
- "Status" toggle: Open | Closed | All
- "Days Back" slider: 7 / 14 / 30 / 60 / 90 (updates fetch)
- Category filter dropdown: All, Wildfires, Volcanoes, Severe Storms, Sea/Lake Ice, Earthquakes, Drought, Dust/Haze, Floods, Landslides, Snow (populated dynamically from `GET /api/v3/categories`)
- Summary stat chips:
  - Total active events
  - Most common category
  - Most recent event (name + date)

**Main Panel — Split View**

Left side (40%): scrollable event list cards. Each card shows:
- Category icon (emoji: 🔥 wildfire, 🌋 volcano, 🌀 storm, etc.)
- Event title
- Category badge
- Date started
- Status badge (Open = pulsing green dot, Closed = gray)
- On click: highlights the event on the map and expands the detail panel

Right side (60%): interactive world map built with SVG (or Leaflet.js via CDN). Event locations are plotted as colored markers by category. Clicking a marker selects the event and expands details below the map.

**Event Detail Panel** (appears below map when event selected):
- Full event title and ID
- All geometry entries (dates + coordinates) in a small table — useful for tracking storm paths
- Link to source (NASA image/data source URL from the API response)
- "View on NASA Worldview →" external link constructed from coordinates

**Category Breakdown Chart**

A donut chart (SVG) showing event count by category for the current filtered dataset. Segments are color-coded per category, with a legend. Clicking a segment filters the event list to that category.

---

## Tab 3 — Picture of the Day & Space Gallery (APOD)

### Data Source
`GET https://api.nasa.gov/planetary/apod`  
Parameters: `date`, `start_date`, `end_date`, `count`, `thumbs`, `api_key`

### Layout

**Today's APOD — Hero Section**

Full-width hero panel at the top:
- Date badge ("Today — April 2, 2026")
- Title (large, styled)
- Media display:
  - If `media_type === "image"`: displays the image (HD if available), click opens lightbox with the `hdurl` version.
  - If `media_type === "video"`: renders an `<iframe>` embed (YouTube/Vimeo).
- Explanation text (collapsed to 3 lines with a "Read more" toggle)
- Copyright credit (if present)
- Action buttons: "Download HD Image" (links to `hdurl`), "Share" (copies URL to clipboard)

**Date Picker**

A date input (max = today, min = 1995-06-16, the first APOD) allowing the user to navigate to any historical APOD. On date change, re-fetches and re-renders the hero panel. "← Yesterday" / "Today →" arrow buttons for quick navigation.

**Random Gallery**

Below the hero: a grid gallery of 9 random APODs (fetched via `count=9`). Refreshable with a "Shuffle 🔀" button that fetches a new set of 9. Each card shows:
- Thumbnail (or video thumbnail via `thumbs=true`)
- Title
- Date
- Media type badge (IMAGE / VIDEO)
- Click: loads that APOD into the hero section and scrolls up

**Search / Filter Bar** (operates on the gallery, not a new API call):
- Real-time text filter on title and explanation across the currently loaded cards.
- "Images only" / "Videos only" toggle.

**Stats Strip** (between hero and gallery):
- Streak counter: "APOD has published every day for X days" (calculated from 1995-06-16 to today)
- Days since first APOD
- A fun fact about the current image's title keywords (static lookup map for ~20 common space object types)

---

## Interactivity Summary

| Feature | Tabs |
|---|---|
| Date/range pickers triggering live API calls | 1, 3 |
| Sortable + filterable data table | 1 |
| Modal detail drilldown | 1 |
| SVG/Canvas data visualization (chart) | 1, 2 |
| Interactive map with clickable markers | 2 |
| Category/status filter dropdowns | 2 |
| Image lightbox (HD expand) | 3 |
| Random shuffle (new API call) | 3 |
| Real-time search/filter | 1, 3 |
| Responsive layout (mobile-first) | All |
| Per-panel loading skeletons | All |
| Per-panel error + retry handling | All |

---

## API Rate Limit Handling

- All fetches are debounced (300ms) to prevent rapid-fire calls on slider/date input.
- Responses are cached in a simple in-memory JS object keyed by URL. Cache TTL: 5 minutes for EONET/NeoWs (live event data), 60 minutes for APOD (daily content).
- If an API response returns HTTP 429, show a "Rate limit reached — try again in a moment" message with an auto-retry countdown (30s).
- The API key is stored as a JS `const` at the top of the file for easy replacement.

---

## File Structure

This is a single self-contained HTML file:

```
nasa-dashboard.html
├── <head>         — meta, inline CSS (dark theme, layout, animations)
├── <body>
│   ├── Header bar
│   ├── Tab navigation
│   ├── Tab panels (3×)
│   │   ├── Controls bar
│   │   ├── Main content area
│   │   └── Visualization panels
│   └── Modal overlay (shared, shown/hidden by JS)
└── <script>       — all JS inline
    ├── Config (API key, base URLs, cache)
    ├── API helpers (fetch + cache wrapper)
    ├── Tab 1 logic (NeoWs fetch, render, sort, filter, modal)
    ├── Tab 2 logic (EONET fetch, render, SVG map, donut chart)
    ├── Tab 3 logic (APOD fetch, hero render, gallery, lightbox)
    └── UI utilities (skeleton, error banner, debounce, tab switching)
```

---

## Out of Scope (for this version)

- User authentication / personalization
- Server-side rendering or backend proxy
- Persistent storage (localStorage, DB)
- Push notifications for new events
- More than the three NASA APIs listed above
