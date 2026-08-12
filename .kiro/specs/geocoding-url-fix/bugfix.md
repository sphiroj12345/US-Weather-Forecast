# Bugfix Requirements Document

## Introduction

The weather app's city search is completely broken. The `geocodeCity` function in `app.js` was changed to use an invalid Census Bureau geocoder endpoint (`https://geocoding.geo.census.gov/geocoder/locations/invalid?q=...`) instead of the correct Nominatim API endpoint (`https://nominatim.openstreetmap.org/search?q=...&format=json&countrycodes=us&limit=1`). This causes every geocoding request to fail, meaning no city can be looked up and no weather data can be fetched. The app was working yesterday before this URL change was introduced.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user searches for any US city THEN the system sends the geocoding request to `https://geocoding.geo.census.gov/geocoder/locations/invalid` which returns an error or non-matching response format
1.2 WHEN the geocoding request fails or returns an unexpected response THEN the system displays "Unable to fetch weather data. Please try again." for every city search
1.3 WHEN a valid city name is entered THEN the system never reaches the NWS forecast API because geocoding always fails first

### Expected Behavior (Correct)

2.1 WHEN a user searches for any US city THEN the system SHALL send the geocoding request to `https://nominatim.openstreetmap.org/search` with query parameters `q={city}&format=json&countrycodes=us&limit=1`
2.2 WHEN the Nominatim geocoding request succeeds and returns results THEN the system SHALL parse the response as a JSON array and extract `lat`, `lon`, and `display_name` from the first result
2.3 WHEN a valid US city name is entered THEN the system SHALL successfully geocode the city and proceed to fetch the NWS forecast data

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a city name is not found or is not in the US THEN the system SHALL CONTINUE TO display "City not found or not in the US. Please try another city."
3.2 WHEN the NWS API fails after successful geocoding THEN the system SHALL CONTINUE TO display "Unable to fetch weather data. Please try again."
3.3 WHEN a network error occurs THEN the system SHALL CONTINUE TO display "Network error. Check your connection and try again."
3.4 WHEN the search input is empty THEN the system SHALL CONTINUE TO display "Please enter a city name."
3.5 WHEN a valid city is geocoded and NWS returns forecast data THEN the system SHALL CONTINUE TO render the 5-day forecast table with day name, icon, condition, high, and low temperatures
