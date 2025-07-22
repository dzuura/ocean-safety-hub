const weatherService = require('../services/weatherService');
const ApiResponse = require('../utils/response');
const Logger = require('../utils/logger');

/**
 * Weather Controller
 * Menangani semua request terkait data cuaca dan kondisi laut
 */
class WeatherController {
  /**
   * GET /api/weather/marine
   * Mendapatkan data cuaca maritim (gelombang, dll)
   */
  async getMarineWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      // Validasi parameter
      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? 'Latitude diperlukan' : null,
          longitude: !longitude ? 'Longitude diperlukan' : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validasi range koordinat
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: 'Latitude harus berupa angka antara -90 dan 90',
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: 'Longitude harus berupa angka antara -180 dan 180',
        });
      }

      // Opsi tambahan dari query parameters
      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days ? parseInt(req.query.forecast_days) : undefined,
      };

      const weatherData = await weatherService.getMarineWeather(lat, lng, options);

      return ApiResponse.success(
        res,
        weatherData,
        'Data cuaca maritim berhasil diambil'
      );
    } catch (error) {
      Logger.error('Error in getMarineWeather:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/weather/current
   * Mendapatkan data cuaca umum saat ini
   */
  async getCurrentWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      // Validasi parameter
      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? 'Latitude diperlukan' : null,
          longitude: !longitude ? 'Longitude diperlukan' : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validasi range koordinat
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: 'Latitude harus berupa angka antara -90 dan 90',
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: 'Longitude harus berupa angka antara -180 dan 180',
        });
      }

      // Opsi tambahan dari query parameters
      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days ? parseInt(req.query.forecast_days) : undefined,
      };

      const weatherData = await weatherService.getCurrentWeather(lat, lng, options);

      return ApiResponse.success(
        res,
        weatherData,
        'Data cuaca saat ini berhasil diambil'
      );
    } catch (error) {
      Logger.error('Error in getCurrentWeather:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/weather/complete
   * Mendapatkan data cuaca lengkap (maritim + umum)
   */
  async getCompleteWeather(req, res) {
    try {
      const { latitude, longitude } = req.query;

      // Validasi parameter
      if (!latitude || !longitude) {
        return ApiResponse.validationError(res, {
          latitude: !latitude ? 'Latitude diperlukan' : null,
          longitude: !longitude ? 'Longitude diperlukan' : null,
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validasi range koordinat
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return ApiResponse.validationError(res, {
          latitude: 'Latitude harus berupa angka antara -90 dan 90',
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return ApiResponse.validationError(res, {
          longitude: 'Longitude harus berupa angka antara -180 dan 180',
        });
      }

      // Opsi tambahan dari query parameters
      const options = {
        timezone: req.query.timezone,
        forecastDays: req.query.forecast_days ? parseInt(req.query.forecast_days) : undefined,
      };

      const weatherData = await weatherService.getCompleteWeather(lat, lng, options);

      return ApiResponse.success(
        res,
        weatherData,
        'Data cuaca lengkap berhasil diambil'
      );
    } catch (error) {
      Logger.error('Error in getCompleteWeather:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/weather/cache/stats
   * Mendapatkan statistik cache weather service
   */
  async getCacheStats(req, res) {
    try {
      const stats = weatherService.getCacheStats();
      return ApiResponse.success(res, stats, 'Statistik cache berhasil diambil');
    } catch (error) {
      Logger.error('Error in getCacheStats:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * DELETE /api/weather/cache
   * Clear cache weather service
   */
  async clearCache(req, res) {
    try {
      weatherService.clearCache();
      return ApiResponse.success(res, null, 'Cache berhasil dibersihkan');
    } catch (error) {
      Logger.error('Error in clearCache:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * GET /api/weather/locations/popular
   * Mendapatkan daftar lokasi populer untuk nelayan Indonesia
   */
  async getPopularLocations(req, res) {
    try {
      const popularLocations = [
        {
          name: 'Jakarta Bay',
          latitude: -6.1944,
          longitude: 106.8229,
          region: 'DKI Jakarta',
          type: 'bay',
        },
        {
          name: 'Surabaya Waters',
          latitude: -7.2575,
          longitude: 112.7521,
          region: 'Jawa Timur',
          type: 'coastal',
        },
        {
          name: 'Bali Strait',
          latitude: -8.2405,
          longitude: 114.3691,
          region: 'Bali',
          type: 'strait',
        },
        {
          name: 'Makassar Strait',
          latitude: -2.5489,
          longitude: 118.0149,
          region: 'Sulawesi Selatan',
          type: 'strait',
        },
        {
          name: 'Banda Sea',
          latitude: -4.5000,
          longitude: 129.0000,
          region: 'Maluku',
          type: 'sea',
        },
        {
          name: 'Java Sea',
          latitude: -5.8333,
          longitude: 110.0000,
          region: 'Jawa Tengah',
          type: 'sea',
        },
        {
          name: 'Natuna Sea',
          latitude: 3.2000,
          longitude: 108.2000,
          region: 'Kepulauan Riau',
          type: 'sea',
        },
        {
          name: 'Flores Sea',
          latitude: -7.0000,
          longitude: 121.0000,
          region: 'Nusa Tenggara Timur',
          type: 'sea',
        },
      ];

      return ApiResponse.success(
        res,
        popularLocations,
        'Daftar lokasi populer berhasil diambil'
      );
    } catch (error) {
      Logger.error('Error in getPopularLocations:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new WeatherController();
