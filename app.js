// Weather icon mapping based on NWS shortForecast keywords
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

// Geocode city using Nominatim
async function geocodeCity(city) {
    var url = "https://nominatim.openstreetmap.org/search?q=" +
        encodeURIComponent(city) + "&format=json&countrycodes=us&limit=1";
    var response = await fetch(url);
    if (!response.ok) throw new Error("Geocoding request failed");
    var data = await response.json();
    if (!data || data.length === 0) return null;
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name };
}

// Get forecast from National Weather Service
async function getForecast(lat, lon) {
    var pointsUrl = "https://api.weather.gov/points/" + lat + "," + lon;
    var pointsResponse = await fetch(pointsUrl, {
        headers: { "User-Agent": "WeatherApp (student@example.com)" }
    });
    if (!pointsResponse.ok) throw new Error("NWS points request failed");
    var pointsData = await pointsResponse.json();

    var forecastUrl = pointsData.properties.forecast;
    var forecastResponse = await fetch(forecastUrl, {
        headers: { "User-Agent": "WeatherApp (student@example.com)" }
    });
    if (!forecastResponse.ok) throw new Error("NWS forecast request failed");
    var forecastData = await forecastResponse.json();
    return forecastData.properties.periods;
}

// Parse periods into day pairs (day + night) for 5 days
function parseForecastDays(periods) {
    var days = [];
    var i = 0;

    // If first period is a night, skip it so we start with a full day
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
            high: dayPeriod.temperature + "°" + dayPeriod.temperatureUnit,
            low: nightPeriod ? nightPeriod.temperature + "°" + nightPeriod.temperatureUnit : "—"
        });
        i += 2;
    }
    return days;
}

// Show error message
function showError(msg) {
    var errorEl = document.getElementById("error-msg");
    errorEl.textContent = msg;
    errorEl.style.display = "block";
    document.getElementById("forecast-container").style.display = "none";
}

// Hide error message
function hideError() {
    document.getElementById("error-msg").style.display = "none";
}

// Render forecast table
function renderForecast(days, locationName) {
    var tbody = document.getElementById("forecast-body");
    tbody.innerHTML = "";

    days.forEach(function(day) {
        var row = document.createElement("tr");
        row.innerHTML =
            "<td>" + day.name + "</td>" +
            '<td class="icon-cell">' + day.icon + "</td>" +
            "<td>" + day.condition + "</td>" +
            "<td>" + day.high + "</td>" +
            "<td>" + day.low + "</td>";
        tbody.appendChild(row);
    });

    // Show location and table
    var shortName = locationName.split(",").slice(0, 2).join(",");
    document.getElementById("location-name").textContent = "Forecast for " + shortName;
    document.getElementById("forecast-container").style.display = "block";
}

// Main handler
async function handleSearch() {
    var city = document.getElementById("city-input").value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    var btn = document.getElementById("search-btn");
    btn.disabled = true;
    btn.textContent = "Loading...";
    hideError();

    try {
        var location = await geocodeCity(city);
        if (!location) {
            showError("City not found or not in the US. Please try another city.");
            return;
        }

        var periods = await getForecast(location.lat, location.lon);
        var days = parseForecastDays(periods);
        renderForecast(days, location.name);
    } catch (err) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            showError("Network error. Check your connection and try again.");
        } else {
            showError("Unable to fetch weather data. Please try again.");
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "Get Forecast";
    }
}

// Wire up events
document.getElementById("search-btn").addEventListener("click", handleSearch);
document.getElementById("city-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") handleSearch();
});
