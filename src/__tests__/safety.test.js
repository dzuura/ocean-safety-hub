const request = require("supertest");
const express = require("express");
const SafetyAnalyzer = require("../services/safetyAnalyzer");

// Mock weather service
jest.mock("../services/weatherService", () => ({
  getCompleteWeather: jest.fn(),
  getMarineWeather: jest.fn(),
}));

const weatherService = require("../services/weatherService");

describe("Safety System", () => {
  let safetyAnalyzer;

  beforeEach(() => {
    safetyAnalyzer = new SafetyAnalyzer();
    jest.clearAllMocks();
  });

  describe("SafetyAnalyzer", () => {
    const mockWeatherData = {
      location: {
        latitude: -6.8,
        longitude: 106.8,
        timezone: "Asia/Jakarta",
      },
      current: {
        wind_speed_10m: 15,
        visibility: 5000,
        weather_code: 0,
        precipitation: 0,
        wind_gusts_10m: 20,
      },
      hourly: {
        time: [
          "2025-07-24T00:00",
          "2025-07-24T01:00",
          "2025-07-24T02:00",
          "2025-07-24T03:00",
        ],
        wave_height: [1.2, 1.3, 1.4, 1.5],
        wind_speed_10m: [15, 16, 17, 18],
        wave_period: [5, 5.2, 5.4, 5.6],
        visibility: [5000, 4800, 4600, 4400],
        weather_code: [0, 0, 1, 1],
        precipitation: [0, 0, 0.1, 0.2],
        wind_gusts_10m: [20, 21, 22, 23],
      },
    };

    test("should analyze safety for small boat", () => {
      const result = safetyAnalyzer.analyzeSafety(mockWeatherData, "perahu_kecil");

      expect(result.success).toBe(true);
      expect(result.data.boat_type).toBe("perahu_kecil");
      expect(result.data.current_conditions).toBeDefined();
      expect(result.data.forecast_24h).toBeDefined();
      expect(result.data.overall_safety).toBeDefined();
      expect(result.data.recommendations).toBeDefined();
    });

    test("should analyze safety for fishing boat", () => {
      const result = safetyAnalyzer.analyzeSafety(mockWeatherData, "kapal_nelayan");

      expect(result.success).toBe(true);
      expect(result.data.boat_type).toBe("kapal_nelayan");
      expect(result.data.overall_safety.level).toMatch(/^(AMAN|HATI-HATI|BERISIKO|BERBAHAYA)$/);
    });

    test("should analyze safety for large boat", () => {
      const result = safetyAnalyzer.analyzeSafety(mockWeatherData, "kapal_besar");

      expect(result.success).toBe(true);
      expect(result.data.boat_type).toBe("kapal_besar");
      expect(result.data.overall_safety.score).toBeGreaterThanOrEqual(0);
      expect(result.data.overall_safety.score).toBeLessThanOrEqual(100);
    });

    test("should handle dangerous weather conditions", () => {
      const dangerousWeatherData = {
        ...mockWeatherData,
        current: {
          ...mockWeatherData.current,
          wind_speed_10m: 60, // Very high wind
          weather_code: 95, // Thunderstorm
          precipitation: 15, // Heavy rain
        },
        hourly: {
          ...mockWeatherData.hourly,
          wave_height: [4.0, 4.2, 4.5, 4.8], // Very high waves
          wind_speed_10m: [60, 62, 65, 68],
        },
      };

      const result = safetyAnalyzer.analyzeSafety(dangerousWeatherData, "perahu_kecil");

      expect(result.success).toBe(true);
      expect(result.data.overall_safety.level).toBe("BERBAHAYA");
      expect(result.data.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "critical",
            message: expect.stringContaining("JANGAN BERLAYAR"),
          }),
        ])
      );
    });

    test("should handle safe weather conditions", () => {
      const safeWeatherData = {
        ...mockWeatherData,
        current: {
          ...mockWeatherData.current,
          wind_speed_10m: 10, // Low wind
          weather_code: 0, // Clear sky
          precipitation: 0, // No rain
        },
        hourly: {
          ...mockWeatherData.hourly,
          wave_height: [0.5, 0.6, 0.7, 0.8], // Low waves
          wind_speed_10m: [10, 11, 12, 13],
          wave_period: [6, 6.2, 6.4, 6.6], // Good wave period
        },
      };

      const result = safetyAnalyzer.analyzeSafety(safeWeatherData, "kapal_nelayan");

      expect(result.success).toBe(true);
      expect(result.data.overall_safety.level).toBe("AMAN");
      expect(result.data.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "safe",
            message: expect.stringContaining("aman"),
          }),
        ])
      );
    });

    test("should handle missing weather data gracefully", () => {
      const incompleteWeatherData = {
        location: {
          latitude: -6.8,
          longitude: 106.8,
        },
        hourly: {
          time: ["2025-07-24T00:00"],
          wave_height: [null],
          wind_speed_10m: [null],
        },
      };

      const result = safetyAnalyzer.analyzeSafety(incompleteWeatherData, "kapal_nelayan");

      expect(result.success).toBe(true);
      expect(result.data.current_conditions.evaluation.wave_height.status).toBe("unknown");
    });

    test("should calculate safety trends correctly", () => {
      const trendWeatherData = {
        ...mockWeatherData,
        hourly: {
          ...mockWeatherData.hourly,
          time: Array.from({ length: 24 }, (_, i) => `2025-07-24T${i.toString().padStart(2, '0')}:00`),
          wave_height: Array.from({ length: 24 }, (_, i) => 1.0 + (i * 0.1)), // Increasing waves
          wind_speed_10m: Array.from({ length: 24 }, (_, i) => 10 + (i * 2)), // Increasing wind
          wave_period: Array.from({ length: 24 }, () => 5),
          visibility: Array.from({ length: 24 }, () => 5000),
          weather_code: Array.from({ length: 24 }, () => 0),
          precipitation: Array.from({ length: 24 }, () => 0),
          wind_gusts_10m: Array.from({ length: 24 }, (_, i) => 15 + (i * 2)),
        },
      };

      const result = safetyAnalyzer.analyzeSafety(trendWeatherData, "kapal_nelayan");

      expect(result.success).toBe(true);
      expect(result.data.forecast_24h.safety_trend).toBe("deteriorating");
    });

    test("should provide boat-specific recommendations", () => {
      const result = safetyAnalyzer.analyzeSafety(mockWeatherData, "perahu_kecil");

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "boat_specific",
            message: expect.stringContaining("Perahu kecil"),
          }),
        ])
      );
    });

    test("should handle error cases", () => {
      const result = safetyAnalyzer.analyzeSafety(null, "kapal_nelayan");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Safety API Endpoints", () => {
    let app;

    beforeAll(() => {
      app = express();
      app.use(express.json());
      
      // Mock routes for testing
      const safetyRoutes = require("../routes/safety");
      app.use("/api/safety", safetyRoutes);
    });

    test("GET /api/safety/analyze should return safety analysis", async () => {
      // Mock weather service response
      weatherService.getCompleteWeather.mockResolvedValue({
        success: true,
        data: {
          marine: {
            location: { latitude: -6.8, longitude: 106.8 },
            data_source: "marine",
            hourly: {
              time: ["2025-07-24T00:00"],
              wave_height: [1.2],
              wind_speed_10m: [15],
              wave_period: [5],
            },
          },
          weather: {
            current: {
              wind_speed_10m: 15,
              weather_code: 0,
            },
            location: { latitude: -6.8, longitude: 106.8 },
          },
        },
      });

      const response = await request(app)
        .get("/api/safety/analyze")
        .query({
          latitude: -6.8,
          longitude: 106.8,
          boat_type: "kapal_nelayan",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.boat_type).toBe("kapal_nelayan");
      expect(response.body.data.overall_safety).toBeDefined();
    });

    test("GET /api/safety/analyze should validate required parameters", async () => {
      const response = await request(app)
        .get("/api/safety/analyze")
        .query({
          latitude: -6.8,
          // Missing longitude
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details.longitude).toBeDefined();
    });

    test("GET /api/safety/analyze should validate boat type", async () => {
      const response = await request(app)
        .get("/api/safety/analyze")
        .query({
          latitude: -6.8,
          longitude: 106.8,
          boat_type: "invalid_boat_type",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details.boat_type).toBeDefined();
    });

    test("GET /api/safety/zones should return safety zones", async () => {
      // Mock weather service for multiple calls
      weatherService.getMarineWeather.mockResolvedValue({
        success: true,
        data: {
          data_source: "marine",
          hourly: {
            time: ["2025-07-24T00:00"],
            wave_height: [1.2],
            wind_speed_10m: [15],
            wave_period: [5],
          },
        },
      });

      const response = await request(app)
        .get("/api/safety/zones")
        .query({
          center_lat: -6.8,
          center_lng: 106.8,
          radius: 10,
          grid_size: 3,
          boat_type: "kapal_nelayan",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.zones).toBeDefined();
      expect(response.body.data.statistics).toBeDefined();
      expect(Array.isArray(response.body.data.zones)).toBe(true);
    });

    test("GET /api/safety/route should return route recommendations", async () => {
      // Mock weather service for route analysis
      weatherService.getMarineWeather.mockResolvedValue({
        success: true,
        data: {
          data_source: "marine",
          hourly: {
            time: ["2025-07-24T00:00"],
            wave_height: [1.2],
            wind_speed_10m: [15],
            wave_period: [5],
          },
        },
      });

      const response = await request(app)
        .get("/api/safety/route")
        .query({
          start_lat: -6.8,
          start_lng: 106.8,
          end_lat: -7.0,
          end_lng: 107.0,
          boat_type: "kapal_nelayan",
          waypoints: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.route).toBeDefined();
      expect(response.body.data.waypoints).toBeDefined();
      expect(response.body.data.overall_safety).toBeDefined();
      expect(Array.isArray(response.body.data.waypoints)).toBe(true);
    });

    test("should handle weather service errors gracefully", async () => {
      weatherService.getCompleteWeather.mockResolvedValue({
        success: false,
        error: "Weather service unavailable",
      });

      const response = await request(app)
        .get("/api/safety/analyze")
        .query({
          latitude: -6.8,
          longitude: 106.8,
          boat_type: "kapal_nelayan",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("cuaca");
    });
  });
});
