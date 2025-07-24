# 🌊 Weather API - Referensi Lengkap

## 📋 Ringkasan

API Cuaca menyediakan data cuaca maritim real-time dan forecast untuk keselamatan berlayar, termasuk gelombang, angin, dan kondisi laut dari Open Meteo API.

---

## 🎯 Endpoint Cuaca

### 1. Data Cuaca Maritim
**`GET /api/weather/marine`**

Mendapatkan data cuaca maritim khusus untuk pelayaran.

#### Parameter Query
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude (-90 sampai 90) |
| `longitude` | float | ✅ | Koordinat longitude (-180 sampai 180) |
| `timezone` | string | ❌ | WIB/WITA/WIT atau timezone lengkap |
| `forecast_days` | integer | ❌ | Jumlah hari forecast (1-16, recommend max 7) |
| `forecast_hours` | integer | ❌ | Jumlah jam forecast (1-384) |
| `historical_days` | integer | ❌ | Jumlah hari data historis (1-92) |

#### Contoh Request
```bash
GET /api/weather/marine?latitude=-6.1344&longitude=106.8446&timezone=WIB&forecast_days=3
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "timezone": "Asia/Jakarta",
      "timezone_abbreviation": "WIB"
    },
    "current": {
      "time": "2025-07-24T10:30:00Z",
      "wave_height": 1.2,
      "wave_direction": 180,
      "wave_period": 8.5,
      "wind_wave_height": 0.8,
      "wind_wave_direction": 175,
      "wind_wave_period": 6.2,
      "swell_wave_height": 0.4,
      "swell_wave_direction": 185,
      "swell_wave_period": 12.0
    },
    "hourly": {
      "time": ["2025-07-24T11:00:00Z", "2025-07-24T12:00:00Z"],
      "wave_height": [1.3, 1.4],
      "wave_direction": [182, 185],
      "wave_period": [8.7, 9.0],
      "wind_wave_height": [0.9, 1.0],
      "wind_wave_direction": [178, 180],
      "wind_wave_period": [6.5, 6.8]
    },
    "daily": {
      "time": ["2025-07-24", "2025-07-25", "2025-07-26"],
      "wave_height_max": [1.8, 2.1, 1.9],
      "wave_direction_dominant": [180, 185, 175],
      "wave_period_max": [10.2, 11.5, 9.8]
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 2. Data Cuaca Umum
**`GET /api/weather/current`**

Mendapatkan data cuaca umum (suhu, angin, tekanan).

#### Parameter Query
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude |
| `longitude` | float | ✅ | Koordinat longitude |
| `timezone` | string | ❌ | Timezone |
| `forecast_days` | integer | ❌ | Jumlah hari forecast |

#### Contoh Request
```bash
GET /api/weather/current?latitude=-6.1344&longitude=106.8446&forecast_days=2
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "timezone": "Asia/Jakarta"
    },
    "current": {
      "time": "2025-07-24T10:30:00Z",
      "temperature_2m": 28.5,
      "relative_humidity_2m": 75,
      "apparent_temperature": 32.1,
      "is_day": 1,
      "precipitation": 0.0,
      "rain": 0.0,
      "showers": 0.0,
      "snowfall": 0.0,
      "weather_code": 1,
      "cloud_cover": 25,
      "pressure_msl": 1013.2,
      "surface_pressure": 1011.8,
      "wind_speed_10m": 12.5,
      "wind_direction_10m": 180,
      "wind_gusts_10m": 18.2
    },
    "hourly": {
      "time": ["2025-07-24T11:00:00Z", "2025-07-24T12:00:00Z"],
      "temperature_2m": [29.0, 29.5],
      "relative_humidity_2m": [73, 71],
      "precipitation_probability": [10, 15],
      "wind_speed_10m": [13.0, 14.2],
      "wind_direction_10m": [182, 185]
    },
    "daily": {
      "time": ["2025-07-24", "2025-07-25"],
      "weather_code": [1, 2],
      "temperature_2m_max": [31.5, 30.8],
      "temperature_2m_min": [26.2, 25.9],
      "precipitation_sum": [0.0, 2.5],
      "wind_speed_10m_max": [16.8, 18.5],
      "wind_direction_10m_dominant": [180, 185]
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 3. Data Cuaca Lengkap
**`GET /api/weather/complete`**

Mendapatkan kombinasi data cuaca maritim dan umum.

#### Parameter Query
Sama dengan endpoint marine dan current.

#### Contoh Request
```bash
GET /api/weather/complete?latitude=-6.1344&longitude=106.8446&forecast_days=1
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "timezone": "Asia/Jakarta",
      "timezone_abbreviation": "WIB"
    },
    "marine": {
      "current": {
        "wave_height": 1.2,
        "wave_direction": 180,
        "wave_period": 8.5
      },
      "hourly": {
        "time": ["2025-07-24T11:00:00Z"],
        "wave_height": [1.3],
        "wave_direction": [182]
      }
    },
    "weather": {
      "current": {
        "temperature_2m": 28.5,
        "wind_speed_10m": 12.5,
        "wind_direction_10m": 180,
        "weather_code": 1
      },
      "hourly": {
        "time": ["2025-07-24T11:00:00Z"],
        "temperature_2m": [29.0],
        "wind_speed_10m": [13.0]
      }
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Cache Management

### 4. Statistik Cache
**`GET /api/weather/cache/stats`**

Mendapatkan statistik penggunaan cache weather service.

#### Contoh Request
```bash
GET /api/weather/cache/stats
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "cache_stats": {
      "total_requests": 1250,
      "cache_hits": 875,
      "cache_misses": 375,
      "hit_rate": 70.0,
      "cache_size": 45,
      "max_cache_size": 100
    },
    "performance": {
      "avg_response_time_ms": 125,
      "avg_cache_response_time_ms": 15,
      "avg_api_response_time_ms": 450
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 5. Clear Cache
**`DELETE /api/weather/cache`**

Menghapus semua cache weather service.

#### Contoh Request
```bash
DELETE /api/weather/cache
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Weather cache cleared successfully",
  "data": {
    "cleared_entries": 45,
    "cache_size_before": 45,
    "cache_size_after": 0
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 📊 Weather Codes

### Kode Cuaca WMO
| Code | Deskripsi |
|------|-----------|
| 0 | Cerah |
| 1 | Sebagian berawan |
| 2 | Berawan |
| 3 | Mendung |
| 45 | Berkabut |
| 48 | Kabut tebal |
| 51 | Gerimis ringan |
| 53 | Gerimis sedang |
| 55 | Gerimis lebat |
| 61 | Hujan ringan |
| 63 | Hujan sedang |
| 65 | Hujan lebat |
| 80 | Hujan shower ringan |
| 81 | Hujan shower sedang |
| 82 | Hujan shower lebat |
| 95 | Badai petir |
| 96 | Badai petir dengan hujan es ringan |
| 99 | Badai petir dengan hujan es lebat |

---

## 🌊 Parameter Maritim

### Wave Height (Tinggi Gelombang)
- **Rentang**: 0-20+ meter
- **Kategori**:
  - 0-0.5m: Sangat tenang
  - 0.5-1.25m: Tenang
  - 1.25-2.5m: Sedang
  - 2.5-4m: Agak kasar
  - 4-6m: Kasar
  - 6m+: Sangat kasar

### Wave Direction (Arah Gelombang)
- **Rentang**: 0-360 derajat
- **0°**: Utara, **90°**: Timur, **180°**: Selatan, **270°**: Barat

### Wave Period (Periode Gelombang)
- **Rentang**: 1-30+ detik
- **Kategori**:
  - 1-5s: Gelombang pendek (wind waves)
  - 5-10s: Gelombang sedang
  - 10-20s: Gelombang panjang (swell)
  - 20s+: Gelombang sangat panjang

---

## 🚨 Response Error

### Error Parameter (400)
```json
{
  "success": false,
  "error": "Parameter tidak valid",
  "details": {
    "latitude": "Latitude harus berupa angka antara -90 dan 90",
    "longitude": "Longitude diperlukan"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error API External (502)
```json
{
  "success": false,
  "error": "Weather service temporarily unavailable",
  "details": {
    "service": "Open Meteo API",
    "status": "timeout"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Best Practices

### 1. Timezone Handling
```javascript
// Auto-detect timezone berdasarkan koordinat
const response = await fetch('/api/weather/marine?latitude=-6.1344&longitude=106.8446');

// Atau specify timezone manual
const response = await fetch('/api/weather/marine?latitude=-6.1344&longitude=106.8446&timezone=WIB');
```

### 2. Optimal Parameters
```javascript
// Untuk aplikasi mobile - data minimal
const params = {
  latitude: -6.1344,
  longitude: 106.8446,
  forecast_days: 3, // Maksimal 3 hari untuk performa optimal
  forecast_hours: 72 // 3 hari x 24 jam
};

// Untuk dashboard - data lengkap
const params = {
  latitude: -6.1344,
  longitude: 106.8446,
  forecast_days: 7,
  historical_days: 7
};
```

### 3. Error Handling
```javascript
try {
  const response = await fetch('/api/weather/marine?' + new URLSearchParams(params));
  const data = await response.json();
  
  if (!data.success) {
    console.error('Weather API Error:', data.error);
    if (data.details) {
      console.error('Details:', data.details);
    }
    return;
  }
  
  // Process weather data
  const currentWaveHeight = data.data.current.wave_height;
  
} catch (error) {
  console.error('Network error:', error);
}
```

### 4. Cache Optimization
```javascript
// Check cache stats untuk monitoring
const cacheStats = await fetch('/api/weather/cache/stats');
const stats = await cacheStats.json();

if (stats.data.cache_stats.hit_rate < 50) {
  console.warn('Low cache hit rate, consider adjusting cache strategy');
}

// Clear cache jika diperlukan (admin only)
if (needsCacheRefresh) {
  await fetch('/api/weather/cache', { method: 'DELETE' });
}
```

---

## 📈 Performance Tips

### 1. Request Optimization
- Gunakan `forecast_days` maksimal 7 untuk performa optimal
- Batasi `forecast_hours` sesuai kebutuhan
- Hindari `historical_days` > 7 kecuali diperlukan

### 2. Caching Strategy
- Data di-cache selama 10 menit untuk current weather
- Forecast data di-cache selama 1 jam
- Cache otomatis cleared setiap 24 jam

### 3. Rate Limiting
- Open Meteo Free Tier: 10,000 calls/day
- Recommended: Maksimal 1 request per menit per lokasi
- Gunakan cache untuk mengurangi API calls

---

_Terakhir diperbarui: Juli 2025_
