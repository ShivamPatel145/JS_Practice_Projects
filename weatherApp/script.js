// Wait for page to load
document.addEventListener("DOMContentLoaded", () => {

    // Get elements from HTML
    const cityInput = document.getElementById("city-input");
    const getWeatherBtn = document.getElementById("get-weather-btn");
    const weatherInfo = document.getElementById("weather-info");
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const description = document.getElementById("description");
    const errorMessage = document.getElementById("error-message");

    // Your weather API key
    const API_KEY = "your_api_key_here";
    
    // When button is clicked
    getWeatherBtn.addEventListener("click", getWeather);
    
    // Also allow Enter key to search
    cityInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            getWeather();
        }
    });
    
    // Main function to get weather
    async function getWeather() {
        const city = cityInput.value.trim();
        
        // Check if city name is entered
        if (city === "") {
            alert("Please enter a city name");
            return;
        }
        
        try {
            // Get weather data
            const weatherData = await fetchWeatherData(city);
            showWeatherData(weatherData);
        } catch (error) {
            showError();
        }
    }
    
    // Fetch data from weather API
    async function fetchWeatherData(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("City not found");
        }
        
        const data = await response.json();
        return data;
    }
    
    // Show weather information
    function showWeatherData(data) {
        // Get data from API response
        const cityNameText = data.name;
        const temp = Math.round(data.main.temp);
        const weatherDescription = data.weather[0].description;
        
        // Update HTML elements
        cityName.textContent = cityNameText;
        temperature.textContent = `Temperature: ${temp}°C`;
        description.textContent = `Weather: ${weatherDescription}`;
        
        // Show weather info, hide error
        weatherInfo.classList.remove("hidden");
        errorMessage.classList.add("hidden");
    }
    
    // Show error message
    function showError() {
        // Hide weather info, show error
        weatherInfo.classList.add("hidden");
        errorMessage.classList.remove("hidden");
    }
});