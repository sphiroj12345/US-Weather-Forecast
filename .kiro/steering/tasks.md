---
inclusion: always
---

# Tasks

## Task 1: Create the PowerShell HTTP server script
Create `start-server.ps1` that serves static files from the project root on localhost:8080 using `System.Net.HttpListener`. Handle MIME types for .html, .js, and .css files.

## Task 2: Create the HTML page with UI structure
Create `index.html` with a text input for city name, a "Get Forecast" button, an error message area (hidden by default), and an empty table container for the forecast. Include basic CSS styling inline and link to `app.js`.

## Task 3: Implement geocoding and NWS API calls in app.js
Create `app.js` with functions to: geocode a city name via Nominatim (US only), call NWS points endpoint with lat/lon, then fetch the forecast URL. Wire the button click to trigger this flow.

## Task 4: Render the 5-day forecast table with weather icons
Parse NWS forecast periods into day/night pairs. Map `shortForecast` text to emoji icons using keyword matching. Render an HTML table with columns: Day, Icon, Condition, High, Low.

## Task 5: Add error handling
Display user-friendly error messages for: city not found, NWS API failure, and network errors. Show/hide the error area as appropriate.

## Task 6: Start the server and test in browser
Run `start-server.ps1` to launch the app on localhost:8080. Validate JavaScript with `node --check app.js`. Open the app in a browser for user testing.
