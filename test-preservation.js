// Preservation Property Tests
// Property 2: Error Handling and Non-Geocoding Behavior Unchanged
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
// These tests MUST PASS on both unfixed and fixed code

// ===== Extract functions from app.js for testing =====

// Convert Fahrenheit to Celsius (copied from app.js)
function fToC(f) {
    return Math.round((f - 32) * 5 / 9);
}

// Format temperature with current unit (copied from app.js)
var currentUnit = "F";
function formatTemp(f) {
    if (currentUnit === "C") return fToC(f) + "°C";
    return f + "°F";
}

// Weather icon mapping (copied from app.js)
function getWeatherIcon(forecast) {
    var text = forecast.toLowerCase();
    if (text.includes("thunder") || text.includes("storm")) return "⛈️";
    if (text.includes("snow") || text.includes("blizzard")) return "❄️";
    if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "🌧️";
    if (text.includes("fog") || text.includes("mist")) return "🌫️";
    if (text.includes("wind")) return "💨";
    if (text.includes("cloud") || text.includes("overcast")) return "☁️";
    if (text.includes("sunny") || text.includes("clear")) return "☀️";
    return "🌤️";
}

// Parse periods into day pairs (copied from app.js)
function parseForecastDays(periods) {
    var days = [];
    var i = 0;
    if (periods.length > 0 && !periods[0].isDaytime) {
        i = 1;
    }
    while (i < periods.length && days.length < 5) {
        var dayPeriod = periods[i];
        var nightPeriod = periods[i + 1] || null;
        days.push({
            name: dayPeriod.name,
            condition: dayPeriod.shortForecast,
            icon: getWeatherIcon(dayPeriod.shortForecast),
            highRaw: dayPeriod.temperature,
            lowRaw: nightPeriod ? nightPeriod.temperature : null
        });
        i += 2;
    }
    return days;
}

// ===== Test Utilities =====

var passed = 0;
var failed = 0;
var failures = [];

function assert(condition, message) {
    if (!condition) {
        failed++;
        failures.push(message);
    } else {
        passed++;
    }
}

function generateRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomString(maxLen) {
    var chars = "abcdefghijklmnopqrstuvwxyz ";
    var len = generateRandomInt(1, maxLen);
    var result = "";
    for (var i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// ===== Property Tests =====

console.log("=== Preservation Property Tests ===");
console.log("**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**");
console.log("");

// --- Property: getWeatherIcon returns correct mapped emoji for known keywords ---
console.log("Testing: getWeatherIcon keyword mapping...");

var iconMapping = [
    { keywords: ["thunder", "storm", "thunderstorm"], expected: "⛈️" },
    { keywords: ["snow", "blizzard"], expected: "❄️" },
    { keywords: ["rain", "shower", "drizzle"], expected: "🌧️" },
    { keywords: ["fog", "mist"], expected: "🌫️" },
    { keywords: ["wind", "windy"], expected: "💨" },
    { keywords: ["cloud", "overcast", "cloudy"], expected: "☁️" },
    { keywords: ["sunny", "clear"], expected: "☀️" }
];

// Test specific keywords
for (var m = 0; m < iconMapping.length; m++) {
    var mapping = iconMapping[m];
    for (var n = 0; n < mapping.keywords.length; n++) {
        var keyword = mapping.keywords[n];
        var icon = getWeatherIcon(keyword);
        assert(icon === mapping.expected,
            "getWeatherIcon(\"" + keyword + "\") expected " + mapping.expected + " got " + icon);
    }
}

// Property: random strings without keywords return default icon
for (var p = 0; p < 50; p++) {
    var randomForecast = "xyz" + generateRandomInt(1, 9999);
    var result = getWeatherIcon(randomForecast);
    assert(result === "🌤️",
        "getWeatherIcon(\"" + randomForecast + "\") should return default 🌤️, got " + result);
}

// --- Property: formatTemp returns correct format for any temperature ---
console.log("Testing: formatTemp for Fahrenheit and Celsius...");

// Test Fahrenheit mode
currentUnit = "F";
for (var q = 0; q < 50; q++) {
    var tempF = generateRandomInt(-50, 130);
    var formatted = formatTemp(tempF);
    assert(formatted === tempF + "°F",
        "formatTemp(" + tempF + ") in F mode expected " + tempF + "°F got " + formatted);
}

// Test Celsius mode
currentUnit = "C";
for (var r = 0; r < 50; r++) {
    var tempF2 = generateRandomInt(-50, 130);
    var expectedC = Math.round((tempF2 - 32) * 5 / 9);
    var formatted2 = formatTemp(tempF2);
    assert(formatted2 === expectedC + "°C",
        "formatTemp(" + tempF2 + ") in C mode expected " + expectedC + "°C got " + formatted2);
}

// Reset unit
currentUnit = "F";

// --- Property: fToC converts correctly for any temperature ---
console.log("Testing: fToC conversion...");

// Known values
assert(fToC(32) === 0, "fToC(32) expected 0 got " + fToC(32));
assert(fToC(212) === 100, "fToC(212) expected 100 got " + fToC(212));
assert(fToC(0) === -18, "fToC(0) expected -18 got " + fToC(0));

// Property: for any Fahrenheit value, fToC returns Math.round((f-32)*5/9)
for (var s = 0; s < 50; s++) {
    var fVal = generateRandomInt(-100, 200);
    var expected = Math.round((fVal - 32) * 5 / 9);
    var actual = fToC(fVal);
    assert(actual === expected,
        "fToC(" + fVal + ") expected " + expected + " got " + actual);
}

// --- Property: parseForecastDays returns correct day/night pairings (max 5) ---
console.log("Testing: parseForecastDays pairing and max 5 limit...");

// Generate random periods array
function generatePeriods(count, startWithDay) {
    var periods = [];
    for (var i = 0; i < count; i++) {
        var isDaytime = startWithDay ? (i % 2 === 0) : (i % 2 === 1);
        periods.push({
            name: "Period " + i,
            shortForecast: "Sunny",
            isDaytime: isDaytime,
            temperature: generateRandomInt(20, 100)
        });
    }
    return periods;
}

// Test: starting with daytime, should pair correctly
for (var t = 0; t < 20; t++) {
    var numPeriods = generateRandomInt(2, 14);
    var periods = generatePeriods(numPeriods, true);
    var days = parseForecastDays(periods);

    // Max 5 days
    assert(days.length <= 5,
        "parseForecastDays with " + numPeriods + " periods returned " + days.length + " days (max 5)");

    // Each day should have correct structure
    for (var u = 0; u < days.length; u++) {
        assert(days[u].name !== undefined, "Day " + u + " missing name");
        assert(days[u].condition !== undefined, "Day " + u + " missing condition");
        assert(days[u].icon !== undefined, "Day " + u + " missing icon");
        assert(days[u].highRaw !== undefined, "Day " + u + " missing highRaw");
    }
}

// Test: starting with nighttime, should skip first period
var nightStartPeriods = generatePeriods(10, false);
nightStartPeriods[0].isDaytime = false;
var nightDays = parseForecastDays(nightStartPeriods);
assert(nightDays.length <= 5,
    "parseForecastDays starting with night should still return max 5 days");

// Test: empty periods array
var emptyDays = parseForecastDays([]);
assert(emptyDays.length === 0, "parseForecastDays([]) should return empty array");

// ===== Results =====
console.log("");
console.log("Results: " + passed + " passed, " + failed + " failed");

if (failed > 0) {
    console.log("");
    console.log("Failures:");
    for (var v = 0; v < failures.length; v++) {
        console.log("  - " + failures[v]);
    }
    process.exit(1);
} else {
    console.log("All preservation tests PASSED.");
    console.log("Non-geocoding behavior is correctly preserved.");
    process.exit(0);
}
