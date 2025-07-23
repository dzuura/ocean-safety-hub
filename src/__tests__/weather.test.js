const request = require("supertest");
const app = require("../server");
const weatherService = require("../services/weatherService");

// Mock weather service
jest.mock("../services/weatherService");

describe("Weather API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/weather/marine", () => {
    it("should return marine weather data with valid coordinates", async () => {
      const mockWeatherData = {
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: "Asia/Jakarta",
        },
        hourly: {
          wave_height: [1.2, 1.5, 1.8],
          wave_direction: [180, 185, 190],
        },
        daily: {
          wave_height_max: [2.0, 2.2, 2.5],
        },
      };

      weatherService.getMarineWeather.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get("/api/weather/marine")
        .query({
          latitude: -6.2088,
          longitude: 106.8456,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockWeatherData);
      expect(response.body.message).toBe("Data cuaca maritim berhasil diambil");
    });

    it("should return validation error for missing coordinates", async () => {
      const response = await request(app)
        .get("/api/weather/marine")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty("latitude");
      expect(response.body.errors).toHaveProperty("longitude");
    });

    it("should return validation error for invalid latitude", async () => {
      const response = await request(app)
        .get("/api/weather/marine")
        .query({
          latitude: "invalid",
          longitude: 106.8456,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty("latitude");
    });

    it("should return validation error for out of range coordinates", async () => {
      const response = await request(app)
        .get("/api/weather/marine")
        .query({
          latitude: 95, // Invalid: > 90
          longitude: 106.8456,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty("latitude");
    });
  });

  describe("GET /api/weather/current", () => {
    it("should return current weather data with valid coordinates", async () => {
      const mockWeatherData = {
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: "Asia/Jakarta",
        },
        current: {
          temperature_2m: 28.5,
          wind_speed_10m: 12.3,
          weather_code: 1,
        },
        units: {
          temperature_2m: "°C",
          wind_speed_10m: "km/h",
        },
      };

      weatherService.getCurrentWeather.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get("/api/weather/current")
        .query({
          latitude: -6.2088,
          longitude: 106.8456,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockWeatherData);
      expect(response.body.message).toBe(
        "Data cuaca saat ini berhasil diambil"
      );
    });
  });

  describe("GET /api/weather/complete", () => {
    it("should return complete weather data", async () => {
      const mockCompleteData = {
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: "Asia/Jakarta",
        },
        marine: {
          hourly: { wave_height: [1.2] },
        },
        weather: {
          current: { temperature_2m: 28.5 },
        },
      };

      weatherService.getCompleteWeather.mockResolvedValue(mockCompleteData);

      const response = await request(app)
        .get("/api/weather/complete")
        .query({
          latitude: -6.2088,
          longitude: 106.8456,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCompleteData);
      expect(response.body.message).toBe("Data cuaca lengkap berhasil diambil");
    });
  });

  describe("GET /api/weather/cache/stats", () => {
    it("should return cache statistics", async () => {
      const mockStats = {
        size: 5,
        timeout: 300000,
      };

      weatherService.getCacheStats.mockReturnValue(mockStats);

      const response = await request(app)
        .get("/api/weather/cache/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
    });
  });

  describe("DELETE /api/weather/cache", () => {
    it("should clear cache successfully", async () => {
      weatherService.clearCache.mockReturnValue();

      const response = await request(app)
        .delete("/api/weather/cache")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Cache berhasil dibersihkan");
      expect(weatherService.clearCache).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle service errors gracefully", async () => {
      weatherService.getMarineWeather.mockRejectedValue(
        new Error("API service unavailable")
      );

      const response = await request(app)
        .get("/api/weather/marine")
        .query({
          latitude: -6.2088,
          longitude: 106.8456,
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("API service unavailable");
    });
  });
});
