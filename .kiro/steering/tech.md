# Tech Stack

## Languages & Frameworks
- Plain HTML5
- Vanilla JavaScript (no frameworks, no build step)
- CSS (inline in a `<style>` block within index.html)

## External APIs
- Nominatim geocoding: `https://nominatim.openstreetmap.org/search`
- National Weather Service: `https://api.weather.gov/points/{lat},{lon}` and forecast endpoints

## Runtime
- Served via a local HTTP server on `localhost:8080`
- PowerShell script starts the server using `System.Net.HttpListener`

## Common Commands

Start the app:
```powershell
.\start-server.ps1
```

Validate JavaScript syntax:
```bash
node --check app.js
```

## Constraints
- No build tools, bundlers, or package managers
- No Node.js runtime dependencies (node_modules not used)
- No API keys needed
- No caching layer
- No classes or interfaces
- Use `var` declarations and `function` keyword (ES5-compatible style)
- NWS requests require a `User-Agent` header
