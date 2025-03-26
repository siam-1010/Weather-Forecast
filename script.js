document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("searchBtn").addEventListener("click", fetchWeather);
});

async function fetchWeather() {
    const location = document.getElementById("location").value.trim();
    const errorMessage = document.getElementById("errorMessage");
    const forecastDiv = document.getElementById("forecast");

    if (!location) {
        errorMessage.textContent = "Please enter a city name.";
        forecastDiv.innerHTML = "";
        return;
    }

    errorMessage.textContent = "";
    forecastDiv.innerHTML = "Loading...";

    try {
        // Fetch geolocation
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Location not found.");
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Fetch weather data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto&forecast_days=5`);
        const weatherData = await weatherRes.json();

        if (!weatherData.daily) {
            throw new Error("Weather data not available.");
        }

        displayWeather(name, country, weatherData.daily);
    } catch (error) {
        errorMessage.textContent = error.message;
        forecastDiv.innerHTML = "";
    }
}

function displayWeather(city, country, dailyData) {
    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = `<h2>${city}, ${country}</h2>`;

    dailyData.time.forEach((date, index) => {
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <div>${new Date(date).toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div class="weather-icon">${getWeatherIcon(dailyData.weathercode[index])}</div>
                <div class="temp">↑${Math.round(dailyData.temperature_2m_max[index])}° ↓${Math.round(dailyData.temperature_2m_min[index])}°</div>
                <div>💧 ${dailyData.precipitation_probability_max[index]}%</div>
            </div>
        `;
    });
}

function getWeatherIcon(code) {
    const icons = {
        0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
        51: "🌧️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌦️",
        71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️", 80: "🌧️", 81: "🌧️",
        82: "🌧️", 85: "❄️", 86: "❄️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
    };
    return icons[code] || "❓";
}
