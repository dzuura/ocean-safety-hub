# ⚖️ Sistem Prediksi Keamanan - Referensi API

## 📋 Ringkasan

Sistem Prediksi Keamanan menyediakan analisis keamanan berlayar berbasis algoritma dengan penilaian kuantitatif untuk berbagai jenis perahu.

---

## 🎯 Endpoint

### 1. Analisis Keamanan

**`GET /api/safety/analyze`**

Menganalisis tingkat keamanan berlayar untuk lokasi tertentu.

#### Parameter

| Parameter       | Tipe    | Wajib | Deskripsi                                                                 |
| --------------- | ------- | ----- | ------------------------------------------------------------------------- |
| `latitude`      | float   | ✅    | Latitude (-90 sampai 90)                                                  |
| `longitude`     | float   | ✅    | Longitude (-180 sampai 180)                                               |
| `boat_type`     | string  | ❌    | `perahu_kecil`, `kapal_nelayan`, `kapal_besar` (default: `kapal_nelayan`) |
| `timezone`      | string  | ❌    | Timezone (default: deteksi otomatis)                                      |
| `forecast_days` | integer | ❌    | Hari prediksi (default: 1)                                                |

#### Contoh Request

```bash
GET /api/safety/analyze?latitude=-8.2088&longitude=106.8456&boat_type=kapal_nelayan
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Analisis keamanan berhasil",
  "data": {
    "boat_type": "kapal_nelayan",
    "location": {
      "latitude": -8.2088,
      "longitude": 106.8456
    },
    "analysis_time": "2025-07-24T10:30:00Z",
    "current_conditions": {
      "conditions": {
        "wave_height": 1.8,
        "wind_speed": 15,
        "wave_period": 5.2,
        "visibility": 5000,
        "weather_code": 0,
        "precipitation": 0
      },
      "evaluation": {
        "wave_height": {
          "status": "safe",
          "score": 90,
          "message": "Kondisi aman",
          "value": 1.8,
          "threshold": 2.5
        },
        "wind_speed": {
          "status": "safe",
          "score": 85,
          "message": "Kondisi aman",
          "value": 15,
          "threshold": 35
        }
      },
      "safety_score": 80,
      "safety_level": "AMAN",
      "timestamp": "2025-07-24T10:30:00Z"
    },
    "forecast_24h": {
      "periods": [
        {
          "time_range": {
            "start": "2025-07-24T10:00",
            "end": "2025-07-24T16:00"
          },
          "safety_score": 75,
          "safety_level": "HATI-HATI"
        }
      ],
      "worst_conditions": {
        "safety_score": 65,
        "safety_level": "HATI-HATI"
      },
      "average_safety_score": 76,
      "safety_trend": "stable"
    },
    "overall_safety": {
      "score": 76,
      "level": "HATI-HATI",
      "confidence": 85
    },
    "recommendations": [
      {
        "type": "caution",
        "message": "Kondisi dapat berlayar dengan perhatian ekstra",
        "action": "Pantau cuaca secara berkala dan siapkan rencana darurat"
      },
      {
        "type": "boat_specific",
        "message": "Kapal nelayan dapat menangani kondisi ini dengan baik",
        "action": "Tetap waspada terhadap perubahan cuaca"
      }
    ],
    "thresholds_used": {
      "wave_height_max": 2.5,
      "wind_speed_max": 35,
      "wave_period_min": 3,
      "visibility_min": 500
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 2. Zona Keamanan

**`GET /api/safety/zones`**

Menganalisis zona keamanan dalam area tertentu menggunakan grid analysis.

#### Parameter

| Parameter    | Tipe    | Wajib | Deskripsi                              |
| ------------ | ------- | ----- | -------------------------------------- |
| `center_lat` | float   | ✅    | Latitude pusat (-90 sampai 90)         |
| `center_lng` | float   | ✅    | Longitude pusat (-180 sampai 180)      |
| `radius`     | float   | ❌    | Radius dalam km (1-200, default: 50)   |
| `grid_size`  | integer | ❌    | Ukuran grid (3-10, default: 5)         |
| `boat_type`  | string  | ❌    | Jenis kapal (default: `kapal_nelayan`) |

#### Contoh Request

```bash
GET /api/safety/zones?center_lat=-8.2&center_lng=106.8&radius=25&grid_size=3&boat_type=kapal_nelayan
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Zona keamanan berhasil dianalisis",
  "data": {
    "center": {
      "latitude": -8.2,
      "longitude": 106.8
    },
    "radius_km": 25,
    "grid_size": 3,
    "boat_type": "kapal_nelayan",
    "analysis_time": "2025-07-24T10:30:00Z",
    "zones": [
      {
        "latitude": -8.4,
        "longitude": 106.6,
        "safety_score": 78,
        "safety_level": "HATI-HATI",
        "data_source": "marine"
      },
      {
        "latitude": -8.4,
        "longitude": 106.8,
        "safety_score": 82,
        "safety_level": "AMAN",
        "data_source": "marine"
      }
    ],
    "statistics": {
      "total_zones": 9,
      "safe_zones": 4,
      "caution_zones": 3,
      "risk_zones": 2,
      "danger_zones": 0,
      "average_safety_score": 76,
      "safety_distribution": {
        "safe_percentage": 44,
        "caution_percentage": 33,
        "risk_percentage": 22,
        "danger_percentage": 0
      }
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 3. Rekomendasi Rute

**`GET /api/safety/route`**

Menganalisis keamanan rute antara dua titik dengan waypoint analysis.

#### Parameter

| Parameter   | Tipe    | Wajib | Deskripsi                              |
| ----------- | ------- | ----- | -------------------------------------- |
| `start_lat` | float   | ✅    | Latitude awal                          |
| `start_lng` | float   | ✅    | Longitude awal                         |
| `end_lat`   | float   | ✅    | Latitude akhir                         |
| `end_lng`   | float   | ✅    | Longitude akhir                        |
| `boat_type` | string  | ❌    | Jenis kapal (default: `kapal_nelayan`) |
| `waypoints` | integer | ❌    | Jumlah waypoint (1-10, default: 5)     |

#### Contoh Request

```bash
GET /api/safety/route?start_lat=-8.2&start_lng=106.8&end_lat=-8.0&end_lng=107.0&boat_type=kapal_nelayan&waypoints=3
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Rekomendasi rute berhasil dianalisis",
  "data": {
    "route": {
      "start": {
        "latitude": -8.2,
        "longitude": 106.8
      },
      "end": {
        "latitude": -8.0,
        "longitude": 107.0
      },
      "distance_km": 28.5
    },
    "boat_type": "kapal_nelayan",
    "analysis_time": "2025-07-24T10:30:00Z",
    "waypoints": [
      {
        "latitude": -8.2,
        "longitude": 106.8,
        "waypoint_index": 0,
        "distance_from_start": 0,
        "safety_score": 76,
        "safety_level": "HATI-HATI",
        "recommendations": []
      },
      {
        "latitude": -8.133,
        "longitude": 106.867,
        "waypoint_index": 1,
        "distance_from_start": 0.33,
        "safety_score": 78,
        "safety_level": "HATI-HATI",
        "recommendations": []
      },
      {
        "latitude": -8.067,
        "longitude": 106.933,
        "waypoint_index": 2,
        "distance_from_start": 0.67,
        "safety_score": 74,
        "safety_level": "HATI-HATI",
        "recommendations": []
      },
      {
        "latitude": -8.0,
        "longitude": 107.0,
        "waypoint_index": 3,
        "distance_from_start": 1,
        "safety_score": 72,
        "safety_level": "HATI-HATI",
        "recommendations": []
      }
    ],
    "overall_safety": {
      "average_score": 75,
      "minimum_score": 72,
      "worst_point": {
        "latitude": -8.0,
        "longitude": 107.0,
        "safety_score": 72
      },
      "overall_level": "HATI-HATI"
    },
    "route_recommendations": [
      {
        "type": "warning",
        "message": "1 titik berisiko ditemukan di rute",
        "action": "Berlayar dengan sangat hati-hati di area tersebut",
        "affected_waypoints": [3]
      }
    ]
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 📊 Level & Skor Keamanan

### Rentang Skor

| Skor   | Level       | Deskripsi                  | Rekomendasi                   |
| ------ | ----------- | -------------------------- | ----------------------------- |
| 90-100 | SANGAT AMAN | Kondisi ideal              | Lanjutkan dengan percaya diri |
| 80-89  | AMAN        | Aman untuk berlayar        | Tindakan pencegahan normal    |
| 60-79  | HATI-HATI   | Lanjutkan dengan hati-hati | Kewaspadaan ekstra diperlukan |
| 40-59  | BERISIKO    | Risiko tinggi              | Pertimbangkan menunda         |
| 0-39   | BERBAHAYA   | Berbahaya                  | Jangan berlayar               |

### Parameter Evaluasi

- **Tinggi Gelombang**: Faktor keamanan utama
- **Kecepatan Angin**: Faktor keamanan sekunder
- **Periode Gelombang**: Indikator kualitas gelombang
- **Visibilitas**: Keamanan navigasi
- **Kode Cuaca**: Kondisi cuaca umum
- **Curah Hujan**: Faktor risiko tambahan

---

## 🚨 Response Error

### Error Validasi (400)

```json
{
  "success": false,
  "error": "Parameter tidak valid",
  "details": {
    "latitude": "Latitude harus berupa angka antara -90 dan 90"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error Server (500)

```json
{
  "success": false,
  "error": "Terjadi kesalahan saat menganalisis keamanan",
  "details": "Weather service unavailable",
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Batas Rate & Performa

- **Batas Rate**: 100 request per menit per IP
- **Waktu Response**: 0.5-3 detik tergantung kompleksitas
- **Durasi Cache**: Data cuaca di-cache selama 10 menit
- **Request Bersamaan**: Dibatasi untuk mencegah overload API

---

_Terakhir diperbarui: Juli 2025_
