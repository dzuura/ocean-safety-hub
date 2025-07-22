const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");
const Logger = require("../utils/logger");

class GeminiService {
  constructor() {
    if (!config.gemini.apiKey) {
      Logger.warn("Gemini API key not configured");
      this.genAI = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      Logger.info("Gemini AI service initialized successfully");
    } catch (error) {
      Logger.error("Failed to initialize Gemini AI service:", error);
      this.genAI = null;
    }
  }

  /**
   * Clean and parse JSON response from Gemini
   * Removes markdown formatting and extracts JSON
   */
  _parseGeminiResponse(text) {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();

      // Remove ```json and ``` wrappers
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Parse the cleaned JSON
      return JSON.parse(cleanText.trim());
    } catch (error) {
      Logger.error("Failed to parse Gemini response:", {
        text,
        error: error.message,
      });
      throw new Error(`Invalid JSON response from Gemini: ${error.message}`);
    }
  }

  /**
   * Check if Gemini service is available
   */
  isAvailable() {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Generate natural language explanation of marine conditions
   */
  async explainMarineConditions(weatherData, location = "perairan Indonesia") {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI service not available");
    }

    try {
      const prompt = this._buildExplanationPrompt(weatherData, location);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response using helper method
      const explanation = this._parseGeminiResponse(text);

      Logger.info("Marine conditions explained successfully");
      return explanation;
    } catch (error) {
      Logger.error("Failed to explain marine conditions:", error);

      // Fallback response
      return this._getFallbackExplanation(weatherData);
    }
  }

  /**
   * Generate personalized time recommendations based on boat type
   */
  async generateTimeRecommendations(
    forecastData,
    boatType,
    location = "perairan Indonesia"
  ) {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI service not available");
    }

    try {
      const prompt = this._buildTimeRecommendationPrompt(
        forecastData,
        boatType,
        location
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response using helper method
      const recommendations = this._parseGeminiResponse(text);

      Logger.info("Time recommendations generated successfully");
      return recommendations;
    } catch (error) {
      Logger.error("Failed to generate time recommendations:", error);

      // Fallback response
      return this._getFallbackTimeRecommendations(forecastData, boatType);
    }
  }

  /**
   * Detect anomalies and generate early warnings
   */
  async detectAnomalies(
    currentData,
    historicalData,
    location = "perairan Indonesia"
  ) {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI service not available");
    }

    try {
      const prompt = this._buildAnomalyDetectionPrompt(
        currentData,
        historicalData,
        location
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response using helper method
      const anomalyAnalysis = this._parseGeminiResponse(text);

      Logger.info("Anomaly detection completed successfully");
      return anomalyAnalysis;
    } catch (error) {
      Logger.error("Failed to detect anomalies:", error);

      // Fallback response
      return this._getFallbackAnomalyDetection(currentData);
    }
  }

  /**
   * Build prompt for marine conditions explanation
   */
  _buildExplanationPrompt(weatherData, location) {
    // Extract current conditions from hourly data (first entry)
    const currentHour = weatherData.hourly
      ? {
          waveHeight: weatherData.hourly.wave_height?.[0] || null,
          wavePeriod: weatherData.hourly.wave_period?.[0] || null,
          waveDirection: weatherData.hourly.wave_direction?.[0] || null,
          windWaveHeight: weatherData.hourly.wind_wave_height?.[0] || null,
          swellWaveHeight: weatherData.hourly.swell_wave_height?.[0] || null,
        }
      : {};

    // Extract daily max conditions
    const dailyMax = weatherData.daily
      ? {
          maxWaveHeight: weatherData.daily.wave_height_max?.[0] || null,
          maxWavePeriod: weatherData.daily.wave_period_max?.[0] || null,
          dominantWaveDirection:
            weatherData.daily.wave_direction_dominant?.[0] || null,
        }
      : {};

    // Determine data source info
    const dataSource = weatherData.data_source || "marine";
    const dataSourceText =
      dataSource === "weather_fallback"
        ? "(estimasi berdasarkan data angin)"
        : "(data marine langsung)";

    // Determine location context
    const locationContext = this._getLocationContext(location);

    return `
Anda adalah ahli cuaca maritim Indonesia yang menjelaskan kondisi laut kepada nelayan dan masyarakat pesisir.

Data cuaca maritim saat ini di ${location} ${dataSourceText}:

KONDISI SAAT INI:
- Tinggi gelombang: ${
      currentHour.waveHeight ? `${currentHour.waveHeight}m` : "tidak tersedia"
    }
- Periode gelombang: ${
      currentHour.wavePeriod
        ? `${currentHour.wavePeriod} detik`
        : "tidak tersedia"
    }
- Arah gelombang: ${
      currentHour.waveDirection
        ? `${currentHour.waveDirection}°`
        : "tidak tersedia"
    }
- Tinggi gelombang angin: ${
      currentHour.windWaveHeight
        ? `${currentHour.windWaveHeight}m`
        : "tidak tersedia"
    }
- Tinggi gelombang swell: ${
      currentHour.swellWaveHeight
        ? `${currentHour.swellWaveHeight}m`
        : "tidak tersedia"
    }

KONDISI MAKSIMAL HARI INI:
- Tinggi gelombang maksimal: ${
      dailyMax.maxWaveHeight ? `${dailyMax.maxWaveHeight}m` : "tidak tersedia"
    }
- Periode gelombang maksimal: ${
      dailyMax.maxWavePeriod
        ? `${dailyMax.maxWavePeriod} detik`
        : "tidak tersedia"
    }
- Arah gelombang dominan: ${
      dailyMax.dominantWaveDirection
        ? `${dailyMax.dominantWaveDirection}°`
        : "tidak tersedia"
    }

SUMBER DATA: ${
      dataSource === "weather_fallback"
        ? "Estimasi berdasarkan kondisi angin (area pesisir)"
        : "Data marine langsung (laut dalam)"
    }

Tugas Anda:
1. Jelaskan kondisi dalam bahasa Indonesia yang sederhana dan mudah dipahami
2. Tentukan tingkat keamanan: AMAN, HATI-HATI, atau BERBAHAYA
3. Berikan saran praktis untuk nelayan
4. Gunakan konteks lokasi: ${locationContext}
5. Sebutkan bahwa data ${
      dataSource === "weather_fallback"
        ? "diestimasi dari kondisi angin"
        : "berasal dari sensor marine"
    }

Berikan respons dalam format JSON berikut:
{
  "explanation": "penjelasan kondisi dalam bahasa sederhana",
  "safety_level": "AMAN/HATI-HATI/BERBAHAYA",
  "simple_advice": "saran praktis untuk nelayan",
  "local_context": "konteks lokal yang relevan untuk ${locationContext}",
  "technical_summary": "ringkasan teknis singkat"
}

Gunakan bahasa yang ramah dan mudah dipahami oleh masyarakat pesisir.
`;
  }

  /**
   * Get location context based on coordinates
   */
  _getLocationContext(location) {
    // Parse coordinates if in "lat, lng" format
    if (location.includes(",")) {
      const [lat, lng] = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));

      // Jakarta Bay area
      if (lat >= -6.9 && lat <= -6.0 && lng >= 106.5 && lng <= 107.2) {
        return "Teluk Jakarta dan sekitarnya";
      }

      // Banten coastal area
      if (lat >= -6.5 && lat <= -5.8 && lng >= 105.8 && lng <= 106.5) {
        return "perairan pesisir Banten";
      }

      // West Java coastal area
      if (lat >= -7.5 && lat <= -6.0 && lng >= 106.0 && lng <= 108.5) {
        return "perairan pesisir Jawa Barat";
      }

      // Central Java coastal area
      if (lat >= -7.5 && lat <= -6.0 && lng >= 108.5 && lng <= 111.0) {
        return "perairan pesisir Jawa Tengah";
      }

      // East Java coastal area
      if (lat >= -8.5 && lat <= -6.0 && lng >= 111.0 && lng <= 114.5) {
        return "perairan pesisir Jawa Timur";
      }

      // Bali area
      if (lat >= -8.8 && lat <= -8.0 && lng >= 114.5 && lng <= 115.8) {
        return "perairan sekitar Bali";
      }

      // Sumatra eastern coast
      if (lat >= -4.0 && lat <= 6.0 && lng >= 98.0 && lng <= 106.0) {
        return "perairan pesisir timur Sumatra";
      }

      // Kalimantan southern coast
      if (lat >= -4.5 && lat <= 0.0 && lng >= 108.0 && lng <= 117.0) {
        return "perairan pesisir selatan Kalimantan";
      }

      // Sulawesi area
      if (lat >= -6.0 && lat <= 2.0 && lng >= 117.0 && lng <= 125.0) {
        return "perairan sekitar Sulawesi";
      }

      // Default for Indonesian waters
      return "perairan Indonesia";
    }

    // Return as-is if not coordinates
    return location;
  }

  /**
   * Build prompt for time recommendations
   */
  _buildTimeRecommendationPrompt(forecastData, boatType, location) {
    const boatSpecs = this._getBoatSpecifications(boatType);
    const locationContext = this._getLocationContext(location);

    // Determine data source
    const dataSource = forecastData.data_source || "marine";
    const dataSourceText =
      dataSource === "weather_fallback"
        ? "Estimasi berdasarkan kondisi angin (area pesisir)"
        : "Data marine langsung (laut dalam)";

    // Extract and format forecast data for better readability
    const forecastSummary = forecastData.forecast
      ? forecastData.forecast
          .slice(0, 24)
          .map((hour) => {
            const time = new Date(hour.time).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            });

            return (
              `${time}: Gelombang ${hour.wave_height || "N/A"}m, ` +
              `Angin ${hour.wind_speed || "N/A"} km/h, ` +
              `Arah ${hour.wave_direction || "N/A"}°`
            );
          })
          .join("\n")
      : "Data forecast tidak tersedia";

    return `
Anda adalah penasihat keselamatan maritim Indonesia yang memberikan rekomendasi waktu berlayar untuk nelayan.

LOKASI: ${locationContext}
JENIS PERAHU: ${boatType}
SUMBER DATA: ${dataSourceText}

SPESIFIKASI KEAMANAN PERAHU:
- Tinggi gelombang maksimal: ${boatSpecs.maxWaveHeight}m
- Kecepatan angin maksimal: ${boatSpecs.maxWindSpeed} km/h
- Kategori: ${boatSpecs.category}

PRAKIRAAN CUACA 24 JAM KE DEPAN:
${forecastSummary}

TUGAS ANALISIS:
1. Analisis kondisi setiap jam berdasarkan toleransi ${boatType}
2. Identifikasi jendela waktu aman (gelombang ≤ ${
      boatSpecs.maxWaveHeight
    }m, angin ≤ ${boatSpecs.maxWindSpeed} km/h)
3. Berikan rekomendasi waktu spesifik dengan alasan yang jelas
4. Pertimbangkan kondisi khusus ${locationContext}
5. Identifikasi waktu berbahaya yang harus dihindari

KRITERIA KEAMANAN:
- AMAN: Gelombang < ${boatSpecs.maxWaveHeight * 0.7}m, Angin < ${
      boatSpecs.maxWindSpeed * 0.7
    } km/h
- HATI-HATI: Gelombang ${boatSpecs.maxWaveHeight * 0.7}-${
      boatSpecs.maxWaveHeight
    }m, Angin ${boatSpecs.maxWindSpeed * 0.7}-${boatSpecs.maxWindSpeed} km/h
- BERBAHAYA: Gelombang > ${boatSpecs.maxWaveHeight}m, Angin > ${
      boatSpecs.maxWindSpeed
    } km/h

Berikan respons dalam format JSON berikut:
{
  "boat_type": "${boatType}",
  "safe_windows": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "confidence": "TINGGI/SEDANG/RENDAH",
      "reason": "alasan spesifik mengapa waktu ini aman untuk ${boatType} di ${locationContext}",
      "wave_condition": "kondisi gelombang saat itu",
      "wind_condition": "kondisi angin saat itu"
    }
  ],
  "avoid_times": [
    {
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "reason": "alasan spesifik mengapa waktu ini berbahaya untuk ${boatType}",
      "risk_level": "SEDANG/TINGGI/KRITIS"
    }
  ],
  "best_recommendation": "rekomendasi waktu terbaik dengan jam spesifik dan alasan untuk ${locationContext}",
  "general_advice": "saran umum untuk ${boatType} di ${locationContext} berdasarkan ${dataSourceText}"
}

Fokus pada keselamatan nelayan dan berikan rekomendasi yang praktis untuk ${locationContext}.
`;
  }

  /**
   * Build prompt for anomaly detection
   */
  _buildAnomalyDetectionPrompt(currentData, historicalData, location) {
    // Extract current conditions from marine data
    const currentHour = currentData.hourly
      ? {
          waveHeight: currentData.hourly.wave_height?.[0] || null,
          wavePeriod: currentData.hourly.wave_period?.[0] || null,
          waveDirection: currentData.hourly.wave_direction?.[0] || null,
          windWaveHeight: currentData.hourly.wind_wave_height?.[0] || null,
          swellWaveHeight: currentData.hourly.swell_wave_height?.[0] || null,
        }
      : {};

    const currentDaily = currentData.daily
      ? {
          maxWaveHeight: currentData.daily.wave_height_max?.[0] || null,
          maxWavePeriod: currentData.daily.wave_period_max?.[0] || null,
          dominantWaveDirection:
            currentData.daily.wave_direction_dominant?.[0] || null,
        }
      : {};

    // Determine data source and location context
    const dataSource = currentData.data_source || "marine";
    const locationContext = this._getLocationContext(location);

    // Extract historical patterns if available
    const historicalSummary = historicalData
      ? `Data historis tersedia untuk perbandingan`
      : `Data historis tidak tersedia - menggunakan analisis kondisi saat ini`;

    return `
Anda adalah sistem deteksi anomali cuaca maritim Indonesia yang menganalisis pola tidak normal untuk keselamatan nelayan.

LOKASI: ${locationContext}
SUMBER DATA: ${
      dataSource === "weather_fallback"
        ? "Estimasi berdasarkan kondisi angin (area pesisir)"
        : "Data marine langsung (laut dalam)"
    }

KONDISI CUACA MARITIM SAAT INI:
- Tinggi gelombang: ${
      currentHour.waveHeight ? `${currentHour.waveHeight}m` : "tidak tersedia"
    }
- Periode gelombang: ${
      currentHour.wavePeriod
        ? `${currentHour.wavePeriod} detik`
        : "tidak tersedia"
    }
- Arah gelombang: ${
      currentHour.waveDirection
        ? `${currentHour.waveDirection}°`
        : "tidak tersedia"
    }
- Tinggi gelombang angin: ${
      currentHour.windWaveHeight
        ? `${currentHour.windWaveHeight}m`
        : "tidak tersedia"
    }
- Tinggi gelombang swell: ${
      currentHour.swellWaveHeight
        ? `${currentHour.swellWaveHeight}m`
        : "tidak tersedia"
    }

KONDISI MAKSIMAL HARI INI:
- Tinggi gelombang maksimal: ${
      currentDaily.maxWaveHeight
        ? `${currentDaily.maxWaveHeight}m`
        : "tidak tersedia"
    }
- Periode gelombang maksimal: ${
      currentDaily.maxWavePeriod
        ? `${currentDaily.maxWavePeriod} detik`
        : "tidak tersedia"
    }
- Arah gelombang dominan: ${
      currentDaily.dominantWaveDirection
        ? `${currentDaily.dominantWaveDirection}°`
        : "tidak tersedia"
    }

DATA HISTORIS: ${historicalSummary}

TUGAS ANALISIS:
1. Deteksi anomali berdasarkan kondisi gelombang:
   - Gelombang tinggi tidak normal (> 2m untuk perahu kecil, > 4m untuk kapal besar)
   - Perubahan arah gelombang drastis (> 90° dalam waktu singkat)
   - Periode gelombang tidak normal (< 2 detik atau > 15 detik)
   - Perbedaan signifikan antara gelombang angin dan swell

2. Analisis pola cuaca untuk ${locationContext}:
   - Kondisi berbahaya untuk jenis perahu tertentu
   - Potensi cuaca buruk berdasarkan tren gelombang
   - Rekomendasi keselamatan spesifik untuk area ini

3. Berikan peringatan yang sesuai dengan kondisi lokal

Berikan respons dalam format JSON berikut:
{
  "alert_level": "RENDAH/SEDANG/TINGGI/KRITIS",
  "detected_anomalies": [
    {
      "type": "wave_height/wave_period/wave_direction/swell_pattern",
      "severity": "LOW/MEDIUM/HIGH",
      "description": "deskripsi anomali yang terdeteksi",
      "current_value": "nilai saat ini",
      "normal_range": "rentang normal untuk ${locationContext}",
      "impact": "dampak terhadap aktivitas nelayan"
    }
  ],
  "prediction": {
    "event_type": "jenis kondisi yang diprediksi",
    "probability": "persentase kemungkinan",
    "estimated_time": "perkiraan waktu kondisi",
    "impact_area": "${locationContext} dan sekitarnya"
  },
  "recommendations": [
    "rekomendasi keselamatan spesifik untuk ${locationContext}",
    "saran untuk jenis perahu yang berbeda"
  ]
}

Fokus pada keselamatan nelayan dan berikan analisis yang relevan untuk ${locationContext}.
`;
  }

  /**
   * Get boat specifications for safety thresholds
   */
  _getBoatSpecifications(boatType) {
    const specs = {
      perahu_kecil: {
        maxWaveHeight: 1.2,
        maxWindSpeed: 20,
        maxGustSpeed: 25,
      },
      kapal_nelayan: {
        maxWaveHeight: 2.0,
        maxWindSpeed: 30,
        maxGustSpeed: 35,
      },
      kapal_besar: {
        maxWaveHeight: 3.5,
        maxWindSpeed: 45,
        maxGustSpeed: 50,
      },
    };

    return specs[boatType] || specs["kapal_nelayan"]; // default to medium boat
  }

  /**
   * Fallback explanation when AI is not available
   */
  _getFallbackExplanation(weatherData) {
    const waveHeight = weatherData.waveHeight || 0;
    const windSpeed = weatherData.windSpeed || 0;

    let safetyLevel = "AMAN";
    let explanation = "Kondisi laut dalam batas normal.";

    if (waveHeight > 2.5 || windSpeed > 30) {
      safetyLevel = "BERBAHAYA";
      explanation =
        "Kondisi laut cukup berbahaya dengan gelombang tinggi atau angin kencang.";
    } else if (waveHeight > 1.5 || windSpeed > 20) {
      safetyLevel = "HATI-HATI";
      explanation = "Kondisi laut memerlukan kehati-hatian ekstra.";
    }

    return {
      explanation,
      safety_level: safetyLevel,
      simple_advice: "Selalu periksa kondisi cuaca sebelum berlayar.",
      local_context: "Kondisi dapat berubah sewaktu-waktu.",
      technical_summary: `Gelombang: ${waveHeight}m, Angin: ${windSpeed} km/h`,
    };
  }

  /**
   * Fallback time recommendations when AI is not available
   */
  _getFallbackTimeRecommendations(forecastData, boatType) {
    return {
      boat_type: boatType,
      safe_windows: [
        {
          start_time: "06:00",
          end_time: "10:00",
          confidence: "SEDANG",
          reason: "Umumnya kondisi laut lebih tenang di pagi hari",
        },
      ],
      avoid_times: [
        {
          start_time: "12:00",
          end_time: "16:00",
          reason: "Cuaca siang hari cenderung lebih tidak stabil",
        },
      ],
      best_recommendation: "Waktu terbaik berlayar: 06:00 - 10:00 WIB",
      general_advice: "Selalu periksa kondisi cuaca terkini sebelum berangkat",
    };
  }

  /**
   * Fallback anomaly detection when AI is not available
   */
  _getFallbackAnomalyDetection(currentData) {
    return {
      alert_level: "RENDAH",
      detected_anomalies: [],
      prediction: {
        event_type: "Tidak ada anomali terdeteksi",
        probability: "0%",
        estimated_time: "N/A",
        impact_area: "N/A",
      },
      recommendations: [
        "Pantau terus kondisi cuaca",
        "Siapkan peralatan keselamatan",
      ],
    };
  }
}

module.exports = new GeminiService();
