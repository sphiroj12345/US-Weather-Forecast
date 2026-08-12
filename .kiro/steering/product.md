# Product Summary

A single-page weather forecast app for US cities. The user enters a city name, the app geocodes it via Nominatim and fetches a 5-day forecast from the National Weather Service API, then displays results in a table with emoji weather icons.

## Key Behavior
- User enters a US city name in a text input and clicks "Get Forecast"
- App geocodes the city using Nominatim (OpenStreetMap) to get lat/lon
- App calls the NWS API to retrieve a 5-day forecast (day/night period pairs)
- Forecast is rendered in a table with columns: Day, Icon, Condition, High, Low
- Errors are shown inline (city not found, API failure, network error)

## Data Sources
- Geocoding: Nominatim API (`https://nominatim.openstreetmap.org/search`) — no key required, avoids CORS
- Weather: National Weather Service API (`https://api.weather.gov`) — free, no key, US-only
