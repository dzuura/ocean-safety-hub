const express = require('express');
const weatherController = require('../controllers/weatherController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Weather Routes
 * Semua endpoint untuk data cuaca dan kondisi laut
 */

/**
 * GET /api/weather/marine
 * Mendapatkan data cuaca maritim (gelombang, arah gelombang, periode gelombang)
 * Query parameters:
 * - latitude (required): Latitude koordinat
 * - longitude (required): Longitude koordinat
 * - timezone (optional): Timezone (default: Asia/Jakarta)
 * - forecast_days (optional): Jumlah hari prediksi (default: 7)
 */
router.get('/marine', optionalAuth, weatherController.getMarineWeather);

/**
 * GET /api/weather/current
 * Mendapatkan data cuaca umum saat ini (suhu, angin, tekanan, dll)
 * Query parameters:
 * - latitude (required): Latitude koordinat
 * - longitude (required): Longitude koordinat
 * - timezone (optional): Timezone (default: Asia/Jakarta)
 * - forecast_days (optional): Jumlah hari prediksi (default: 3)
 */
router.get('/current', optionalAuth, weatherController.getCurrentWeather);

/**
 * GET /api/weather/complete
 * Mendapatkan data cuaca lengkap (maritim + umum)
 * Query parameters:
 * - latitude (required): Latitude koordinat
 * - longitude (required): Longitude koordinat
 * - timezone (optional): Timezone (default: Asia/Jakarta)
 * - forecast_days (optional): Jumlah hari prediksi (default: 7)
 */
router.get('/complete', optionalAuth, weatherController.getCompleteWeather);

/**
 * GET /api/weather/locations/popular
 * Mendapatkan daftar lokasi populer untuk nelayan Indonesia
 */
router.get('/locations/popular', weatherController.getPopularLocations);

/**
 * GET /api/weather/cache/stats
 * Mendapatkan statistik cache weather service
 * Berguna untuk monitoring dan debugging
 */
router.get('/cache/stats', weatherController.getCacheStats);

/**
 * DELETE /api/weather/cache
 * Clear cache weather service
 * Berguna untuk refresh data atau debugging
 */
router.delete('/cache', weatherController.clearCache);

module.exports = router;
