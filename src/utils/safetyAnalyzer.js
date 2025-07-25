const config = require('../config');
const Logger = require('./logger');

class SafetyAnalyzer {
  constructor() {
    this.thresholds = config.safety;
  }

  // Analisis tinggi gelombang dalam meter
  analyzeWaveHeight(waveHeight) {
    if (waveHeight <= this.thresholds.waveHeight.safe) {
      return {
        level: 'safe',
        color: 'green',
        description: 'Gelombang rendah - Aman untuk berlayar',
        recommendation: 'Kondisi ideal untuk aktivitas maritim',
      };
    } else if (waveHeight <= this.thresholds.waveHeight.moderate) {
      return {
        level: 'moderate',
        color: 'yellow',
        description: 'Gelombang sedang - Perlu kehati-hatian',
        recommendation: 'Berlayar dengan persiapan ekstra dan pantau kondisi',
      };
    } else if (waveHeight <= this.thresholds.waveHeight.dangerous) {
      return {
        level: 'dangerous',
        color: 'orange',
        description: 'Gelombang tinggi - Berbahaya untuk kapal kecil',
        recommendation: 'Hindari berlayar dengan kapal kecil, gunakan kapal besar dengan pengalaman',
      };
    } else {
      return {
        level: 'critical',
        color: 'red',
        description: 'Gelombang sangat tinggi - Sangat berbahaya',
        recommendation: 'JANGAN berlayar! Tunggu hingga kondisi membaik',
      };
    }
  }

  // Analisis kecepatan angin dalam km/jam
  analyzeWindSpeed(windSpeed) {
    if (windSpeed <= this.thresholds.windSpeed.safe) {
      return {
        level: 'safe',
        color: 'green',
        description: 'Angin lemah - Aman untuk berlayar',
        recommendation: 'Kondisi angin ideal untuk berlayar',
      };
    } else if (windSpeed <= this.thresholds.windSpeed.moderate) {
      return {
        level: 'moderate',
        color: 'yellow',
        description: 'Angin sedang - Perlu kehati-hatian',
        recommendation: 'Berlayar dengan persiapan dan pantau arah angin',
      };
    } else if (windSpeed <= this.thresholds.windSpeed.dangerous) {
      return {
        level: 'dangerous',
        color: 'orange',
        description: 'Angin kencang - Berbahaya untuk kapal kecil',
        recommendation: 'Hindari berlayar dengan kapal kecil, gunakan kapal yang lebih besar',
      };
    } else {
      return {
        level: 'critical',
        color: 'red',
        description: 'Angin sangat kencang - Sangat berbahaya',
        recommendation: 'JANGAN berlayar! Cari pelabuhan terdekat untuk berlindung',
      };
    }
  }

  // Analisis kondisi cuaca berdasarkan kode cuaca
  analyzeWeatherCode(weatherCode) {
    // Weather codes berdasarkan WMO standard
    if (weatherCode <= 3) {
      return {
        level: 'safe',
        color: 'green',
        description: 'Cuaca cerah hingga berawan sebagian',
        recommendation: 'Kondisi cuaca baik untuk berlayar',
      };
    } else if (weatherCode <= 48) {
      return {
        level: 'moderate',
        color: 'yellow',
        description: 'Kabut atau kondisi visibilitas terbatas',
        recommendation: 'Berlayar dengan hati-hati, gunakan radar dan GPS',
      };
    } else if (weatherCode <= 67) {
      return {
        level: 'moderate',
        color: 'yellow',
        description: 'Hujan ringan hingga sedang',
        recommendation: 'Berlayar dengan persiapan ekstra, pantau intensitas hujan',
      };
    } else if (weatherCode <= 82) {
      return {
        level: 'dangerous',
        color: 'orange',
        description: 'Hujan lebat atau badai',
        recommendation: 'Hindari berlayar, cari tempat berlindung',
      };
    } else {
      return {
        level: 'critical',
        color: 'red',
        description: 'Badai petir atau kondisi cuaca ekstrem',
        recommendation: 'JANGAN berlayar! Tunggu hingga badai berlalu',
      };
    }
  }

  // Analisis keamanan keseluruhan berdasarkan data cuaca
  analyzeOverallSafety(weatherData) {
    try {
      const analyses = [];
      let overallLevel = 'safe';
      let overallScore = 0;

      // Analisis gelombang jika ada data marine
      if (weatherData.marine && weatherData.marine.hourly) {
        const currentWaveHeight = weatherData.marine.hourly.wave_height?.[0] || 0;
        const waveAnalysis = this.analyzeWaveHeight(currentWaveHeight);
        analyses.push({
          type: 'wave_height',
          value: currentWaveHeight,
          unit: 'm',
          ...waveAnalysis,
        });
        overallScore += this._getLevelScore(waveAnalysis.level);
      }

      // Analisis angin jika ada data weather
      if (weatherData.weather && weatherData.weather.current) {
        const windSpeed = weatherData.weather.current.wind_speed_10m || 0;
        const windAnalysis = this.analyzeWindSpeed(windSpeed);
        analyses.push({
          type: 'wind_speed',
          value: windSpeed,
          unit: 'km/h',
          ...windAnalysis,
        });
        overallScore += this._getLevelScore(windAnalysis.level);

        // Analisis cuaca
        const weatherCode = weatherData.weather.current.weather_code || 0;
        const weatherAnalysis = this.analyzeWeatherCode(weatherCode);
        analyses.push({
          type: 'weather_condition',
          value: weatherCode,
          unit: 'code',
          ...weatherAnalysis,
        });
        overallScore += this._getLevelScore(weatherAnalysis.level);
      }

      // Tentukan level keseluruhan berdasarkan skor rata-rata
      const averageScore = analyses.length > 0 ? overallScore / analyses.length : 0;
      overallLevel = this._getOverallLevel(averageScore);

      const overallAnalysis = this._getOverallAnalysis(overallLevel);

      return {
        overall: {
          level: overallLevel,
          score: averageScore,
          ...overallAnalysis,
        },
        details: analyses,
        timestamp: new Date().toISOString(),
        location: weatherData.location || null,
      };
    } catch (error) {
      Logger.error('Error in analyzeOverallSafety:', error);
      return {
        overall: {
          level: 'unknown',
          color: 'gray',
          description: 'Tidak dapat menganalisis kondisi keamanan',
          recommendation: 'Periksa data cuaca secara manual',
        },
        details: [],
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // Mendapatkan skor berdasarkan level
  _getLevelScore(level) {
    const scores = {
      safe: 1,
      moderate: 2,
      dangerous: 3,
      critical: 4,
    };
    return scores[level] || 0;
  }

  // Mendapatkan level keseluruhan berdasarkan skor rata-rata
  _getOverallLevel(averageScore) {
    if (averageScore <= 1.5) return 'safe';
    if (averageScore <= 2.5) return 'moderate';
    if (averageScore <= 3.5) return 'dangerous';
    return 'critical';
  }

  // Mendapatkan analisis keseluruhan berdasarkan level
  _getOverallAnalysis(level) {
    const analyses = {
      safe: {
        color: 'green',
        description: 'Kondisi aman untuk berlayar',
        recommendation: 'Silakan berlayar dengan tetap waspada',
      },
      moderate: {
        color: 'yellow',
        description: 'Kondisi cukup aman dengan kehati-hatian',
        recommendation: 'Berlayar dengan persiapan ekstra dan pantau kondisi',
      },
      dangerous: {
        color: 'orange',
        description: 'Kondisi berbahaya untuk berlayar',
        recommendation: 'Hindari berlayar atau gunakan kapal yang lebih besar',
      },
      critical: {
        color: 'red',
        description: 'Kondisi sangat berbahaya',
        recommendation: 'JANGAN berlayar! Tunggu hingga kondisi membaik',
      },
    };
    return analyses[level] || analyses.safe;
  }
}

module.exports = new SafetyAnalyzer();
