const weatherService = require('../services/weatherService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('WeatherService', () => {
  beforeEach(() => {
    // Clear cache before each test
    weatherService.clearCache();
    jest.clearAllMocks();
  });

  describe('getMarineWeather', () => {
    it('should fetch marine weather data successfully', async () => {
      const mockResponse = {
        data: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: 'Asia/Jakarta',
          hourly: {
            wave_height: [1.2, 1.5, 1.8],
            wave_direction: [180, 185, 190],
            wave_period: [8, 9, 10],
          },
          daily: {
            wave_height_max: [2.0, 2.2, 2.5],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getMarineWeather(-6.2088, 106.8456);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/marine'),
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: -6.2088,
            longitude: 106.8456,
          }),
          timeout: 10000,
        })
      );

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('hourly');
      expect(result).toHaveProperty('daily');
      expect(result.location.latitude).toBe(-6.2088);
      expect(result.location.longitude).toBe(106.8456);
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        weatherService.getMarineWeather(-6.2088, 106.8456)
      ).rejects.toThrow('Gagal mengambil data cuaca laut');
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = {
        data: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: 'Asia/Jakarta',
          hourly: { wave_height: [1.2] },
          daily: { wave_height_max: [2.0] },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // First request
      await weatherService.getMarineWeather(-6.2088, 106.8456);
      
      // Second request (should use cache)
      await weatherService.getMarineWeather(-6.2088, 106.8456);

      // Should only call API once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather data successfully', async () => {
      const mockResponse = {
        data: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: 'Asia/Jakarta',
          elevation: 8,
          current: {
            temperature_2m: 28.5,
            wind_speed_10m: 12.3,
            weather_code: 1,
          },
          current_units: {
            temperature_2m: '°C',
            wind_speed_10m: 'km/h',
          },
          hourly: {
            temperature_2m: [28.5, 29.0, 29.5],
            wind_speed_10m: [12.3, 13.1, 14.2],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getCurrentWeather(-6.2088, 106.8456);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/forecast'),
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: -6.2088,
            longitude: 106.8456,
          }),
          timeout: 10000,
        })
      );

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('hourly');
      expect(result).toHaveProperty('units');
      expect(result.current.temperature_2m).toBe(28.5);
    });
  });

  describe('getCompleteWeather', () => {
    it('should fetch both marine and current weather data', async () => {
      const marineResponse = {
        data: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: 'Asia/Jakarta',
          hourly: { wave_height: [1.2] },
          daily: { wave_height_max: [2.0] },
        },
      };

      const currentResponse = {
        data: {
          latitude: -6.2088,
          longitude: 106.8456,
          timezone: 'Asia/Jakarta',
          elevation: 8,
          current: { temperature_2m: 28.5 },
          current_units: { temperature_2m: '°C' },
          hourly: { temperature_2m: [28.5] },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(marineResponse)
        .mockResolvedValueOnce(currentResponse);

      const result = await weatherService.getCompleteWeather(-6.2088, 106.8456);

      expect(result).toHaveProperty('marine');
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('timestamp');
      
      // Should call both marine and forecast endpoints
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache functionality', () => {
    it('should clear cache successfully', () => {
      weatherService.clearCache();
      const stats = weatherService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      const stats = weatherService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('timeout');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.timeout).toBe('number');
    });
  });
});
