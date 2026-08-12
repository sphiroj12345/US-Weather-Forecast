---
inclusion: always
---

# Design

## Architecture

Single-page app with no build step. Two files handle everything:

```
index.html  — UI structure, styles, and script include
app.js      — all application logic (geocoding, API calls, rendering)
```

## Data Flow

1. User types city name → clicks "Get Forecast" button
2. `app.js` calls Nominatim: `https://nominatim.openstreetmap.org/search?q={city}&format=json&countrycodes=us&limit=1`
3. Extract lat/lon from response
4. Call NWS points endpoint: `https://api.weather.gov/points/{lat},{lon}`
5. Extract forecast URL from response
6. Call NWS forecast endpoint to get 5-day forecast periods
7. Parse periods into day/night pairs, map conditions to icons
8. Render forecast as an HTML table

## UI Layout

- Header with app title
- Input field + "Get Forecast" button
- Error message area (hidden by default)
- Forecast table with columns: Day | Icon | Condition | High | Low

## Weather Icons

Map NWS `shortForecast` text to emoji icons using keyword matching:

| Keyword contains | Icon |
|-----------------|------|
| sunny, clear    | ☀️   |
| cloud           | ☁️   |
| rain, shower    | 🌧️  |
| snow            | ❄️   |
| thunder, storm  | ⛈️   |
| fog             | 🌫️  |
| wind            | 💨   |
| default         | 🌤️  |

## Error Handling

- Nominatim returns empty array → "City not found or not in the US"
- NWS API fails → "Unable to fetch weather data. Try again."
- Network error → "Network error. Check your connection."

## Server

`start-server.ps1` uses `System.Net.HttpListener` on port 8080, serves static files from the project root with appropriate MIME types (text/html, application/javascript, etc.).
