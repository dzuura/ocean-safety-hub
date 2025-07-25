const weatherService = require("../services/weatherService");
const SafetyAnalyzer = require("../services/safetyAnalyzer");

class SafetyController {
  constructor() {
    this.safetyAnalyzer = new SafetyAnalyzer();
  }

  // Menganalisis tingkat keamanan berlayar untuk lokasi tertentu
  analyzeSafety = async (req, res) => {
    try {
      const { latitude, longitude, boat_type = "kapal_nelayan" } = req.query;

      // Validasi parameter wajib
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            latitude: !latitude ? "Latitude diperlukan" : null,
            longitude: !longitude ? "Longitude diperlukan" : null,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validasi range koordinat
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            latitude: "Latitude harus berupa angka antara -90 dan 90",
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            longitude: "Longitude harus berupa angka antara -180 dan 180",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Validasi jenis perahu
      const validBoatTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];
      if (!validBoatTypes.includes(boat_type)) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            boat_type:
              "Jenis perahu harus: perahu_kecil, kapal_nelayan, atau kapal_besar",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Opsi tambahan
      const options = {
        timezone: req.query.timezone,
        forecast_days: req.query.forecast_days
          ? parseInt(req.query.forecast_days)
          : 1,
      };

      console.log("Analyzing safety conditions", {
        latitude: lat,
        longitude: lng,
        boat_type,
        options,
      });

      // Ambil data cuaca lengkap (marine + weather)
      const weatherData = await weatherService.getCompleteWeather(
        lat,
        lng,
        options
      );

      console.log("Weather data result:", {
        hasData: !!weatherData,
        hasMarineData: !!weatherData?.marine,
        hasWeatherData: !!weatherData?.weather,
      });

      if (!weatherData || !weatherData.marine || !weatherData.weather) {
        return res.status(500).json({
          success: false,
          error: "Gagal mengambil data cuaca untuk analisis keamanan",
          details: "Data cuaca tidak lengkap",
          timestamp: new Date().toISOString(),
        });
      }

      // Analisis keamanan menggunakan SafetyAnalyzer
      const safetyAnalysis = this.safetyAnalyzer.analyzeSafety(
        weatherData.marine,
        boat_type,
        options
      );

      if (!safetyAnalysis || !safetyAnalysis.success) {
        return res.status(500).json({
          success: false,
          error:
            (safetyAnalysis && safetyAnalysis.error) ||
            "Gagal menganalisis keamanan",
          timestamp: new Date().toISOString(),
        });
      }

      // Tambahkan informasi cuaca umum ke response
      const response = {
        ...safetyAnalysis.data,
        weather_data: {
          marine: {
            data_source: weatherData.marine?.data_source || "unknown",
            location: weatherData.marine?.location || null,
          },
          weather: {
            current: weatherData.weather?.current || null,
            location: weatherData.weather?.location || null,
          },
        },
      };

      console.log("Safety analysis completed successfully", {
        safety_level: response.overall_safety?.level || "unknown",
        safety_score: response.overall_safety?.score || 0,
      });

      return res.status(200).json({
        success: true,
        message: "Analisis keamanan berhasil",
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in safety analysis:", error);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat menganalisis keamanan",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan zona keamanan untuk area tertentu
  getSafetyZones = async (req, res) => {
    try {
      const {
        center_lat,
        center_lng,
        radius = 50, // km
        boat_type = "kapal_nelayan",
        grid_size = 5, // jumlah titik per sisi
      } = req.query;

      // Validasi parameter
      if (!center_lat || !center_lng) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            center_lat: !center_lat ? "Center latitude diperlukan" : null,
            center_lng: !center_lng ? "Center longitude diperlukan" : null,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const centerLat = parseFloat(center_lat);
      const centerLng = parseFloat(center_lng);
      const radiusKm = parseFloat(radius);
      const gridSizeNum = parseInt(grid_size);

      // Validasi range
      if (isNaN(centerLat) || centerLat < -90 || centerLat > 90) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            center_lat: "Center latitude harus berupa angka antara -90 dan 90",
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (isNaN(centerLng) || centerLng < -180 || centerLng > 180) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            center_lng:
              "Center longitude harus berupa angka antara -180 dan 180",
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (radiusKm < 1 || radiusKm > 200) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            radius: "Radius harus antara 1-200 km",
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (gridSizeNum < 3 || gridSizeNum > 10) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            grid_size: "Grid size harus antara 3-10",
          },
          timestamp: new Date().toISOString(),
        });
      }

      console.log("Generating safety zones", {
        center: [centerLat, centerLng],
        radius: radiusKm,
        grid_size: gridSizeNum,
        boat_type,
      });

      // Generate grid points
      const gridPoints = this._generateGridPoints(
        centerLat,
        centerLng,
        radiusKm,
        gridSizeNum
      );

      // Analisis keamanan untuk setiap titik
      const safetyZones = [];
      const options = {
        timezone: req.query.timezone,
        forecast_days: 1,
      };

      // Batasi concurrent requests untuk menghindari rate limiting
      const batchSize = 3;
      for (let i = 0; i < gridPoints.length; i += batchSize) {
        const batch = gridPoints.slice(i, i + batchSize);
        const batchPromises = batch.map(async (point) => {
          try {
            // Ambil data cuaca untuk titik ini
            const weatherData = await weatherService.getMarineWeather(
              point.latitude,
              point.longitude,
              options
            );

            if (weatherData) {
              // Analisis keamanan
              const safetyAnalysis = this.safetyAnalyzer.analyzeSafety(
                weatherData,
                boat_type,
                options
              );

              return {
                latitude: point.latitude,
                longitude: point.longitude,
                safety_score: safetyAnalysis.success
                  ? safetyAnalysis.data.overall_safety.score
                  : 50,
                safety_level: safetyAnalysis.success
                  ? safetyAnalysis.data.overall_safety.level
                  : "UNKNOWN",
                data_source: weatherData.data_source || "marine",
              };
            } else {
              return {
                latitude: point.latitude,
                longitude: point.longitude,
                safety_score: 50,
                safety_level: "UNKNOWN",
                data_source: "unavailable",
              };
            }
          } catch (error) {
            Logger.error(
              `Error analyzing point ${point.latitude}, ${point.longitude}:`,
              error
            );
            return {
              latitude: point.latitude,
              longitude: point.longitude,
              safety_score: 50,
              safety_level: "UNKNOWN",
              data_source: "error",
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        safetyZones.push(...batchResults);

        // Delay kecil antar batch untuk menghindari rate limiting
        if (i + batchSize < gridPoints.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Hitung statistik zona
      const zoneStats = this._calculateZoneStatistics(safetyZones);

      const response = {
        center: {
          latitude: centerLat,
          longitude: centerLng,
        },
        radius_km: radiusKm,
        grid_size: gridSizeNum,
        boat_type,
        analysis_time: new Date().toISOString(),
        zones: safetyZones,
        statistics: zoneStats,
      };

      console.log("Safety zones generated successfully", {
        total_zones: safetyZones.length,
        average_safety_score: zoneStats.average_safety_score,
      });

      return res.status(200).json({
        success: true,
        message: "Zona keamanan berhasil dianalisis",
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating safety zones:", error);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat menganalisis zona keamanan",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan rekomendasi rute aman
  getRouteRecommendations = async (req, res) => {
    try {
      const {
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        boat_type = "kapal_nelayan",
        waypoints = 5,
      } = req.query;

      // Validasi parameter
      if (!start_lat || !start_lng || !end_lat || !end_lng) {
        return res.status(400).json({
          success: false,
          error: "Parameter tidak valid",
          details: {
            start_lat: !start_lat ? "Start latitude diperlukan" : null,
            start_lng: !start_lng ? "Start longitude diperlukan" : null,
            end_lat: !end_lat ? "End latitude diperlukan" : null,
            end_lng: !end_lng ? "End longitude diperlukan" : null,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const startLat = parseFloat(start_lat);
      const startLng = parseFloat(start_lng);
      const endLat = parseFloat(end_lat);
      const endLng = parseFloat(end_lng);
      const waypointsNum = parseInt(waypoints);

      // Generate waypoints sepanjang rute
      const routePoints = this._generateRoutePoints(
        startLat,
        startLng,
        endLat,
        endLng,
        waypointsNum
      );

      // Analisis keamanan untuk setiap waypoint
      const routeAnalysis = [];
      const options = {
        timezone: req.query.timezone,
        forecast_days: 1,
      };

      for (const point of routePoints) {
        try {
          const weatherData = await weatherService.getMarineWeather(
            point.latitude,
            point.longitude,
            options
          );

          if (weatherData) {
            const safetyAnalysis = this.safetyAnalyzer.analyzeSafety(
              weatherData,
              boat_type,
              options
            );

            routeAnalysis.push({
              ...point,
              safety_score: safetyAnalysis.success
                ? safetyAnalysis.data.overall_safety.score
                : 50,
              safety_level: safetyAnalysis.success
                ? safetyAnalysis.data.overall_safety.level
                : "UNKNOWN",
              recommendations: safetyAnalysis.success
                ? safetyAnalysis.data.recommendations
                : [],
            });
          }
        } catch (error) {
          Logger.error(
            `Error analyzing route point ${point.latitude}, ${point.longitude}:`,
            error
          );
          routeAnalysis.push({
            ...point,
            safety_score: 50,
            safety_level: "UNKNOWN",
            recommendations: [],
          });
        }

        // Delay kecil untuk menghindari rate limiting
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Hitung skor keamanan rute keseluruhan
      const overallRouteSafety = this._calculateRouteSafety(routeAnalysis);

      const response = {
        route: {
          start: { latitude: startLat, longitude: startLng },
          end: { latitude: endLat, longitude: endLng },
          distance_km: this._calculateDistance(
            startLat,
            startLng,
            endLat,
            endLng
          ),
        },
        boat_type,
        analysis_time: new Date().toISOString(),
        waypoints: routeAnalysis,
        overall_safety: overallRouteSafety,
        route_recommendations:
          this._generateRouteRecommendations(routeAnalysis),
      };

      return res.status(200).json({
        success: true,
        message: "Rekomendasi rute berhasil dianalisis",
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating route recommendations:", error);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat menganalisis rute",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Generate grid points dalam radius tertentu
  _generateGridPoints(centerLat, centerLng, radiusKm, gridSize) {
    const points = [];
    const latRange = radiusKm / 111; // 1 derajat = 111 km
    const lngRange = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const latOffset =
          (i - (gridSize - 1) / 2) * ((2 * latRange) / (gridSize - 1));
        const lngOffset =
          (j - (gridSize - 1) / 2) * ((2 * lngRange) / (gridSize - 1));

        points.push({
          latitude: centerLat + latOffset,
          longitude: centerLng + lngOffset,
        });
      }
    }

    return points;
  }

  // Generate waypoints sepanjang rute
  _generateRoutePoints(startLat, startLng, endLat, endLng, numPoints) {
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
      const ratio = i / numPoints;
      const lat = startLat + (endLat - startLat) * ratio;
      const lng = startLng + (endLng - startLng) * ratio;

      points.push({
        latitude: lat,
        longitude: lng,
        waypoint_index: i,
        distance_from_start: ratio,
      });
    }

    return points;
  }

  // Hitung statistik zona keamanan
  _calculateZoneStatistics(zones) {
    const safeZones = zones.filter((z) => z.safety_level === "AMAN").length;
    const cautionZones = zones.filter(
      (z) => z.safety_level === "HATI-HATI"
    ).length;
    const riskZones = zones.filter((z) => z.safety_level === "BERISIKO").length;
    const dangerZones = zones.filter(
      (z) => z.safety_level === "BERBAHAYA"
    ).length;

    const totalScore = zones.reduce((sum, zone) => sum + zone.safety_score, 0);
    const averageScore = Math.round(totalScore / zones.length);

    return {
      total_zones: zones.length,
      safe_zones: safeZones,
      caution_zones: cautionZones,
      risk_zones: riskZones,
      danger_zones: dangerZones,
      average_safety_score: averageScore,
      safety_distribution: {
        safe_percentage: Math.round((safeZones / zones.length) * 100),
        caution_percentage: Math.round((cautionZones / zones.length) * 100),
        risk_percentage: Math.round((riskZones / zones.length) * 100),
        danger_percentage: Math.round((dangerZones / zones.length) * 100),
      },
    };
  }

  // Hitung keamanan rute keseluruhan
  _calculateRouteSafety(routeAnalysis) {
    const totalScore = routeAnalysis.reduce(
      (sum, point) => sum + point.safety_score,
      0
    );
    const averageScore = Math.round(totalScore / routeAnalysis.length);

    const minScore = Math.min(...routeAnalysis.map((p) => p.safety_score));
    const worstPoint = routeAnalysis.find((p) => p.safety_score === minScore);

    return {
      average_score: averageScore,
      minimum_score: minScore,
      worst_point: worstPoint,
      overall_level: this._getSafetyLevel(averageScore),
    };
  }

  // Generate rekomendasi untuk rute
  _generateRouteRecommendations(routeAnalysis) {
    const recommendations = [];

    const dangerousPoints = routeAnalysis.filter(
      (p) => p.safety_level === "BERBAHAYA"
    );
    const riskPoints = routeAnalysis.filter(
      (p) => p.safety_level === "BERISIKO"
    );

    if (dangerousPoints.length > 0) {
      recommendations.push({
        type: "critical",
        message: `${dangerousPoints.length} titik berbahaya ditemukan di rute`,
        action: "Pertimbangkan rute alternatif atau tunda perjalanan",
        affected_waypoints: dangerousPoints.map((p) => p.waypoint_index),
      });
    }

    if (riskPoints.length > 0) {
      recommendations.push({
        type: "warning",
        message: `${riskPoints.length} titik berisiko ditemukan di rute`,
        action: "Berlayar dengan sangat hati-hati di area tersebut",
        affected_waypoints: riskPoints.map((p) => p.waypoint_index),
      });
    }

    return recommendations;
  }

  // Hitung jarak antara dua titik (Haversine formula)
  _calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Dalam km, dibulatkan ke 2 desimal
  }

  // Mendapatkan level keamanan berdasarkan skor
  _getSafetyLevel(score) {
    if (score >= 80) return "AMAN";
    if (score >= 60) return "HATI-HATI";
    if (score >= 40) return "BERISIKO";
    return "BERBAHAYA";
  }
}

module.exports = new SafetyController();
