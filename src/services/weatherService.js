const axios = require("axios");
const config = require("../config");
const Logger = require("../utils/logger");

class WeatherService {
  constructor() {
    this.baseUrl = config.openMeteo.baseUrl;
    this.marineUrl = config.openMeteo.marineUrl;
    this.cache = new Map();
    this.cacheTimeout = config.cache.ttlSeconds * 1000;
  }

  // Mengkonversi singkatan timezone Indonesia ke nama lengkap
  _convertTimezone(timezone) {
    const timezoneMap = {
      WIB: "Asia/Jakarta", // Waktu Indonesia Barat (UTC+7)
      WITA: "Asia/Makassar", // Waktu Indonesia Tengah (UTC+8)
      WIT: "Asia/Jayapura", // Waktu Indonesia Timur (UTC+9)
      wib: "Asia/Jakarta", // Case insensitive
      wita: "Asia/Makassar",
      wit: "Asia/Jayapura",
    };

    return timezoneMap[timezone] || timezone || "Asia/Jakarta";
  }

  // Mendeteksi timezone Indonesia berdasarkan koordinat
  _autoDetectTimezone(_latitude, longitude) {
    const lng = parseFloat(longitude);

    if (lng > 135) {
      return "Asia/Jayapura"; // WIT
    }

    if (lng > 115) {
      return "Asia/Makassar"; // WITA
    }

    return "Asia/Jakarta"; // WIB
  }

  // Mendapatkan timezone yang sesuai (auto-detect jika tidak disediakan)
  _getTimezone(timezone, latitude, longitude) {
    if (timezone) {
      return this._convertTimezone(timezone);
    }

    return this._autoDetectTimezone(latitude, longitude);
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
        timezone: this._getTimezone(options.timezone, latitude, longitude),
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

      // Check if marine data is available (not all null)
      const hasMarineData =
        response.data.hourly &&
        response.data.hourly.wave_height &&
        response.data.hourly.wave_height.some((val) => val !== null);

      if (!hasMarineData) {
        Logger.warn(
          "No marine data available for coordinates, using fallback weather data",
          {
            latitude,
            longitude,
          }
        );

        // Fallback to regular weather API for coastal areas
        return this._getFallbackMarineWeather(latitude, longitude, options);
      }

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
        data_source: "marine",
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
   * Get marine weather forecast for specified hours
   */
  async getMarineForecast(latitude, longitude, hours = 24, options = {}) {
    try {
      Logger.info("Fetching marine forecast", { latitude, longitude, hours });

      const params = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
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
        forecast_days: Math.ceil(hours / 24).toString(), // Convert hours to days
        timezone: this._getTimezone(options.timezone, latitude, longitude),
      };

      const response = await axios.get(this.marineUrl, {
        params,
        timeout: 10000,
      });

      if (response.data && response.data.hourly) {
        const hourlyData = response.data.hourly;
        const forecast = [];

        // Check if marine data is available (not all null)
        const hasMarineData = hourlyData.wave_height.some(
          (val) => val !== null
        );

        if (!hasMarineData) {
          Logger.warn(
            "No marine data available for coordinates, using fallback weather data",
            {
              latitude,
              longitude,
            }
          );

          // Fallback to regular weather API for coastal areas
          return this._getFallbackWeatherForecast(latitude, longitude, hours);
        }

        for (let i = 0; i < Math.min(hours, hourlyData.time.length); i++) {
          forecast.push({
            time: hourlyData.time[i],
            wave_height: hourlyData.wave_height[i],
            wave_direction: hourlyData.wave_direction[i],
            wave_period: hourlyData.wave_period[i],
            wind_wave_height: hourlyData.wind_wave_height[i],
            wind_wave_direction: hourlyData.wind_wave_direction[i],
            wind_wave_period: hourlyData.wind_wave_period[i],
            swell_wave_height: hourlyData.swell_wave_height[i],
            swell_wave_direction: hourlyData.swell_wave_direction[i],
            swell_wave_period: hourlyData.swell_wave_period[i],
          });
        }

        return {
          success: true,
          data: {
            location: { latitude, longitude },
            forecast_hours: hours,
            forecast: forecast,
            retrieved_at: new Date().toISOString(),
          },
        };
      }

      throw new Error("Invalid forecast data structure");
    } catch (error) {
      Logger.error("Failed to get marine forecast:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch marine forecast data",
      };
    }
  }

  /**
   * Get historical weather data for specified days
   */
  async getHistoricalWeather(latitude, longitude, days = 7) {
    try {
      Logger.info("Fetching historical weather", { latitude, longitude, days });

      // Calculate date range (max 92 days, but recommend max 7 for optimal performance)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1); // Yesterday as end date
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - Math.min(days - 1, 91)); // Max 92 days

      const params = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        hourly: [
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "temperature_2m",
          "pressure_msl",
        ].join(","),
        timezone: "Asia/Jakarta",
      };

      // Use Archive API for historical data
      const archiveUrl = "https://archive-api.open-meteo.com/v1/archive";
      const response = await axios.get(archiveUrl, {
        params,
        timeout: 10000,
      });

      if (response.data && response.data.hourly) {
        const hourlyData = response.data.hourly;
        const historical = [];

        for (let i = 0; i < hourlyData.time.length; i++) {
          const windSpeed = hourlyData.wind_speed_10m[i] || 0;
          const estimatedWaveHeight = this._estimateWaveHeight(windSpeed);

          historical.push({
            time: hourlyData.time[i],
            // Estimated wave data from historical wind
            wave_height: estimatedWaveHeight,
            wave_direction: hourlyData.wind_direction_10m[i],
            wave_period: this._estimateWavePeriod(estimatedWaveHeight),
            wind_speed: windSpeed,
            wind_direction: hourlyData.wind_direction_10m[i],
            wind_gusts: hourlyData.wind_gusts_10m?.[i] || null,
            temperature: hourlyData.temperature_2m?.[i] || null,
            pressure: hourlyData.pressure_msl?.[i] || null,
          });
        }

        return {
          success: true,
          data: {
            location: { latitude, longitude },
            period_days: Math.min(days, 92),
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            historical: historical,
            data_source: "archive_weather_estimated",
            retrieved_at: new Date().toISOString(),
          },
        };
      }

      throw new Error("Invalid historical data structure");
    } catch (error) {
      Logger.error("Failed to get historical weather:", error);
      Logger.warn("Historical weather not available, using fallback", {
        latitude,
        longitude,
        error: error.message,
      });

      // Return fallback historical data (simplified)
      return {
        success: true,
        data: {
          location: { latitude, longitude },
          period_days: days,
          historical: [],
          data_source: "historical_not_available",
          retrieved_at: new Date().toISOString(),
          note: "Historical data not available for this location",
        },
      };
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

  /**
   * Fallback weather forecast for coastal areas without marine data
   * Uses regular weather API with estimated wave data
   */
  async _getFallbackWeatherForecast(latitude, longitude, hours) {
    try {
      Logger.info("Using fallback weather forecast for coastal area", {
        latitude,
        longitude,
        hours,
      });

      const params = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: [
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "temperature_2m",
          "pressure_msl",
        ].join(","),
        forecast_days: Math.ceil(hours / 24).toString(),
        timezone: "Asia/Jakarta",
      };

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params,
        timeout: 10000,
      });

      if (response.data && response.data.hourly) {
        const hourlyData = response.data.hourly;
        const forecast = [];

        for (let i = 0; i < Math.min(hours, hourlyData.time.length); i++) {
          // Estimate wave data based on wind conditions
          const windSpeed = hourlyData.wind_speed_10m[i] || 0;
          const estimatedWaveHeight = this._estimateWaveHeight(windSpeed);

          forecast.push({
            time: hourlyData.time[i],
            // Estimated marine data based on wind
            wave_height: estimatedWaveHeight,
            wave_direction: hourlyData.wind_direction_10m[i],
            wave_period: this._estimateWavePeriod(estimatedWaveHeight),
            wind_wave_height: estimatedWaveHeight * 0.7, // Wind waves are typically 70% of total
            wind_wave_direction: hourlyData.wind_direction_10m[i],
            wind_wave_period: this._estimateWavePeriod(
              estimatedWaveHeight * 0.7
            ),
            swell_wave_height: estimatedWaveHeight * 0.3, // Swell is remaining 30%
            swell_wave_direction: hourlyData.wind_direction_10m[i],
            swell_wave_period: this._estimateWavePeriod(
              estimatedWaveHeight * 0.3
            ),
            // Additional weather data
            wind_speed: hourlyData.wind_speed_10m[i],
            wind_direction: hourlyData.wind_direction_10m[i],
            wind_gusts: hourlyData.wind_gusts_10m[i],
            temperature: hourlyData.temperature_2m[i],
            pressure: hourlyData.pressure_msl[i],
          });
        }

        return {
          success: true,
          data: {
            location: { latitude, longitude },
            forecast_hours: hours,
            forecast,
            retrieved_at: new Date().toISOString(),
            data_source: "weather_fallback",
          },
        };
      }

      throw new Error("No weather data available");
    } catch (error) {
      Logger.error("Failed to get fallback weather forecast:", error);
      throw error;
    }
  }

  /**
   * Estimate wave height based on wind speed
   * Using simplified Beaufort scale relationship
   */
  _estimateWaveHeight(windSpeedKmh) {
    const windSpeedMs = windSpeedKmh / 3.6; // Convert km/h to m/s

    if (windSpeedMs < 2) return 0.1; // Calm
    if (windSpeedMs < 4) return 0.2; // Light air
    if (windSpeedMs < 6) return 0.3; // Light breeze
    if (windSpeedMs < 8) return 0.5; // Gentle breeze
    if (windSpeedMs < 11) return 0.8; // Moderate breeze
    if (windSpeedMs < 14) return 1.2; // Fresh breeze
    if (windSpeedMs < 17) return 1.8; // Strong breeze
    if (windSpeedMs < 21) return 2.5; // Near gale
    if (windSpeedMs < 25) return 3.5; // Gale
    return 5.0; // Strong gale+
  }

  /**
   * Estimate wave period based on wave height
   */
  _estimateWavePeriod(waveHeight) {
    // Typical relationship: T ≈ 3.5 * sqrt(H)
    return Math.max(2.0, 3.5 * Math.sqrt(waveHeight));
  }

  /**
   * Aggregate hourly data to daily maximums
   */
  _aggregateHourlyToDaily(hourlyData) {
    const dailyData = {
      time: [],
      wave_height_max: [],
      wave_direction_dominant: [],
      wave_period_max: [],
      wind_wave_height_max: [],
      wind_wave_direction_dominant: [],
      wind_wave_period_max: [],
    };

    // Group hourly data by date
    const dailyGroups = {};
    for (let i = 0; i < hourlyData.time.length; i++) {
      const date = hourlyData.time[i].split("T")[0]; // Get date part only
      if (!dailyGroups[date]) {
        dailyGroups[date] = {
          wave_heights: [],
          wave_directions: [],
          wave_periods: [],
          wind_wave_heights: [],
          wind_wave_directions: [],
          wind_wave_periods: [],
        };
      }

      dailyGroups[date].wave_heights.push(hourlyData.wave_height[i]);
      dailyGroups[date].wave_directions.push(hourlyData.wave_direction[i]);
      dailyGroups[date].wave_periods.push(hourlyData.wave_period[i]);
      dailyGroups[date].wind_wave_heights.push(hourlyData.wind_wave_height[i]);
      dailyGroups[date].wind_wave_directions.push(
        hourlyData.wind_wave_direction[i]
      );
      dailyGroups[date].wind_wave_periods.push(hourlyData.wind_wave_period[i]);
    }

    // Calculate daily maximums
    for (const [date, data] of Object.entries(dailyGroups)) {
      dailyData.time.push(date);
      dailyData.wave_height_max.push(Math.max(...data.wave_heights));
      dailyData.wave_direction_dominant.push(data.wave_directions[0]); // Use first direction as dominant
      dailyData.wave_period_max.push(Math.max(...data.wave_periods));
      dailyData.wind_wave_height_max.push(Math.max(...data.wind_wave_heights));
      dailyData.wind_wave_direction_dominant.push(data.wind_wave_directions[0]);
      dailyData.wind_wave_period_max.push(Math.max(...data.wind_wave_periods));
    }

    return dailyData;
  }

  /**
   * Fallback marine weather for coastal areas without marine data
   * Uses regular weather API with estimated wave data (same format as getMarineWeather)
   */
  async _getFallbackMarineWeather(latitude, longitude, options = {}) {
    try {
      Logger.info("Using fallback marine weather for coastal area", {
        latitude,
        longitude,
      });

      const params = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: [
          "wind_speed_10m",
          "wind_direction_10m",
          "temperature_2m",
          "pressure_msl",
        ].join(","),
        forecast_days: Math.min(options.forecastDays || 1, 7), // Limit to max 7 days (optimal for free tier)
        timezone: this._getTimezone(options.timezone, latitude, longitude),
      };

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params,
        timeout: 10000,
      });

      if (response.data && response.data.hourly) {
        const hourlyData = response.data.hourly;

        // Generate estimated marine data for hourly
        const estimatedHourly = {
          time: hourlyData.time,
          wave_height: [],
          wave_direction: [],
          wave_period: [],
          wind_wave_height: [],
          wind_wave_direction: [],
          wind_wave_period: [],
          swell_wave_height: [],
          swell_wave_direction: [],
          swell_wave_period: [],
        };

        // Generate simple daily data from hourly (aggregate by day)
        const estimatedDaily = {
          time: [],
          wave_height_max: [],
          wave_direction_dominant: [],
          wave_period_max: [],
          wind_wave_height_max: [],
          wind_wave_direction_dominant: [],
          wind_wave_period_max: [],
        };

        // Process hourly data
        for (let i = 0; i < hourlyData.time.length; i++) {
          const windSpeed = hourlyData.wind_speed_10m[i] || 0;
          const windDirection = hourlyData.wind_direction_10m[i] || 0;
          const estimatedWaveHeight = this._estimateWaveHeight(windSpeed);

          estimatedHourly.wave_height.push(estimatedWaveHeight);
          estimatedHourly.wave_direction.push(windDirection);
          estimatedHourly.wave_period.push(
            this._estimateWavePeriod(estimatedWaveHeight)
          );
          estimatedHourly.wind_wave_height.push(estimatedWaveHeight * 0.7);
          estimatedHourly.wind_wave_direction.push(windDirection);
          estimatedHourly.wind_wave_period.push(
            this._estimateWavePeriod(estimatedWaveHeight * 0.7)
          );
          estimatedHourly.swell_wave_height.push(estimatedWaveHeight * 0.3);
          estimatedHourly.swell_wave_direction.push(windDirection);
          estimatedHourly.swell_wave_period.push(
            this._estimateWavePeriod(estimatedWaveHeight * 0.3)
          );
        }

        // Generate daily aggregates from hourly data
        const dailyAggregates = this._aggregateHourlyToDaily(estimatedHourly);
        estimatedDaily.time = dailyAggregates.time;
        estimatedDaily.wave_height_max = dailyAggregates.wave_height_max;
        estimatedDaily.wave_direction_dominant =
          dailyAggregates.wave_direction_dominant;
        estimatedDaily.wave_period_max = dailyAggregates.wave_period_max;
        estimatedDaily.wind_wave_height_max =
          dailyAggregates.wind_wave_height_max;
        estimatedDaily.wind_wave_direction_dominant =
          dailyAggregates.wind_wave_direction_dominant;
        estimatedDaily.wind_wave_period_max =
          dailyAggregates.wind_wave_period_max;

        return {
          location: {
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            timezone: response.data.timezone,
          },
          current_time: new Date().toISOString(),
          hourly: estimatedHourly,
          daily: estimatedDaily,
          units: {
            wave_height: "m",
            wave_direction: "°",
            wave_period: "s",
          },
          data_source: "weather_fallback",
        };
      }

      throw new Error("No weather data available");
    } catch (error) {
      Logger.error("Failed to get fallback marine weather:", error);
      throw error;
    }
  }
}

module.exports = new WeatherService();
