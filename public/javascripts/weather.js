// Common Weather Module
const WeatherApp = (function() {
    // Configuration
    const config = {
        apiKey: 'ce5102271f5d2cc57840d7142542ea69',
        units: 'metric',
        lang: 'en'
    };

    // Weather icon mapping for Font Awesome
    const iconMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud-meatball',
        '04n': 'fa-cloud-meatball',
        '09d': 'fa-cloud-rain',
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };

    // Wind direction mapping
    const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    // Initialize the weather app
    function init() {
        if (!navigator.geolocation) {
            showError("Geolocation is not supported by your browser");
            return;
        }

        // Set up refresh button
        document.getElementById('refresh-weather')?.addEventListener('click', refreshWeather);
        
        getLocation();
    }

    // Get user's location
    function getLocation() {
        updateStatus("Detecting your location...");
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchAllWeatherData(lat, lon);
            },
            error => {
                console.error("Error getting location:", error);
                showError("Unable to retrieve your location. Using default location.");
                // Fallback to default location (London)
                fetchAllWeatherData(51.5074, -0.1278);
            }
        );
    }

    // Fetch all weather data (current + forecasts)
    async function fetchAllWeatherData(lat, lon) {
        try {
            updateStatus("Loading weather data...");
            
            // Fetch current weather
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=${config.units}&lang=${config.lang}`
            );
            
            if (!currentResponse.ok) throw new Error('Current weather request failed');
            const currentData = await currentResponse.json();
            
            // Update current weather
            updateCurrentWeather(currentData);
            
            // Fetch 5-day forecast (3-hour intervals)
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=${config.units}&lang=${config.lang}`
            );
            
            if (!forecastResponse.ok) throw new Error('Forecast request failed');
            const forecastData = await forecastResponse.json();
            
            // Update forecasts
            updateHourlyForecast(forecastData);
            updateDailyForecast(forecastData);
            
            // Generate agricultural advisory
            generateAgriculturalAdvisory(currentData, forecastData);
            
        } catch (error) {
            console.error("Error fetching weather:", error);
            showError("Failed to load weather data. Please try again.");
        }
    }

    // Update current weather display
    function updateCurrentWeather(data) {
        // Update location
        document.getElementById('weather-location').textContent = `${data.name}, ${data.sys.country || ''}`;
        
        // Update date and time
        const now = new Date();
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        
        // Update temperature
        document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°${config.units === 'metric' ? 'C' : 'F'}`;
        
        // Update weather description
        const description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
        document.getElementById('weather-description').textContent = description;
        
        // Update weather details
        document.getElementById('weather-details').textContent = 
            `Feels like: ${Math.round(data.main.feels_like)}° • Humidity: ${data.main.humidity}%`;
        
        // Update wind details
        const windSpeed = config.units === 'metric' ? 
            `${data.wind.speed} km/h` : 
            `${(data.wind.speed * 2.237).toFixed(1)} mph`;
        
        const windDir = getWindDirection(data.wind.deg);
        document.getElementById('wind-details').textContent = `Wind: ${windSpeed} • ${windDir}`;
        
        // Update weather icon
        const iconElement = document.getElementById('current-weather-icon');
        if (iconElement) {
            const iconClass = iconMap[data.weather[0].icon] || 'fa-cloud-sun';
            iconElement.className = `fas ${iconClass} text-[120px]`;
        }
    }

    // Update hourly forecast (next 24 hours)
    function updateHourlyForecast(data) {
        const hourlyContainer = document.getElementById('hourly-forecast');
        if (!hourlyContainer) return;
        
        // Clear existing content
        hourlyContainer.innerHTML = '';
        
        // Get next 24 hours (8 data points at 3-hour intervals)
        const hourlyData = data.list.slice(0, 8);
        
        hourlyData.forEach(item => {
            const time = new Date(item.dt * 1000);
            const hour = time.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            
            const iconClass = iconMap[item.weather[0].icon] || 'fa-cloud';
            
            const forecastElement = document.createElement('div');
            forecastElement.className = 'text-center px-3 py-2 bg-gray-100 rounded-lg mx-1 min-w-[70px]';
            forecastElement.innerHTML = `
                <p class="text-sm">${displayHour}${ampm}</p>
                <i class="fas ${iconClass} text-xl my-2"></i>
                <p class="font-medium">${Math.round(item.main.temp)}°</p>
            `;
            
            hourlyContainer.appendChild(forecastElement);
        });
    }

    // Update daily forecast (7 days)
    function updateDailyForecast(data) {
        const dailyContainer = document.getElementById('daily-forecast');
        if (!dailyContainer) return;
        
        // Clear existing content
        dailyContainer.innerHTML = '';
        
        // Group by day (we'll just take the midday forecast for each day)
        const dailyData = [];
        for (let i = 0; i < data.list.length; i += 8) {
            if (dailyData.length >= 7) break;
            dailyData.push(data.list[i]);
        }
        
        dailyData.forEach((item, index) => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const iconClass = iconMap[item.weather[0].icon] || 'fa-cloud';
            
            const forecastElement = document.createElement('div');
            forecastElement.className = 'flex items-center justify-between p-3 border rounded-lg';
            forecastElement.innerHTML = `
                <p class="w-24">${index === 0 ? 'Today' : dayName}</p>
                <i class="fas ${iconClass} text-xl text-gray-400"></i>
                <div class="w-32">
                    <div class="flex justify-between text-sm">
                        <span>${Math.round(item.main.temp_max)}°</span>
                        <span>${Math.round(item.main.temp_min)}°</span>
                    </div>
                </div>
                <p class="text-sm w-16 text-right">${item.main.humidity}%</p>
            `;
            
            dailyContainer.appendChild(forecastElement);
        });
    }

    // Generate agricultural advisory
    function generateAgriculturalAdvisory(currentData, forecastData) {
        const advisoryContainer = document.getElementById('agri-advisory');
        if (!advisoryContainer) return;
        
        // Simple advisory logic based on weather conditions
        const advisories = [];
        const temp = currentData.main.temp;
        const humidity = currentData.main.humidity;
        const rain = currentData.weather[0].main.toLowerCase().includes('rain');
        const windSpeed = currentData.wind.speed;
        
        // Temperature advisories
        if (temp < 5) {
            advisories.push({
                icon: 'fa-temperature-low',
                color: 'blue-500',
                title: 'Frost Warning',
                message: 'Protect sensitive crops from potential frost damage.'
            });
        } else if (temp > 30) {
            advisories.push({
                icon: 'fa-temperature-high',
                color: 'red-500',
                title: 'Heat Stress Alert',
                message: 'High temperatures may stress plants. Ensure adequate irrigation.'
            });
        }
        
        // Rainfall advisories
        if (rain) {
            advisories.push({
                icon: 'fa-cloud-rain',
                color: 'blue-500',
                title: 'Rain Expected',
                message: 'Delay field work if heavy rain is forecasted. Good for irrigation.'
            });
        } else if (humidity < 40) {
            advisories.push({
                icon: 'fa-sun',
                color: 'yellow-500',
                title: 'Low Humidity',
                message: 'Increased irrigation may be needed to prevent moisture stress.'
            });
        }
        
        // Wind advisories
        if (windSpeed > 15) {
            advisories.push({
                icon: 'fa-wind',
                color: 'gray-500',
                title: 'High Winds',
                message: 'Wind may damage young plants. Consider wind protection measures.'
            });
        }
        
        // Default advisory if no specific conditions
        if (advisories.length === 0) {
            advisories.push({
                icon: 'fa-check-circle',
                color: 'green-500',
                title: 'Favorable Conditions',
                message: 'Current weather conditions are generally good for most crops.'
            });
        }
        
        // Update advisory display
        advisoryContainer.innerHTML = '';
        advisories.forEach(advice => {
            const advisoryElement = document.createElement('div');
            advisoryElement.className = `flex items-start p-4 bg-${advice.color.replace('-500', '-50')} rounded-lg mb-3 border-l-4 border-${advice.color}`;
            advisoryElement.innerHTML = `
                <i class="fas ${advice.icon} text-${advice.color} mr-3 text-xl mt-1"></i>
                <div>
                    <p class="font-medium">${advice.title}</p>
                    <p class="text-sm text-gray-600 mt-1">${advice.message}</p>
                </div>
            `;
            advisoryContainer.appendChild(advisoryElement);
        });
    }

    // Helper function to get wind direction
    function getWindDirection(degrees) {
        if (degrees === undefined) return '';
        const index = Math.round((degrees % 360) / 45);
        return windDirections[index % 8];
    }

    // Update status message
    function updateStatus(message) {
        const locationElement = document.getElementById('weather-location');
        if (locationElement) {
            locationElement.textContent = message;
        }
    }

    // Show error message
    function showError(message) {
        const currentWeatherCard = document.querySelector('.bg-gradient-to-br.from-agri-green.to-agri-dark');
        if (currentWeatherCard) {
            currentWeatherCard.innerHTML = `
                <div class="text-center p-6 text-white">
                    <p class="mb-3">${message}</p>
                    <button onclick="WeatherApp.refresh()" 
                            class="px-4 py-2 bg-white/20 rounded hover:bg-white/30">
                        <i class="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    // Refresh weather data
    function refreshWeather() {
        getLocation();
    }

    // Public API
    return {
        init: init,
        refresh: refreshWeather
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    WeatherApp.init();
});

document.addEventListener('DOMContentLoaded', function() {
    WeatherApp.init(); // Main weather
    WeatherApp.init('#weather-widget'); // Widget
  });