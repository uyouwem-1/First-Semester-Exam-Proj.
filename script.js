/**
 * Global Variables
 */
let currentUnit = "C"; // Tracking active UI Unit metric system flag ('C' or 'F')
let currentWeatherData = null; // Store cached weather data to toggle units fluidly

// DOM Element Registry Selector Objects
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const loadingState = document.getElementById("loading-state");
const errorMessage = document.getElementById("error-message");
const weatherContent = document.getElementById("weather-content");
const cityNameEl = document.getElementById("city-name");
const currentTempEl = document.getElementById("current-temp");
const weatherDescEl = document.getElementById("weather-description");
const statHumidityEl = document.getElementById("stat-humidity");
const statWindEl = document.getElementById("stat-wind");
const statUvEl = document.getElementById("stat-uv");
const forecastContainer = document.getElementById("forecast-container");
const unitToggleBtn = document.getElementById("unit-toggle");
const recentSearchesContainer = document.getElementById("recent-searches");
const heroIconContainer = document.getElementById("hero-icon-container");

/**
 * Attaching UI event listeners
 */
document.addEventListener("DOMContentLoaded", () => {
  renderRecentSearches();
  // Load a default city's weather data when the app starts up.
  getCoordinatesAndWeather("Abuja");
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    getCoordinatesAndWeather(query);
  }
});

unitToggleBtn.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  unitToggleBtn.textContent = currentUnit === "C" ? "/ °F" : "/ °C";
  if (currentWeatherData) {
    updateWeatherDOM(currentWeatherData);
  }
});

/**
 * change World Meteorological Organization (WMO) weather codes to human text descriptions
 * @param {number} code - The code returned by the weather API
 * @returns {string} Text descriptions mapping cleanly to weather realities
 */
function mapWmoCodeToDescription(code) {
  if (code === 0) return "Clear Sky";
  if (code >= 1 && code <= 3) return "Mainly Clear / Partly Cloudy";
  if (code === 45 || code === 48) return "Foggy Conditions";
  if (code >= 51 && code <= 55) return "Drizzle Rain";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 71 && code <= 75) return "Snow Fall";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm Activity";
  return "Unspecified Weather";
}

/**
 * Generates raw animated SVG vector illustrations dynamically based on structural system weather states
 * @param {number} code - WMO Operational code assignment metric
 * @returns {string} Raw inline SVG system elements with custom targeted structural animations
 */
function getWeatherAnimatedIcon(code) {
  // Clear Sky State (Animated Spinning Sun element)
  if (code === 0) {
    return `
      <svg viewBox="0 0 100 100">
        <circle class="anim-sun" cx="50" cy="50" r="22" fill="#FFD43B" stroke="#F1A80A" stroke-width="2"/>
        <g class="anim-sun" stroke="#FFD43B" stroke-width="6" stroke-linecap="round">
          <line x1="50" y1="12" x2="50" y2="2"/>
          <line x1="50" y1="88" x2="50" y2="98"/>
          <line x1="12" y1="50" x2="2" y2="50"/>
          <line x1="88" y1="50" x2="98" y2="50"/>
        </g>
      </svg>`;
  }
  // Rain / Rain Showers / Thunderstorm States (Animated Bouncing Drop Vectors)
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82) || code >= 95) {
    return `
      <svg viewBox="0 0 100 100">
        <path class="anim-cloud" d="M25,60 C20,60 15,55 15,48 C15,42 20,38 26,38 C29,28 38,22 48,22 C58,22 67,29 69,38 C75,39 80,44 80,50 C80,56 75,60 70,60 Z" fill="#E2E8F0"/>
        <g stroke="#0284C7" stroke-width="4" stroke-linecap="round" class="anim-rain">
          <line x1="35" y1="68" x2="31" y2="76"/>
          <line x1="50" y1="70" x2="46" y2="78"/>
          <line x1="65" y1="68" x2="61" y2="76"/>
        </g>
      </svg>`;
  }
  // Default Cloudy/Overcast State fallback template profile (Floating Cloud Animation)
  return `
    <svg viewBox="0 0 100 100">
      <path class="anim-cloud" d="M25,55 C20,55 15,50 15,43 C15,37 20,33 26,33 C29,23 38,18 48,18 C58,18 67,25 69,33 C75,34 80,39 80,45 C80,51 75,55 70,55 Z" fill="#ECEFF1"/>
      <path class="anim-cloud" d="M40,65 C35,65 30,60 30,54 C30,48 35,44 41,44 C44,34 53,28 63,28 C73,28 82,35 84,44 C90,45 95,50 95,56 C95,62 89,65 84,65 Z" fill="#CFD8DC" style="animation-delay: -2s;"/>
    </svg>`;
}

/**
 * Mathematical functional adapter routine that maps internal base values cleanly between temperature systems
 * @param {number} celsiusValue - Raw core double floating-point notation representation metric
 * @returns {string} String metrics converted and ready to append cleanly to structural rendering profiles
 */
function formatTemperature(celsiusValue) {
  if (currentUnit === "F") {
    const fahrenheit = (celsiusValue * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsiusValue)}°C`;
}

/**
 * The main setup that connects the APIs and handles showing the weather info on the screen.
 * @param {string} cityName - User's target query string parameter
 */
async function getCoordinatesAndWeather(cityName) {
  showLoading(true);
  try {
    const locationData = await fetchCityCoordinates(cityName);
    if (!locationData) {
      showError(true);
      return;
    }
    const weatherData = await fetchWeatherData(
      locationData.latitude,
      locationData.longitude,
    );

    // Merge returned object arrays with structural localization profiles
    currentWeatherData = {
      ...weatherData,
      city: locationData.name,
      country: locationData.country,
    };

    updateWeatherDOM(currentWeatherData);
    saveRecentSearch(locationData.name);
  } catch (err) {
    console.error("Pipeline failure execution processing loop details:", err);
    showError(true);
  }
}

/**
 * To Resolves human text strings into accurate floating point lat/long coordinate locations via geocoding service
 * @param {string} city - Raw targeting search input parameter
 * @returns {Object|null} Location configuration context elements object
 */
async function fetchCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      "Geocoding connection interface failure returned down inside network loop.",
    );

  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country_code || data.results[0].country || "",
  };
}

/**
 * To Directly interface API datasets using resolved coordinate location telemetry profiles
 * @param {number} lat - Target coordinate system latitude configuration metric
 * @param {number} lon - Target coordinate system longitude configuration metric
 * @returns {Object} Extracted custom state data payload models
 */
async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      "Weather core system endpoint context integration mismatch or communication fail.",
    );
  return await response.json();
}

/**
 * how to render operation component that updates the HTML template using structural dataset collections
 * @param {Object} data - Weather data key-value mappings
 */
function updateWeatherDOM(data) {
  showError(false);
  showLoading(false);

  // Analyze and update the header section components.
  cityNameEl.textContent = `${data.city}, ${data.country.toUpperCase()}`;
  currentTempEl.textContent = formatTemperature(data.current.temperature_2m);
  weatherDescEl.textContent = mapWmoCodeToDescription(
    data.current.weather_code,
  );

  // Refresh the animated weather icons inside the main display section.
  heroIconContainer.innerHTML = getWeatherAnimatedIcon(
    data.current.weather_code,
  );

  // Fill the secondary weather metrics with the latest data values.
  statHumidityEl.textContent = `${data.current.relative_humidity_2m}%`;
  statWindEl.textContent = `${data.current.wind_speed_10m} km/h`;
  statUvEl.textContent = data.daily.uv_index_max[0]
    ? data.daily.uv_index_max[0].toFixed(1)
    : "N/A";

  // Reset the forecast DOM elements before rendering the updated forecast list.
  forecastContainer.innerHTML = "";

  // Enumerate dynamic daily forecasts for upcoming processing intervals (skipping current index item 0 if required, but showing standard 5 days)
  for (let i = 0; i < 5; i++) {
    const timeValue = data.daily.time[i];
    const wmoCode = data.daily.weather_code[i];
    const maxTemp = data.daily.temperature_2m_max[i];
    const minTemp = data.daily.temperature_2m_min[i];

    // Compute localized Weekday human name parameters
    const dateInstance = new Date(timeValue + "T00:00:00");
    const dayLabel = dateInstance.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const rowHtml = `
      <div class="forecast-row">
        <span class="forecast-day">${dayLabel}</span>
        <span class="forecast-icon" title="${mapWmoCodeToDescription(wmoCode)}">
          ${getWeatherAnimatedIcon(wmoCode)}
        </span>
        <div class="forecast-temps">
          <span class="forecast-high">${formatTemperature(maxTemp)}</span>
          <span class="forecast-low">${formatTemperature(minTemp)}</span>
        </div>
      </div>
    `;
    forecastContainer.insertAdjacentHTML("beforeend", rowHtml);
  }

  weatherContent.classList.remove("hidden");
}

/**
 * Saves the last few searches right on the user's computer or phone.
 * @param {string} city - Checks the search term against existing records to prevent duplicate entries in the cache.
 */
function saveRecentSearch(city) {
  let searches =
    JSON.parse(localStorage.getItem("recentWeatherSearches")) || [];

  // Remove duplicate entries if someone updates an already registered query item profile
  searches = searches.filter(
    (item) => item.toLowerCase() !== city.toLowerCase(),
  );
  searches.unshift(city); // Add new entries to the top so the latest search always shows up first.

  if (searches.length > 5) searches.pop(); // Cap history to a maximum length of 5 items

  localStorage.setItem("recentWeatherSearches", JSON.stringify(searches));
  renderRecentSearches();
}

/**
 * To Automatically retrieves search history from local storage to generate clickable, mobile-friendly quick-access buttons.
 */
function renderRecentSearches() {
  const searches =
    JSON.parse(localStorage.getItem("recentWeatherSearches")) || [];
  recentSearchesContainer.innerHTML = "";

  searches.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "recent-btn";
    btn.textContent = city;
    btn.addEventListener("click", () => getCoordinatesAndWeather(city));
    recentSearchesContainer.appendChild(btn);
  });
}

/**
 * Functions to handle UI visibility states for loading and error indicators.
 * @param {boolean} isLoading - UI loading status flags
 */
function showLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove("hidden");
    weatherContent.classList.add("hidden");
    errorMessage.classList.add("hidden");
  } else {
    loadingState.classList.add("hidden");
  }
}

/**
 * Displays or hides the application error message based on the fetch outcome.
 * @param {boolean} isError - Data validation status flags
 */
function showError(isError) {
  if (isError) {
    errorMessage.classList.remove("hidden");
    weatherContent.classList.add("hidden");
    loadingState.classList.add("hidden");
  } else {
    errorMessage.classList.add("hidden");
  }
}
