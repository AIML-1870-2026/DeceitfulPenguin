# Weather Dashboard — Claude Code Spec

## Overview
Build a single-page weather dashboard that fetches live data from the OpenWeather API and displays aviation/meteorology-style weather information for a user-selected city. The aesthetic should feel like a refined pilot's glass cockpit or METAR briefing tool — dark, technical, precise, and atmospheric.

---

## API Details

- **Provider**: OpenWeather
- **API Key**: `474a55d072011c8c01bd3d67da6d5e49`
- **Endpoints to use**:
  - Current weather: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric`
  - (Metric units from the API; all unit conversions are done client-side)

---

## Features

### City Search
- A prominent search bar at the top of the page
- User types a city name and submits (Enter key or search button)
- On submit, fetch live weather data for that city
- Show a friendly error message if the city is not found or the API returns an error
- Default city on load: `Omaha` (or leave blank and prompt user to search)

### Weather Data Display
Display the following fields, with all unit conversions applied client-side:

| Field | Source field(s) | Conversion | Display unit |
|---|---|---|---|
| **Wind Direction** | `wind.deg` | degrees → cardinal (e.g. "270° W") | degrees + cardinal |
| **Wind Speed** | `wind.speed` | m/s × 1.94384 | knots (kts) |
| **Cloud Ceiling** | `clouds.all` + `weather[0].id` | Use `visibility` and cloud description to estimate ceiling; if OVC/BKN cloud data available use it. See note below. | ft MSL |
| **Temperature** | `main.temp` | already in °C (units=metric) | °C |
| **Dewpoint** | `main.temp` + `main.humidity` | Calculate: T_d = T − ((100 − RH) / 5) | °C |
| **Barometric Pressure** | `main.pressure` | hPa × 0.02953 | inHg |
| **Visibility** | `visibility` | meters × 0.000621371 | statute miles (sm) |
| **Humidity** | `main.humidity` | none | % |

> **Cloud Ceiling Note**: The OpenWeather free API does not return individual cloud layer altitudes. Use the following approach:
> - If `weather[0].id` is in the 800s (clear/few clouds), display ceiling as "Unlimited" or "> 12,000 ft"
> - If `clouds.all` is 0–10%, ceiling = "Unlimited"
> - If `clouds.all` is 11–50%, ceiling = "5,000 ft AGL (est.)"
> - If `clouds.all` is 51–84%, ceiling = "3,000 ft AGL (est.)"
> - If `clouds.all` is 85–100%, ceiling = "1,000 ft AGL (est.)"
> - Append "(estimated)" to all ceiling values and add a small tooltip/note that precise ceiling requires a paid API tier

---

## Design Direction

**Aesthetic**: Dark cockpit / aviation instrument panel. Think glass-cockpit avionics meets brutalist type design.

- **Color palette**: Deep near-black background (`#0a0c0f`), with muted blue-grey panels, and a single vivid accent (electric cyan `#00d4ff` or amber `#ffb347`)
- **Typography**: Use a monospaced or semi-monospaced font for data values (e.g. `JetBrains Mono`, `Space Mono`, or `IBM Plex Mono` from Google Fonts). Use a condensed sans-serif for labels (e.g. `Barlow Condensed` or `Bebas Neue`)
- **Layout**: Grid of instrument cards — each weather field gets its own "instrument" tile. Cards should feel like individual cockpit gauges or EFIS displays
- **Details**:
  - Subtle scanline or grid texture on the background
  - Cards have thin glowing borders on hover (accent color)
  - Data values should be large and prominent, labels small and uppercase
  - Wind direction could include a small SVG compass rose or arrow indicator
  - Subtle fade-in animation when data loads
  - A "last updated" timestamp in small text

---

## Tech Stack

- **Vanilla HTML + CSS + JavaScript** (single `index.html` file, no build step required)
- No frameworks needed; keep it simple and self-contained
- Fetch API for HTTP requests
- All styles inline in `<style>` tags or a `<link>` to a local `style.css`
- Fonts loaded from Google Fonts CDN

---

## File Structure

```
/
├── index.html       # Main page (can be self-contained)
└── style.css        # Optional separate stylesheet
```

---

## UX Details

- Loading state: show a subtle pulsing animation on cards while data is fetching
- Error state: if city not found, show a clear inline error (e.g. "City not found. Try another search.")
- Responsive: should work on mobile and desktop (grid collapses to 2 or 1 column on small screens)
- No page reload on search — update data in place

---

## Example Card Layout (wireframe concept)

```
┌─────────────────────┐  ┌─────────────────────┐
│ WIND                │  │ TEMPERATURE          │
│  270° W             │  │  14.3°C              │
│  12 kts             │  │  Dewpoint: 8.1°C     │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ CEILING             │  │ PRESSURE             │
│  3,000 ft AGL (est) │  │  29.85 inHg          │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ VISIBILITY          │  │ HUMIDITY             │
│  6.2 sm             │  │  67%                 │
└─────────────────────┘  └─────────────────────┘
```

---

## Notes for Claude Code

- Double-check all unit conversion math before displaying
- Dewpoint formula: `T_d = T - ((100 - RH) / 5)` where T is in °C and RH is relative humidity 0–100
- Wind direction: convert degrees to 16-point cardinal (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW)
- Pressure conversion: `hPa * 0.02953 = inHg`, rounded to 2 decimal places
- Wind speed conversion: `m/s * 1.94384 = knots`, rounded to 1 decimal place
- Visibility conversion: `meters / 1609.34 = statute miles`, rounded to 1 decimal place
- All values should degrade gracefully if a field is missing from the API response (show "N/A")
