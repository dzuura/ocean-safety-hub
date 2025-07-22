const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const geminiService = require("../services/geminiService");
const weatherService = require("../services/weatherService");
const ApiResponse = require("../utils/response");
const Logger = require("../utils/logger");

const router = express.Router();

/**
 * POST /api/ai/explain-conditions
 * Generate natural language explanation of marine conditions
 */
router.post("/explain-conditions", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    // Generate location string from coordinates
    const locationString = `${latitude}, ${longitude}`;

    // Get current weather data
    let weatherData;
    try {
      weatherData = await weatherService.getMarineWeather(latitude, longitude);
    } catch (error) {
      Logger.error("Failed to get marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca");
    }

    // Generate AI explanation
    const explanation = await geminiService.explainMarineConditions(
      weatherData,
      locationString
    );

    Logger.info("Marine conditions explained for user:", {
      uid: req.user.uid,
      coordinates: locationString,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        weather_data: weatherData,
        ai_explanation: explanation,
        generated_at: new Date().toISOString(),
      },
      "Penjelasan kondisi laut berhasil dibuat"
    );
  } catch (error) {
    Logger.error("Failed to explain marine conditions:", error);
    return ApiResponse.error(res, "Gagal membuat penjelasan kondisi laut");
  }
});

/**
 * POST /api/ai/recommend-times
 * Generate personalized time recommendations based on boat type
 */
router.post("/recommend-times", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, boat_type } = req.body;

    if (!latitude || !longitude || !boat_type) {
      return ApiResponse.badRequest(
        res,
        "Latitude, longitude, dan boat_type diperlukan"
      );
    }

    // Validate boat type
    const validBoatTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];
    if (!validBoatTypes.includes(boat_type)) {
      return ApiResponse.badRequest(
        res,
        "Jenis perahu tidak valid. Gunakan: perahu_kecil, kapal_nelayan, atau kapal_besar"
      );
    }

    // Get forecast data (24 hours)
    const forecastData = await weatherService.getMarineForecast(
      latitude,
      longitude,
      24
    );

    if (!forecastData.success) {
      return ApiResponse.error(res, "Gagal mengambil data forecast");
    }

    // Generate location string from coordinates
    const locationString = `${latitude}, ${longitude}`;

    // Generate AI recommendations
    const recommendations = await geminiService.generateTimeRecommendations(
      forecastData.data,
      boat_type,
      locationString
    );

    Logger.info("Time recommendations generated for user:", {
      uid: req.user.uid,
      boat_type,
      coordinates: locationString,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        boat_type,
        forecast_data: forecastData.data,
        ai_recommendations: recommendations,
        generated_at: new Date().toISOString(),
      },
      "Rekomendasi waktu berlayar berhasil dibuat"
    );
  } catch (error) {
    Logger.error("Failed to generate time recommendations:", error);
    return ApiResponse.error(res, "Gagal membuat rekomendasi waktu berlayar");
  }
});

/**
 * POST /api/ai/detect-anomalies
 * Detect weather anomalies and generate early warnings
 */
router.post("/detect-anomalies", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    // Generate location string from coordinates
    const locationString = `${latitude}, ${longitude}`;

    // Get current weather data
    let currentData;
    try {
      currentData = await weatherService.getMarineWeather(latitude, longitude);
    } catch (error) {
      Logger.error("Failed to get current marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca saat ini");
    }

    // Get historical data for comparison (last 7 days)
    const historicalData = await weatherService.getHistoricalWeather(
      latitude,
      longitude,
      7
    );

    // Generate anomaly analysis
    const anomalyAnalysis = await geminiService.detectAnomalies(
      currentData,
      historicalData.success ? historicalData.data : null,
      locationString
    );

    Logger.info("Anomaly detection completed for user:", {
      uid: req.user.uid,
      coordinates: locationString,
      alert_level: anomalyAnalysis.alert_level,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        current_data: currentData,
        anomaly_analysis: anomalyAnalysis,
        analyzed_at: new Date().toISOString(),
      },
      "Analisis anomali cuaca berhasil dilakukan"
    );
  } catch (error) {
    Logger.error("Failed to detect anomalies:", error);
    return ApiResponse.error(res, "Gagal melakukan deteksi anomali");
  }
});

/**
 * GET /api/ai/early-warnings
 * Get current early warnings for a location
 */
router.get("/early-warnings", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    // Generate location string from coordinates
    const locationString = `${latitude}, ${longitude}`;

    // Get current weather data
    let currentData;
    try {
      currentData = await weatherService.getMarineWeather(latitude, longitude);
    } catch (error) {
      Logger.error("Failed to get current marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca");
    }

    // Get historical data for comparison
    const historicalData = await weatherService.getHistoricalWeather(
      latitude,
      longitude,
      7
    );

    // Generate anomaly analysis
    const anomalyAnalysis = await geminiService.detectAnomalies(
      currentData,
      historicalData.success ? historicalData.data : null,
      locationString
    );

    // Filter only high-priority warnings
    const activeWarnings = {
      alert_level: anomalyAnalysis.alert_level,
      has_warnings: anomalyAnalysis.alert_level !== "RENDAH",
      detected_anomalies: anomalyAnalysis.detected_anomalies.filter(
        (anomaly) =>
          anomaly.severity === "HIGH" || anomaly.severity === "MEDIUM"
      ),
      prediction: anomalyAnalysis.prediction,
      recommendations: anomalyAnalysis.recommendations,
    };

    Logger.info("Early warnings retrieved for user:", {
      uid: req.user.uid,
      coordinates: locationString,
      alert_level: activeWarnings.alert_level,
      has_warnings: activeWarnings.has_warnings,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        warnings: activeWarnings,
        checked_at: new Date().toISOString(),
      },
      "Peringatan dini berhasil diambil"
    );
  } catch (error) {
    Logger.error("Failed to get early warnings:", error);
    return ApiResponse.error(res, "Gagal mengambil peringatan dini");
  }
});

/**
 * GET /api/ai/status
 * Check AI service status
 */
router.get("/status", (req, res) => {
  try {
    const isAvailable = geminiService.isAvailable();

    return ApiResponse.success(
      res,
      {
        ai_service: "Gemini AI",
        status: isAvailable ? "available" : "unavailable",
        features: {
          explain_conditions: isAvailable,
          time_recommendations: isAvailable,
          anomaly_detection: isAvailable,
          early_warnings: isAvailable,
        },
        fallback_mode: !isAvailable,
      },
      isAvailable
        ? "AI service tersedia"
        : "AI service tidak tersedia, menggunakan fallback"
    );
  } catch (error) {
    Logger.error("Failed to check AI status:", error);
    return ApiResponse.error(res, "Gagal memeriksa status AI");
  }
});

module.exports = router;
