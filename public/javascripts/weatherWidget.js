class AgriWeatherWidget {
  constructor() {
    // Unique configuration for widget only
    this.config = {
      apiKey: 'ce5102271f5d2cc57840d7142542ea69',
      units: 'metric',
      lang: 'en'
    };
    
    // Unique element IDs for widget only
    this.ids = {
      container: 'agri-weather-widget',
      location: 'agri-weather-location',
      temp: 'agri-weather-temp',
      desc: 'agri-weather-desc',
      icon: 'agri-weather-icon',
      feelsLike: 'agri-feels-like',
      humidity: 'agri-humidity',
      wind: 'agri-wind',
      forecast: 'agri-weather-forecast'
    };
    
    // Icon mapping
    this.iconMap = {
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
  }

  init() {
    if (!navigator.geolocation) {
      this.showError("Geolocation not supported");
      return;
    }
    this.getLocation();
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error("Location error:", error);
        this.showError("Location access denied");
        // Fallback to default location if needed
        // this.fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      }
    );
  }

  async fetchWeather(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.config.apiKey}&units=${this.config.units}&lang=${this.config.lang}`
      );
      
      if (!response.ok) throw new Error('Weather request failed');
      
      const data = await response.json();
      this.updateDisplay(data);
      this.fetchForecast(lat, lon);
      
    } catch (error) {
      console.error("Fetch error:", error);
      this.showError("Weather data unavailable");
    }
  }

  async fetchForecast(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.config.apiKey}&units=${this.config.units}&lang=${this.config.lang}`
      );
      
      if (!response.ok) throw new Error('Forecast request failed');
      
      const data = await response.json();
      this.updateForecast(data);
      
    } catch (error) {
      console.error("Forecast error:", error);
    }
  }

  updateDisplay(data) {
    // Update current weather
    this.setText(this.ids.location, `${data.name}, ${data.sys.country || ''}`);
    this.setText(this.ids.temp, `${Math.round(data.main.temp)}°C`);
    this.setText(this.ids.desc, this.capitalize(data.weather[0].description));
    this.setText(this.ids.feelsLike, `Feels like: ${Math.round(data.main.feels_like)}°`);
    this.setText(this.ids.humidity, `Humidity: ${data.main.humidity}%`);
    this.setText(this.ids.wind, `Wind: ${data.wind.speed} m/s`);
    
    // Update icon
    const iconElement = document.getElementById(this.ids.icon);
    if (iconElement) {
      iconElement.className = `fas ${this.iconMap[data.weather[0].icon] || 'fa-cloud'} text-3xl`;
    }
  }

  updateForecast(data) {
    const container = document.getElementById(this.ids.forecast);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show next 8 periods (24 hours)
    data.list.slice(0, 8).forEach(item => {
      const time = new Date(item.dt * 1000);
      const hour = time.getHours();
      const displayHour = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      
      const div = document.createElement('div');
      div.className = 'text-center p-1';
      div.innerHTML = `
        <div class="text-xs">${displayHour}${ampm}</div>
        <i class="fas ${this.iconMap[item.weather[0].icon] || 'fa-cloud'} text-lg my-1"></i>
        <div class="text-sm font-medium">${Math.round(item.main.temp)}°</div>
      `;
      container.appendChild(div);
    });
  }

  showError(message) {
    const container = document.getElementById(this.ids.container);
    if (container) {
      container.innerHTML = `
        <div class="text-center p-4">
          <p class="text-white/80 mb-3">${message}</p>
          <button onclick="window.agriWeatherWidget.init()" 
                  class="px-4 py-2 bg-white/20 rounded text-white hover:bg-white/30">
            <i class="fas fa-sync-alt mr-2"></i> Try Again
          </button>
        </div>
      `;
    }
  }

  // Helper methods
  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.agriWeatherWidget = new AgriWeatherWidget();
  window.agriWeatherWidget.init();
});