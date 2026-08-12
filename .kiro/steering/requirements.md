---
inclusion: always
---

# Requirements

## Functional Requirements
1. User enters a US city name and the app geocodes it via Nominatim then fetches weather from the National Weather Service API
2. Display a 5-day forecast in a table format (date, condition, high/low temps)
3. Show appropriate weather icons (sunny, rainy, cloudy, snowy, etc.) alongside each forecast entry
4. Handle errors gracefully — invalid city, network failure, or city not in US
5. App runs on localhost:8080 via a PowerShell HTTP server script with no external dependencies

## Out of Scope
- No caching, classes, interfaces, or frameworks
- No authentication or international city support
