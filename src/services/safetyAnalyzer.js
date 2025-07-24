const Logger = require("../utils/logger");

class SafetyAnalyzer {
  constructor() {
    // Threshold keamanan berdasarkan jenis perahu
    this.safetyThresholds = {
      perahu_kecil: {
        wave_height_max: 1.5, // meter
        wind_speed_max: 25, // km/h
        wave_period_min: 4, // detik
        visibility_min: 1000, // meter
      },
      kapal_nelayan: {
        wave_height_max: 2.5, // meter
        wind_speed_max: 35, // km/h
        wave_period_min: 3, // detik
        visibility_min: 500, // meter
      },
      kapal_besar: {
        wave_height_max: 4.0, // meter
        wind_speed_max: 50, // km/h
        wave_period_min: 2, // detik
        visibility_min: 200, // meter
      },
    };

    // Faktor risiko cuaca
    this.weatherRiskFactors = {
      // Kode cuaca WMO yang berbahaya
      dangerous_weather_codes: [
        95,
        96,
        99, // Thunderstorm
        85,
        86, // Heavy snow
        67,
        77, // Freezing rain
        82,
        83,
        84, // Heavy rain showers
      ],
      moderate_weather_codes: [
        80,
        81, // Light to moderate rain showers
        61,
        63,
        65, // Rain
        71,
        73,
        75, // Snow
      ],
    };
  }

  // Menganalisis tingkat keamanan berlayar
  analyzeSafety(weatherData, boatType = "kapal_nelayan", options = {}) {
    try {
      const thresholds =
        this.safetyThresholds[boatType] || this.safetyThresholds.kapal_nelayan;

      // Analisis kondisi saat ini
      const currentAnalysis = this._analyzeCurrentConditions(
        weatherData,
        thresholds
      );

      // Analisis forecast 24 jam ke depan
      const forecastAnalysis = this._analyzeForecastConditions(
        weatherData,
        thresholds
      );

      // Hitung skor keamanan keseluruhan
      const overallSafety = this._calculateOverallSafety(
        currentAnalysis,
        forecastAnalysis
      );

      // Generate rekomendasi
      const recommendations = this._generateRecommendations(
        currentAnalysis,
        forecastAnalysis,
        boatType,
        options
      );

      return {
        success: true,
        data: {
          boat_type: boatType,
          location: {
            latitude: weatherData.location?.latitude,
            longitude: weatherData.location?.longitude,
          },
          analysis_time: new Date().toISOString(),
          current_conditions: currentAnalysis,
          forecast_24h: forecastAnalysis,
          overall_safety: overallSafety,
          recommendations: recommendations,
          thresholds_used: thresholds,
        },
      };
    } catch (error) {
      Logger.error("Error in safety analysis:", error);
      return {
        success: false,
        error: "Gagal menganalisis tingkat keamanan",
        details: error.message,
      };
    }
  }

  // Menganalisis kondisi cuaca saat ini
  _analyzeCurrentConditions(weatherData, thresholds) {
    if (!weatherData) {
      throw new Error("Weather data is required");
    }

    const current = weatherData.current || {};
    const hourly = weatherData.hourly || {};

    // Ambil data jam pertama jika current tidak ada
    const currentHour = hourly.time ? 0 : null;

    const conditions = {
      wave_height:
        this._getCurrentValue(weatherData, "wave_height", currentHour) || 0,
      wind_speed:
        current.wind_speed_10m ||
        this._getCurrentValue(weatherData, "wind_speed_10m", currentHour) ||
        0,
      wave_period:
        this._getCurrentValue(weatherData, "wave_period", currentHour) || 5,
      visibility:
        current.visibility ||
        this._getCurrentValue(weatherData, "visibility", currentHour) ||
        10000,
      weather_code:
        current.weather_code ||
        this._getCurrentValue(weatherData, "weather_code", currentHour) ||
        0,
      precipitation:
        current.precipitation ||
        this._getCurrentValue(weatherData, "precipitation", currentHour) ||
        0,
      wind_gusts:
        current.wind_gusts_10m ||
        this._getCurrentValue(weatherData, "wind_gusts_10m", currentHour) ||
        0,
    };

    // Evaluasi setiap parameter
    const evaluation = {
      wave_height: this._evaluateParameter(
        conditions.wave_height,
        thresholds.wave_height_max,
        "below"
      ),
      wind_speed: this._evaluateParameter(
        conditions.wind_speed,
        thresholds.wind_speed_max,
        "below"
      ),
      wave_period: this._evaluateParameter(
        conditions.wave_period,
        thresholds.wave_period_min,
        "above"
      ),
      visibility: this._evaluateParameter(
        conditions.visibility,
        thresholds.visibility_min,
        "above"
      ),
      weather: this._evaluateWeatherCode(conditions.weather_code),
      precipitation: this._evaluatePrecipitation(conditions.precipitation),
    };

    // Hitung skor keamanan saat ini (0-100)
    const safetyScore = this._calculateSafetyScore(evaluation);

    return {
      conditions,
      evaluation,
      safety_score: safetyScore,
      safety_level: this._getSafetyLevel(safetyScore),
      timestamp: new Date().toISOString(),
    };
  }

  // Menganalisis kondisi forecast 24 jam
  _analyzeForecastConditions(weatherData, thresholds) {
    const hourly = weatherData.hourly || {};

    if (!hourly.time || hourly.time.length === 0) {
      return {
        periods: [],
        worst_conditions: null,
        average_safety_score: 50,
        safety_trend: "stable",
      };
    }

    // Analisis per 6 jam untuk 24 jam ke depan
    const periods = [];
    const hoursToAnalyze = Math.min(24, hourly.time.length);

    for (let i = 0; i < hoursToAnalyze; i += 6) {
      const endHour = Math.min(i + 6, hoursToAnalyze);
      const periodData = this._analyzePeriod(
        weatherData,
        thresholds,
        i,
        endHour
      );
      periods.push(periodData);
    }

    // Temukan kondisi terburuk
    const worstConditions = this._findWorstConditions(periods);

    // Hitung rata-rata skor keamanan
    const averageSafetyScore =
      periods.reduce((sum, period) => sum + period.safety_score, 0) /
      periods.length;

    // Tentukan tren keamanan
    const safetyTrend = this._calculateSafetyTrend(periods);

    return {
      periods,
      worst_conditions: worstConditions,
      average_safety_score: Math.round(averageSafetyScore),
      safety_trend: safetyTrend,
    };
  }

  // Mengambil nilai saat ini dari data cuaca
  _getCurrentValue(weatherData, parameter, hourIndex = 0) {
    const hourly = weatherData.hourly || {};

    if (hourly[parameter] && hourly[parameter].length > hourIndex) {
      return hourly[parameter][hourIndex];
    }

    return null;
  }

  // Mengevaluasi parameter terhadap threshold
  _evaluateParameter(value, threshold, comparison) {
    if (value === null || value === undefined || isNaN(value)) {
      return {
        status: "unknown",
        score: 50,
        message: "Data tidak tersedia",
        value: null,
        threshold,
      };
    }

    let status, score, message;

    if (comparison === "below") {
      if (value <= threshold * 0.7) {
        status = "safe";
        score = 90;
        message = "Kondisi aman";
      } else if (value <= threshold) {
        status = "moderate";
        score = 60;
        message = "Kondisi sedang, perlu perhatian";
      } else {
        status = "dangerous";
        score = 20;
        message = "Kondisi berbahaya";
      }
    } else {
      // above
      if (value >= threshold * 1.3) {
        status = "safe";
        score = 90;
        message = "Kondisi aman";
      } else if (value >= threshold) {
        status = "moderate";
        score = 60;
        message = "Kondisi sedang, perlu perhatian";
      } else {
        status = "dangerous";
        score = 20;
        message = "Kondisi berbahaya";
      }
    }

    return { status, score, message, value, threshold };
  }

  // Mengevaluasi kode cuaca
  _evaluateWeatherCode(weatherCode) {
    if (this.weatherRiskFactors.dangerous_weather_codes.includes(weatherCode)) {
      return {
        status: "dangerous",
        score: 10,
        message: "Cuaca berbahaya (badai/hujan deras)",
        weather_code: weatherCode,
      };
    } else if (
      this.weatherRiskFactors.moderate_weather_codes.includes(weatherCode)
    ) {
      return {
        status: "moderate",
        score: 50,
        message: "Cuaca kurang ideal",
        weather_code: weatherCode,
      };
    } else {
      return {
        status: "safe",
        score: 90,
        message: "Cuaca baik",
        weather_code: weatherCode,
      };
    }
  }

  // Mengevaluasi curah hujan
  _evaluatePrecipitation(precipitation) {
    if (precipitation >= 10) {
      return { status: "dangerous", score: 20, message: "Hujan deras" };
    } else if (precipitation >= 2.5) {
      return { status: "moderate", score: 60, message: "Hujan sedang" };
    } else {
      return { status: "safe", score: 90, message: "Tidak hujan/hujan ringan" };
    }
  }

  // Menghitung skor keamanan keseluruhan
  _calculateSafetyScore(evaluation) {
    const weights = {
      wave_height: 0.25,
      wind_speed: 0.25,
      wave_period: 0.15,
      visibility: 0.1,
      weather: 0.15,
      precipitation: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach((key) => {
      if (evaluation[key] && evaluation[key].score !== undefined) {
        totalScore += evaluation[key].score * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  }

  // Mendapatkan level keamanan berdasarkan skor
  _getSafetyLevel(score) {
    if (score >= 80) return "AMAN";
    if (score >= 60) return "HATI-HATI";
    if (score >= 40) return "BERISIKO";
    return "BERBAHAYA";
  }

  // Menganalisis periode waktu tertentu
  _analyzePeriod(weatherData, thresholds, startHour, endHour) {
    const hourly = weatherData.hourly || {};

    // Ambil nilai rata-rata untuk periode ini
    const avgConditions = {};
    const parameters = [
      "wave_height",
      "wind_speed_10m",
      "wave_period",
      "visibility",
      "precipitation",
    ];

    parameters.forEach((param) => {
      if (hourly[param]) {
        const values = hourly[param]
          .slice(startHour, endHour)
          .filter((v) => v !== null);
        avgConditions[param] =
          values.length > 0
            ? values.reduce((sum, val) => sum + val, 0) / values.length
            : 0;
      }
    });

    // Evaluasi kondisi rata-rata
    const evaluation = {
      wave_height: this._evaluateParameter(
        avgConditions.wave_height,
        thresholds.wave_height_max,
        "below"
      ),
      wind_speed: this._evaluateParameter(
        avgConditions.wind_speed_10m,
        thresholds.wind_speed_max,
        "below"
      ),
      wave_period: this._evaluateParameter(
        avgConditions.wave_period,
        thresholds.wave_period_min,
        "above"
      ),
      visibility: this._evaluateParameter(
        avgConditions.visibility,
        thresholds.visibility_min,
        "above"
      ),
      precipitation: this._evaluatePrecipitation(avgConditions.precipitation),
    };

    const safetyScore = this._calculateSafetyScore(evaluation);

    return {
      time_range: {
        start: hourly.time ? hourly.time[startHour] : null,
        end: hourly.time
          ? hourly.time[Math.min(endHour - 1, hourly.time.length - 1)]
          : null,
      },
      conditions: avgConditions,
      evaluation,
      safety_score: safetyScore,
      safety_level: this._getSafetyLevel(safetyScore),
    };
  }

  // Menemukan kondisi terburuk
  _findWorstConditions(periods) {
    if (periods.length === 0) return null;

    return periods.reduce((worst, current) =>
      current.safety_score < worst.safety_score ? current : worst
    );
  }

  // Menghitung tren keamanan
  _calculateSafetyTrend(periods) {
    if (periods.length < 2) return "stable";

    const firstScore = periods[0].safety_score;
    const lastScore = periods[periods.length - 1].safety_score;
    const difference = lastScore - firstScore;

    if (difference > 10) return "improving";
    if (difference < -10) return "deteriorating";
    return "stable";
  }

  // Menghitung skor keamanan keseluruhan
  _calculateOverallSafety(currentAnalysis, forecastAnalysis) {
    const currentWeight = 0.6;
    const forecastWeight = 0.4;

    const overallScore = Math.round(
      currentAnalysis.safety_score * currentWeight +
        forecastAnalysis.average_safety_score * forecastWeight
    );

    return {
      score: overallScore,
      level: this._getSafetyLevel(overallScore),
      confidence: this._calculateConfidence(currentAnalysis, forecastAnalysis),
    };
  }

  // Menghitung tingkat kepercayaan analisis
  _calculateConfidence(currentAnalysis, forecastAnalysis) {
    // Confidence berdasarkan ketersediaan data dan konsistensi
    let confidence = 100;

    // Kurangi confidence jika ada data yang tidak tersedia
    Object.values(currentAnalysis.evaluation).forEach((evaluation) => {
      if (evaluation.status === "unknown") confidence -= 15;
    });

    // Kurangi confidence jika tren tidak stabil
    if (forecastAnalysis.safety_trend === "deteriorating") confidence -= 10;

    return Math.max(confidence, 30); // Minimum 30% confidence
  }

  // Menghasilkan rekomendasi keamanan
  _generateRecommendations(
    currentAnalysis,
    forecastAnalysis,
    boatType,
    options = {}
  ) {
    const recommendations = [];
    const currentLevel = currentAnalysis.safety_level;
    const worstConditions = forecastAnalysis.worst_conditions;

    // Rekomendasi berdasarkan kondisi saat ini
    if (currentLevel === "BERBAHAYA") {
      recommendations.push({
        type: "critical",
        message: "JANGAN BERLAYAR - Kondisi sangat berbahaya",
        action: "Tunda perjalanan hingga kondisi membaik",
      });
    } else if (currentLevel === "BERISIKO") {
      recommendations.push({
        type: "warning",
        message: "Berlayar dengan sangat hati-hati",
        action: "Pertimbangkan menunda perjalanan atau gunakan rute alternatif",
      });
    } else if (currentLevel === "HATI-HATI") {
      recommendations.push({
        type: "caution",
        message: "Kondisi dapat berlayar dengan perhatian ekstra",
        action: "Pantau cuaca secara berkala dan siapkan rencana darurat",
      });
    } else {
      recommendations.push({
        type: "safe",
        message: "Kondisi aman untuk berlayar",
        action: "Tetap waspada dan pantau perubahan cuaca",
      });
    }

    // Rekomendasi berdasarkan forecast
    if (worstConditions && worstConditions.safety_level === "BERBAHAYA") {
      recommendations.push({
        type: "forecast_warning",
        message: `Kondisi akan memburuk pada ${worstConditions.time_range.start}`,
        action: "Rencanakan untuk kembali ke pelabuhan sebelum waktu tersebut",
      });
    }

    // Rekomendasi spesifik berdasarkan jenis perahu
    if (boatType === "perahu_kecil") {
      recommendations.push({
        type: "boat_specific",
        message: "Perahu kecil lebih rentan terhadap gelombang dan angin",
        action: "Hindari berlayar jika gelombang > 1.5m atau angin > 25 km/h",
      });
    }

    // Rekomendasi berdasarkan parameter spesifik
    const currentEval = currentAnalysis.evaluation;

    if (currentEval.wave_height?.status === "dangerous") {
      recommendations.push({
        type: "parameter_warning",
        message: `Gelombang tinggi: ${currentEval.wave_height.value}m`,
        action: "Tunggu hingga gelombang mereda di bawah batas aman",
      });
    }

    if (currentEval.wind_speed?.status === "dangerous") {
      recommendations.push({
        type: "parameter_warning",
        message: `Angin kencang: ${currentEval.wind_speed.value} km/h`,
        action: "Hindari berlayar dalam kondisi angin kencang",
      });
    }

    if (currentEval.weather?.status === "dangerous") {
      recommendations.push({
        type: "weather_warning",
        message: "Cuaca buruk terdeteksi (badai/hujan deras)",
        action: "Cari tempat berlindung segera",
      });
    }

    return recommendations;
  }
}

module.exports = SafetyAnalyzer;
