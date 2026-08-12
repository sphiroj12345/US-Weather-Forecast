---
inclusion: always
---

- Keep the design simple. Development should be quick.
- The goal is to complete the project in 20 minutes.
- Use HTML and JavaScript to build the app.
- Do not implement caching or classes or interfaces.
- Limit the unit test code to only basic testing. If `node --check` passes, the JavaScript is valid. No further test infrastructure is needed for this project.
- Do not hardcode or store city names in the web app code. Instead pass city names entered by the web app UI end user directly to the National Weather Service API.
- Avoid CORS errors by using Nominatim geocoding.
- If you face path issues trying to start the web app, create a batch script to start the web app.
- Run the app on localhost:8080 using a PowerShell script to start a local HTTP server.
- Show the 5-day forecast in a table format.
- Add appropriate weather icons (sunny, rainy, cloudy, snowy, etc.) for each forecast entry.
- Early in development, once basic functionality is working, start the server so the user can test in a browser.
- There should be no more than 5 requirements and no more than 6 tasks.
