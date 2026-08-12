---
inclusion: always
---

# Product Summary

A simple weather app that displays current weather conditions for US cities. The user enters a city name and the app fetches and displays weather data.

## Key Behavior
- User enters a US city name in a text input
- App geocodes the city using Nominatim (OpenStreetMap) to get lat/lon coordinates
- App calls the National Weather Service (NWS) API to retrieve current conditions
- Weather data is displayed to the user

## Data Sources
- Geocoding: Nominatim API (https://nominatim.openstreetmap.org) — avoids CORS issues
- Weather: National Weather Service API (https://api.weather.gov) — free, no API key required, US-only
