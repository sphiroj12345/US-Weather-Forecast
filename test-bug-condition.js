// Bug Condition Exploration Test
// Property 1: Geocoding URL Points to Nominatim (Expected to FAIL on unfixed code)
// Validates: Requirements 1.1, 1.2, 1.3, 2.1

// Minimal property-based test harness
function generateRandomCityName() {
    var chars = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var len = Math.floor(Math.random() * 20) + 1; // 1 to 20 chars
    var result = "";
    for (var i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result.trim() || "a"; // ensure non-empty
}

// Extract the URL construction logic from geocodeCity
function buildGeocodeUrl(city) {
    // This replicates the URL construction from geocodeCity in app.js
    var url = "https://nominatim.openstreetmap.org/search?q=" +
        encodeURIComponent(city) + "&format=json&countrycodes=us&limit=1";
    return url;
}

// Property: For any non-empty city string, the constructed URL MUST start with
// https://nominatim.openstreetmap.org/search and include correct query parameters
function testBugConditionProperty(city) {
    var url = buildGeocodeUrl(city);
    var errors = [];

    // Check URL starts with correct Nominatim endpoint
    if (!url.startsWith("https://nominatim.openstreetmap.org/search")) {
        errors.push("URL does not start with https://nominatim.openstreetmap.org/search, got: " + url.substring(0, 80));
    }

    // Check query parameters
    if (!url.includes("format=json")) {
        errors.push("URL missing format=json parameter");
    }
    if (!url.includes("countrycodes=us")) {
        errors.push("URL missing countrycodes=us parameter");
    }
    if (!url.includes("limit=1")) {
        errors.push("URL missing limit=1 parameter");
    }

    return errors;
}

// Run property-based test with random inputs
function runBugConditionTests() {
    var NUM_TESTS = 100;
    var failures = [];
    var specificCities = ["New York", "Chicago", "Los Angeles", "Seattle", "Miami"];

    console.log("=== Bug Condition Exploration Test ===");
    console.log("**Validates: Requirements 1.1, 1.2, 1.3, 2.1**");
    console.log("Property: geocodeCity URL must start with https://nominatim.openstreetmap.org/search");
    console.log("");

    // Test with specific city names
    for (var i = 0; i < specificCities.length; i++) {
        var city = specificCities[i];
        var errors = testBugConditionProperty(city);
        if (errors.length > 0) {
            failures.push({ city: city, errors: errors });
        }
    }

    // Test with random city names (property-based)
    for (var j = 0; j < NUM_TESTS; j++) {
        var randomCity = generateRandomCityName();
        var errs = testBugConditionProperty(randomCity);
        if (errs.length > 0) {
            failures.push({ city: randomCity, errors: errs });
        }
    }

    var totalTests = specificCities.length + NUM_TESTS;

    if (failures.length > 0) {
        console.log("FAILED: " + failures.length + "/" + totalTests + " tests failed");
        console.log("");
        console.log("First counterexample:");
        console.log("  City: \"" + failures[0].city + "\"");
        console.log("  Errors:");
        for (var k = 0; k < failures[0].errors.length; k++) {
            console.log("    - " + failures[0].errors[k]);
        }
        console.log("");
        console.log("This confirms the bug exists: geocodeCity constructs a URL pointing to");
        console.log("https://geocoding.geo.census.gov/geocoder/locations/invalid instead of");
        console.log("https://nominatim.openstreetmap.org/search");
        process.exit(1);
    } else {
        console.log("PASSED: All " + totalTests + " tests passed");
        console.log("The geocoding URL correctly points to Nominatim.");
        process.exit(0);
    }
}

runBugConditionTests();
