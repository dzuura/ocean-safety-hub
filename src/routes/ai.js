const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const geminiService = require("../services/geminiService");
const weatherService = require("../services/weatherService");
const ApiResponse = require("../utils/response");
const Logger = require("../utils/logger");

const router = express.Router();

// Menghasilkan penjelasan kondisi laut dalam bahasa natural
router.post("/explain-conditions", authenticateToken, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      timezone = "WIB",
      forecast_days = 1,
    } = req.body;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    const validForecastDays = Math.min(
      Math.max(parseInt(forecast_days), 1),
      16
    );

    const locationString = `${latitude}, ${longitude}`;

    let weatherData;
    try {
      weatherData = await weatherService.getMarineWeather(latitude, longitude, {
        timezone,
        forecastDays: validForecastDays,
      });
    } catch (error) {
      Logger.error("Failed to get marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca");
    }

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
        parameters: {
          timezone_input: timezone,
          timezone_used: weatherData.location?.timezone || "auto-detected",
          forecast_days: validForecastDays,
        },
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

// Menghasilkan rekomendasi waktu berlayar berdasarkan jenis perahu
router.post("/recommend-times", authenticateToken, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      boat_type,
      forecast_hours = 24,
      timezone = "WIB",
    } = req.body;

    if (!latitude || !longitude || !boat_type) {
      return ApiResponse.badRequest(
        res,
        "Latitude, longitude, dan boat_type diperlukan"
      );
    }

    const validBoatTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];
    if (!validBoatTypes.includes(boat_type)) {
      return ApiResponse.badRequest(
        res,
        "Jenis perahu tidak valid. Gunakan: perahu_kecil, kapal_nelayan, atau kapal_besar"
      );
    }

    const validForecastHours = Math.min(
      Math.max(parseInt(forecast_hours), 6),
      384
    );

    const forecastData = await weatherService.getMarineForecast(
      latitude,
      longitude,
      validForecastHours,
      { timezone }
    );

    if (!forecastData.success) {
      return ApiResponse.error(res, "Gagal mengambil data forecast");
    }

    const locationString = `${latitude}, ${longitude}`;

    const recommendations = await geminiService.generateTimeRecommendations(
      forecastData.data,
      boat_type,
      locationString
    );

    Logger.info("Time recommendations generated for user:", {
      uid: req.user.uid,
      boat_type,
      coordinates: locationString,
      forecast_hours: validForecastHours,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        boat_type,
        parameters: {
          forecast_hours: validForecastHours,
          timezone,
        },
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

// Mendeteksi anomali cuaca dan menghasilkan peringatan dini
router.post("/detect-anomalies", authenticateToken, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      historical_days = 7,
      timezone = "WIB",
      sensitivity = "medium",
    } = req.body;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    const validHistoricalDays = Math.min(
      Math.max(parseInt(historical_days), 1),
      92
    );

    const validSensitivities = ["low", "medium", "high"];
    const validSensitivity = validSensitivities.includes(sensitivity)
      ? sensitivity
      : "medium";

    const locationString = `${latitude}, ${longitude}`;

    let currentData;
    try {
      currentData = await weatherService.getMarineWeather(latitude, longitude, {
        timezone,
      });
    } catch (error) {
      Logger.error("Failed to get current marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca saat ini");
    }

    const historicalData = await weatherService.getHistoricalWeather(
      latitude,
      longitude,
      validHistoricalDays
    );

    // Generate analisis anomali cuaca dengan sensitivitas
    const anomalyAnalysis = await geminiService.detectAnomalies(
      currentData,
      historicalData.success ? historicalData.data : null,
      locationString,
      { sensitivity: validSensitivity }
    );

    Logger.info("Anomaly detection completed for user:", {
      uid: req.user.uid,
      coordinates: locationString,
      alert_level: anomalyAnalysis.alert_level,
      historical_days: validHistoricalDays,
      sensitivity: validSensitivity,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        parameters: {
          historical_days: validHistoricalDays,
          timezone,
          sensitivity: validSensitivity,
        },
        current_data: currentData,
        historical_data: historicalData.success
          ? {
              period_days: historicalData.data.period_days,
              data_source: historicalData.data.data_source,
              data_points: historicalData.data.historical?.length || 0,
            }
          : null,
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

// Ambil peringatan dini untuk lokasi tertentu
router.get("/early-warnings", authenticateToken, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      historical_days = 7,
      timezone = "WIB",
      alert_threshold = "medium",
    } = req.query;

    if (!latitude || !longitude) {
      return ApiResponse.badRequest(res, "Latitude dan longitude diperlukan");
    }

    // Validasi historical_days (1-92 days max, tetapi rekomendasi max 7 untuk kinerja optimal)
    const validHistoricalDays = Math.min(
      Math.max(parseInt(historical_days), 1),
      92
    );

    // Validasi alert_threshold
    const validThresholds = ["low", "medium", "high"];
    const validThreshold = validThresholds.includes(alert_threshold)
      ? alert_threshold
      : "medium";

    // Generate lokasi string dari koordinat
    const locationString = `${latitude}, ${longitude}`;

    let currentData;
    try {
      currentData = await weatherService.getMarineWeather(latitude, longitude, {
        timezone,
      });
    } catch (error) {
      Logger.error("Failed to get current marine weather data:", error);
      return ApiResponse.error(res, "Gagal mengambil data cuaca");
    }

    // Ambil data historis cuaca sebagai referensi
    const historicalData = await weatherService.getHistoricalWeather(
      latitude,
      longitude,
      validHistoricalDays
    );

    // Generate analisis anomali cuaca dengan sensitivitas
    const anomalyAnalysis = await geminiService.detectAnomalies(
      currentData,
      historicalData.success ? historicalData.data : null,
      locationString,
      { sensitivity: validThreshold }
    );

    // Filter warning berdasarkan alert_threshold
    let severityFilter = [];
    switch (validThreshold) {
      case "low":
        severityFilter = ["HIGH", "MEDIUM", "LOW"];
        break;
      case "medium":
        severityFilter = ["HIGH", "MEDIUM"];
        break;
      case "high":
        severityFilter = ["HIGH"];
        break;
      default:
        severityFilter = ["HIGH", "MEDIUM"];
    }

    const activeWarnings = {
      alert_level: anomalyAnalysis.alert_level,
      has_warnings: anomalyAnalysis.alert_level !== "RENDAH",
      detected_anomalies: anomalyAnalysis.detected_anomalies.filter((anomaly) =>
        severityFilter.includes(anomaly.severity)
      ),
      prediction: anomalyAnalysis.prediction,
      recommendations: anomalyAnalysis.recommendations,
    };

    Logger.info("Early warnings retrieved for user:", {
      uid: req.user.uid,
      coordinates: locationString,
      alert_level: activeWarnings.alert_level,
      has_warnings: activeWarnings.has_warnings,
      historical_days: validHistoricalDays,
      alert_threshold: validThreshold,
    });

    return ApiResponse.success(
      res,
      {
        coordinates: { latitude, longitude },
        location_string: locationString,
        parameters: {
          historical_days: validHistoricalDays,
          timezone,
          alert_threshold: validThreshold,
        },
        warnings: activeWarnings,
        historical_data: historicalData.success
          ? {
              period_days: historicalData.data.period_days,
              data_source: historicalData.data.data_source,
              data_points: historicalData.data.historical?.length || 0,
            }
          : null,
        checked_at: new Date().toISOString(),
      },
      "Peringatan dini berhasil diambil"
    );
  } catch (error) {
    Logger.error("Failed to get early warnings:", error);
    return ApiResponse.error(res, "Gagal mengambil peringatan dini");
  }
});

// Mengecek status layanan AI
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
