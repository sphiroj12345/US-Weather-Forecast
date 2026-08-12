# Implementation Plan

## Overview

Fix the broken geocoding in the weather app by replacing the invalid Census Bureau URL with the correct Nominatim API endpoint in the `geocodeCity` function. Uses the exploratory bugfix workflow: write tests to confirm the bug, write preservation tests for unchanged behavior, apply the fix, then validate everything passes.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Geocoding URL Points to Invalid Census Bureau Endpoint
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to verify that for any non-empty city string passed to `geocodeCity`, the constructed URL starts with `https://nominatim.openstreetmap.org/search` and includes query parameters `format=json`, `countrycodes=us`, and `limit=1`
  - Extract the URL construction logic from `geocodeCity` in `app.js` and verify the URL domain and path
  - Test that `geocodeCity("New York")` constructs a request URL starting with `https://nominatim.openstreetmap.org/search`
  - Test that the URL contains `?q=New%20York&format=json&countrycodes=us&limit=1`
  - Generate random non-empty city name strings and assert the constructed URL always points to Nominatim with correct parameters
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists because the URL points to `https://geocoding.geo.census.gov/geocoder/locations/invalid`)
  - Document counterexamples found: any non-empty city string produces a URL pointing to the wrong endpoint
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Error Handling and Non-Geocoding Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: `handleSearch()` with empty input shows "Please enter a city name."
  - Observe on UNFIXED code: `showError("test")` displays the error message and hides the forecast container
  - Observe on UNFIXED code: `hideError()` hides the error message element
  - Observe on UNFIXED code: `parseForecastDays` correctly pairs day/night periods and returns up to 5 days
  - Observe on UNFIXED code: `getWeatherIcon` maps keywords to correct emoji icons
  - Observe on UNFIXED code: `formatTemp` returns correct Fahrenheit and Celsius strings
  - Observe on UNFIXED code: `fToC(32)` returns 0, `fToC(212)` returns 100
  - Write property-based tests that for all non-geocoding-URL code paths, the behavior is preserved:
    - For any forecast keyword string, `getWeatherIcon` returns the same mapped emoji
    - For any temperature value, `formatTemp` returns correctly formatted string based on unit
    - For any valid periods array, `parseForecastDays` returns correct day/night pairings (max 5)
    - Empty input validation always shows "Please enter a city name."
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix geocoding URL in geocodeCity function

  - [ ] 3.1 Implement the fix
    - Replace the URL base in `geocodeCity` from `https://geocoding.geo.census.gov/geocoder/locations/invalid` to `https://nominatim.openstreetmap.org/search`
    - Verify query parameters remain `?q={city}&format=json&countrycodes=us&limit=1`
    - No changes to response parsing logic (already expects Nominatim format: `data[0].lat`, `data[0].lon`, `data[0].display_name`)
    - No changes to any other functions in `app.js`
    - _Bug_Condition: isBugCondition(input) where input.city is non-empty AND requestURL starts with "https://geocoding.geo.census.gov/geocoder/locations/invalid"_
    - _Expected_Behavior: requestURL starts with "https://nominatim.openstreetmap.org/search" with correct query parameters, response parsed as JSON array with lat, lon, display_name_
    - _Preservation: All error handling, NWS API calls, forecast rendering, unit toggle, and icon mapping remain unchanged_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Geocoding URL Points to Nominatim
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (URL must point to Nominatim)
    - When this test passes, it confirms the URL is now correct
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - URL now points to `https://nominatim.openstreetmap.org/search`)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Error Handling and Non-Geocoding Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in error handling, forecast rendering, unit toggle, or icon mapping)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run `node --check app.js` to validate JavaScript syntax
  - Re-run all property-based tests (bug condition and preservation)
  - Verify the geocoding URL in `app.js` is `https://nominatim.openstreetmap.org/search`
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2"],
    ["3.1"],
    ["3.2", "3.3"],
    ["4"]
  ]
}
```

## Notes

- The bug is deterministic: every call to `geocodeCity` with any non-empty string triggers the bug because the URL is hardcoded incorrectly
- The fix is a single-line URL change in `app.js` - no structural changes needed
- Response parsing logic already matches Nominatim format, so only the URL base needs changing
- Property-based tests should use `node --check` for basic validation per project steering guidelines
- No test framework infrastructure is needed beyond basic script-based validation per project constraints
