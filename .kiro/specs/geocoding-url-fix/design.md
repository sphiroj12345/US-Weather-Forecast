# Geocoding URL Fix Bugfix Design

## Overview

The weather app's city search is completely broken because the `geocodeCity` function in `app.js` was changed to use an invalid Census Bureau geocoder endpoint (`https://geocoding.geo.census.gov/geocoder/locations/invalid?q=...`) instead of the correct Nominatim API endpoint (`https://nominatim.openstreetmap.org/search?q=...&format=json&countrycodes=us&limit=1`). The fix restores the original Nominatim URL and query parameters so geocoding succeeds and the app can fetch weather data.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — any call to `geocodeCity` sends the request to the wrong endpoint, causing all city lookups to fail
- **Property (P)**: The desired behavior — `geocodeCity` sends requests to `https://nominatim.openstreetmap.org/search` with proper query parameters and parses the response correctly
- **Preservation**: Existing error handling, NWS forecast fetching, rendering, and unit toggle behavior that must remain unchanged by the fix
- **geocodeCity**: The function in `app.js` that converts a city name string into lat/lon coordinates using an external geocoding API
- **Nominatim**: OpenStreetMap's free geocoding service that accepts city names and returns coordinates

## Bug Details

### Bug Condition

The bug manifests when any user searches for any city. The `geocodeCity` function constructs a URL pointing to `https://geocoding.geo.census.gov/geocoder/locations/invalid` which is not a valid endpoint. This causes either a network error or an unexpected response format, preventing all geocoding from succeeding.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { city: string }
  OUTPUT: boolean
  
  RETURN input.city IS NOT empty
         AND geocodeCity(input.city) is called
         AND requestURL starts with "https://geocoding.geo.census.gov/geocoder/locations/invalid"
END FUNCTION
```

### Examples

- User searches "New York" → geocoding request goes to Census Bureau invalid endpoint → fails → shows "Unable to fetch weather data. Please try again." (Expected: successful geocoding via Nominatim, forecast displayed)
- User searches "Chicago" → same invalid endpoint → fails → same error message (Expected: successful geocoding, forecast displayed)
- User searches "Los Angeles" → same invalid endpoint → fails → same error message (Expected: successful geocoding, forecast displayed)
- User searches "nonexistent_city_xyz" → still hits invalid endpoint and fails with wrong error (Expected: Nominatim returns empty array, shows "City not found or not in the US")

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Error handling for empty input must continue to show "Please enter a city name."
- Error handling for city not found must continue to show "City not found or not in the US. Please try another city."
- Error handling for NWS API failures must continue to show "Unable to fetch weather data. Please try again."
- Error handling for network errors must continue to show "Network error. Check your connection and try again."
- NWS forecast fetching logic (getForecast function) must remain unchanged
- Forecast rendering (renderForecast function) must remain unchanged
- Temperature unit toggle must remain unchanged
- Weather icon mapping must remain unchanged

**Scope:**
All code paths that do NOT involve the geocoding URL construction should be completely unaffected by this fix. This includes:
- The NWS API calls (points and forecast endpoints)
- The forecast parsing logic (parseForecastDays)
- The UI rendering and DOM manipulation
- The temperature conversion and unit toggle
- The error message display logic
- The event listeners for button clicks and keypress

## Hypothesized Root Cause

Based on the bug description, the root cause is clear:

1. **Incorrect URL in geocodeCity**: The URL was changed from `https://nominatim.openstreetmap.org/search` to `https://geocoding.geo.census.gov/geocoder/locations/invalid`. This is an invalid endpoint that does not exist on the Census Bureau geocoder.

2. **Incorrect query parameter format**: The current URL uses `?q=` as the only meaningful parameter but is missing `&format=json&countrycodes=us&limit=1` which are required for Nominatim to return the expected JSON array format.

3. **Response format mismatch**: Even if the Census Bureau endpoint returned data, its response format differs from Nominatim's. The code expects a JSON array with `lat`, `lon`, and `display_name` fields (Nominatim format), not the Census Bureau response structure.

## Correctness Properties

Property 1: Bug Condition - Geocoding URL Correctness

_For any_ input where a non-empty city name is provided to `geocodeCity`, the fixed function SHALL send the HTTP request to `https://nominatim.openstreetmap.org/search` with query parameters `q={city}&format=json&countrycodes=us&limit=1`, and SHALL correctly parse the Nominatim JSON array response extracting `lat`, `lon`, and `display_name` from the first result.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Error Handling and Non-Geocoding Behavior

_For any_ input or interaction that does NOT involve the geocoding URL construction (empty input validation, NWS API calls, forecast rendering, unit toggle, error display), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality for non-geocoding code paths.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

The root cause is definitively the incorrect URL in the `geocodeCity` function.

**File**: `app.js`

**Function**: `geocodeCity`

**Specific Changes**:
1. **Replace the URL domain and path**: Change `https://geocoding.geo.census.gov/geocoder/locations/invalid` to `https://nominatim.openstreetmap.org/search`

2. **Fix query parameters**: Ensure the URL includes `?q={city}&format=json&countrycodes=us&limit=1` (the current code only has `?q=` followed by the city name; the remaining parameters `&format=json&countrycodes=us&limit=1` need to be part of the corrected URL construction)

3. **No other changes needed**: The response parsing logic (`data[0].lat`, `data[0].lon`, `data[0].display_name`) already matches the Nominatim response format, so no parsing changes are required

**Before (broken):**
```javascript
var url = "https://geocoding.geo.census.gov/geocoder/locations/invalid?q=" +
    encodeURIComponent(city) + "&format=json&countrycodes=us&limit=1";
```

**After (fixed):**
```javascript
var url = "https://nominatim.openstreetmap.org/search?q=" +
    encodeURIComponent(city) + "&format=json&countrycodes=us&limit=1";
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Call `geocodeCity` with valid US city names and observe that requests go to the wrong endpoint and fail. Verify the constructed URL is incorrect.

**Test Cases**:
1. **Valid City Test**: Call `geocodeCity("New York")` and verify the request URL starts with `https://geocoding.geo.census.gov` (will fail/error on unfixed code)
2. **URL Construction Test**: Inspect the constructed URL string and confirm it does not point to Nominatim (will demonstrate bug)
3. **Response Parsing Test**: If the Census endpoint returns anything, verify it doesn't match the expected `[{lat, lon, display_name}]` format (will fail on unfixed code)
4. **End-to-End Search Test**: Trigger `handleSearch("Chicago")` and verify the forecast never renders (will fail on unfixed code)

**Expected Counterexamples**:
- All geocoding requests fail because `https://geocoding.geo.census.gov/geocoder/locations/invalid` is not a valid endpoint
- Possible causes: URL was manually or accidentally changed to an invalid endpoint

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := geocodeCity_fixed(input.city)
  ASSERT requestURL starts with "https://nominatim.openstreetmap.org/search"
  ASSERT requestURL contains "format=json"
  ASSERT requestURL contains "countrycodes=us"
  ASSERT requestURL contains "limit=1"
  ASSERT result has { lat, lon, name } when city exists
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT geocodeCity_original(input) = geocodeCity_fixed(input)
  ASSERT handleSearch_original("") = handleSearch_fixed("")
  ASSERT getForecast_original(lat, lon) = getForecast_fixed(lat, lon)
  ASSERT renderForecast_original(days, name) = renderForecast_fixed(days, name)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for empty input, error paths, and rendering logic, then write tests capturing that behavior continues after the fix.

**Test Cases**:
1. **Empty Input Preservation**: Verify that empty input still shows "Please enter a city name." after fix
2. **Error Message Preservation**: Verify that error display logic continues to work correctly
3. **Forecast Rendering Preservation**: Verify that `renderForecast` produces identical output for the same input data
4. **Unit Toggle Preservation**: Verify that temperature unit switching continues to work correctly

### Unit Tests

- Test that the constructed URL in `geocodeCity` starts with `https://nominatim.openstreetmap.org/search`
- Test that query parameters include `format=json`, `countrycodes=us`, and `limit=1`
- Test that `geocodeCity` returns `null` when Nominatim returns an empty array
- Test that empty input validation still triggers the correct error message

### Property-Based Tests

- Generate random city name strings and verify the constructed URL always points to Nominatim with correct query parameters
- Generate random non-empty strings and verify `geocodeCity` always constructs a valid URL (no malformed encoding)
- Generate random forecast data arrays and verify `renderForecast` produces consistent output before and after fix

### Integration Tests

- Test full search flow: enter "New York" → geocode via Nominatim → fetch NWS forecast → render table
- Test error flow: enter invalid city → Nominatim returns empty → "City not found" message displayed
- Test that the fix does not interfere with the unit toggle or forecast re-rendering
