const axios = require("axios");
const config = require("../config");
const Logger = require("../utils/logger");

/**
 * Weather Service untuk mengintegrasikan Open Meteo API
 * Mendapatkan data cuaca laut, gelombang, dan kondisi maritim
 */
class WeatherService {
  constructor() {
    this.baseUrl = config.openMeteo.baseUrl;
    this.marineUrl = config.openMeteo.marineUrl;
    this.cache = new Map();
    this.cacheTimeout = config.cache.ttlSeconds * 1000; // Convert to milliseconds
  }

  /**
   * Generate cache key berdasarkan parameter
   */
  _generateCacheKey(params) {
    return JSON.stringify(params);
  }

  /**
   * Check apakah data di cache masih valid
   */
  _isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
  }

  /**
   * Get data dari cache jika masih valid
   */
  _getFromCache(key) {
    const cacheEntry = this.cache.get(key);
    if (cacheEntry && this._isCacheValid(cacheEntry)) {
      Logger.debug("Weather data retrieved from cache", { key });
      return cacheEntry.data;
    }
    return null;
  }

  /**
   * Simpan data ke cache
   */
  _saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    Logger.debug("Weather data saved to cache", { key });
  }

  /**
   * Mendapatkan data cuaca maritim dari Open Meteo
   * @param {number} latitude - Latitude koordinat
   * @param {number} longitude - Longitude koordinat
   * @param {Object} options - Opsi tambahan
   * @returns {Promise<Object>} Data cuaca maritim
   */
  async getMarineWeather(latitude, longitude, options = {}) {
    try {
      const params = {
        latitude,
        longitude,
        hourly: [
          "wave_height",
          "wave_direction",
          "wave_period",
          "wind_wave_height",
          "wind_wave_direction",
          "wind_wave_period",
          "swell_wave_height",
          "swell_wave_direction",
          "swell_wave_period",
        ].join(","),
        daily: [
          "wave_height_max",
          "wave_direction_dominant",
          "wave_period_max",
          "wind_wave_height_max",
          "wind_wave_direction_dominant",
          "wind_wave_period_max",
        ].join(","),
        timezone: options.timezone || "Asia/Jakarta",
        forecast_days: options.forecastDays || 7,
        ...options.additionalParams,
      };

      // Check cache first
      const cacheKey = this._generateCacheKey({ type: "marine", ...params });
      const cachedData = this._getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      Logger.info("Fetching marine weather data from Open Meteo", {
        latitude,
        longitude,
      });

      const response = await axios.get(this.marineUrl, {
        params,
        timeout: 10000, // 10 seconds timeout
      });

      const weatherData = {
        location: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
        },
        current_time: new Date().toISOString(),
        hourly: response.data.hourly,
        daily: response.data.daily,
        units: {
          wave_height: "m",
          wave_direction: "°",
          wave_period: "s",
        },
      };

      // Save to cache
      this._saveToCache(cacheKey, weatherData);

      return weatherData;
    } catch (error) {
      Logger.error("Failed to fetch marine weather data:", error);
      throw new Error(`Gagal mengambil data cuaca laut: ${error.message}`);
    }
  }

  /**
   * Mendapatkan data cuaca umum (angin, suhu, dll)
   * @param {number} latitude - Latitude koordinat
   * @param {number} longitude - Longitude koordinat
   * @param {Object} options - Opsi tambahan
   * @returns {Promise<Object>} Data cuaca umum
   */
  async getCurrentWeather(latitude, longitude, options = {}) {
    try {
      const params = {
        latitude,
        longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "rain",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "surface_pressure",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
        ].join(","),
        hourly: [
          "temperature_2m",
          "relative_humidity_2m",
          "precipitation_probability",
          "precipitation",
          "rain",
          "weather_code",
          "pressure_msl",
          "cloud_cover",
          "visibility",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
        ].join(","),
        timezone: options.timezone || "Asia/Jakarta",
        forecast_days: options.forecastDays || 3,
        ...options.additionalParams,
      };

      // Check cache first
      const cacheKey = this._generateCacheKey({ type: "current", ...params });
      const cachedData = this._getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      Logger.info("Fetching current weather data from Open Meteo", {
        latitude,
        longitude,
      });

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params,
        timeout: 10000,
      });

      const weatherData = {
        location: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          elevation: response.data.elevation,
        },
        current: response.data.current,
        current_time: new Date().toISOString(),
        hourly: response.data.hourly,
        units: response.data.current_units,
      };

      // Save to cache
      this._saveToCache(cacheKey, weatherData);

      return weatherData;
    } catch (error) {
      Logger.error("Failed to fetch current weather data:", error);
      throw new Error(`Gagal mengambil data cuaca: ${error.message}`);
    }
  }

  /**
   * Mendapatkan data cuaca gabungan (maritim + umum)
   * @param {number} latitude - Latitude koordinat
   * @param {number} longitude - Longitude koordinat
   * @param {Object} options - Opsi tambahan
   * @returns {Promise<Object>} Data cuaca gabungan
   */
  async getCompleteWeather(latitude, longitude, options = {}) {
    try {
      Logger.info("Fetching complete weather data", { latitude, longitude });

      const [marineData, currentData] = await Promise.all([
        this.getMarineWeather(latitude, longitude, options),
        this.getCurrentWeather(latitude, longitude, options),
      ]);

      return {
        location: currentData.location,
        timestamp: new Date().toISOString(),
        marine: marineData,
        weather: currentData,
      };
    } catch (error) {
      Logger.error("Failed to fetch complete weather data:", error);
      throw new Error(`Gagal mengambil data cuaca lengkap: ${error.message}`);
    }
  }

  /**
   * Clear cache (untuk testing atau maintenance)
   */
  clearCache() {
    this.cache.clear();
    Logger.info("Weather service cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
    };
  }
}

module.exports = new WeatherService();
