const weatherService = require("../services/weatherService");
const ApiResponse = require("../utils/response");
const Logger = require("../utils/logger");

class WeatherController {
  // Mendapatkan data cuaca maritim
  async getMarineWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? "Latitude diperlukan" : null,
          longitude: !longitude ? "Longitude diperlukan" : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: "Latitude harus berupa angka antara -90 dan 90",
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: "Longitude harus berupa angka antara -180 dan 180",
        });
      }

      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days
          ? parseInt(req.query.forecast_days)
          : undefined,
      };

      const weatherData = await weatherService.getMarineWeather(
        lat,
        lng,
        options
      );

      return ApiResponse.success(
        res,
        weatherData,
        "Data cuaca maritim berhasil diambil"
      );
    } catch (error) {
      Logger.error("Error in getMarineWeather:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // Mendapatkan data cuaca umum saat ini
  async getCurrentWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? "Latitude diperlukan" : null,
          longitude: !longitude ? "Longitude diperlukan" : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: "Latitude harus berupa angka antara -90 dan 90",
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: "Longitude harus berupa angka antara -180 dan 180",
        });
      }

      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days
          ? parseInt(req.query.forecast_days)
          : undefined,
      };

      const weatherData = await weatherService.getCurrentWeather(
        lat,
        lng,
        options
      );

      return ApiResponse.success(
        res,
        weatherData,
        "Data cuaca saat ini berhasil diambil"
      );
    } catch (error) {
      Logger.error("Error in getCurrentWeather:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // Mendapatkan data cuaca lengkap (maritim + umum)
  async getCompleteWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      // Validasi parameter
      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? "Latitude diperlukan" : null,
          longitude: !longitude ? "Longitude diperlukan" : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validasi range koordinat
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: "Latitude harus berupa angka antara -90 dan 90",
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: "Longitude harus berupa angka antara -180 dan 180",
        });
      }

      // Opsi tambahan dari query parameters
      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days
          ? parseInt(req.query.forecast_days)
          : undefined,
      };

      const weatherData = await weatherService.getCompleteWeather(
        lat,
        lng,
        options
      );

      return ApiResponse.success(
        res,
        weatherData,
        "Data cuaca lengkap berhasil diambil"
      );
    } catch (error) {
      Logger.error("Error in getCompleteWeather:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // Mendapatkan statistik cache weather service
  async getCacheStats(req, res) {
    try {
      const stats = weatherService.getCacheStats();
      return ApiResponse.success(
        res,
        stats,
        "Statistik cache berhasil diambil"
      );
    } catch (error) {
      Logger.error("Error in getCacheStats:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  // Membersihkan cache weather service
  async clearCache(req, res) {
    try {
      weatherService.clearCache();
      return ApiResponse.success(res, null, "Cache berhasil dibersihkan");
    } catch (error) {
      Logger.error("Error in clearCache:", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new WeatherController();
