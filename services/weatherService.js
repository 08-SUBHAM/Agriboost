const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHERMAP_API_KEY;
        this.apiUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getWeather(lat, lon) {
        try {
            const response = await axios.get(`${this.apiUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    }

    async getForecast(lat, lon) {
        try {
            const response = await axios.get(`${this.apiUrl}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return response.data.list.map(item => ({
                date: new Date(item.dt * 1000),
                temperature: item.main.temp,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }));
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }
}

module.exports = new WeatherService(); 