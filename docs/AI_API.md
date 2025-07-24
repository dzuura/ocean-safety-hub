# 🤖 AI API - Referensi Lengkap

## 📋 Ringkasan

API AI menyediakan fitur-fitur cerdas berbasis Google Gemini AI untuk analisis kondisi laut, rekomendasi waktu berlayar, dan deteksi anomali cuaca dengan penjelasan dalam bahasa natural.

---

## 🎯 Endpoint AI Features

### 1. Penjelasan Kondisi Laut
**`POST /api/ai/explain-conditions`**

Mendapatkan penjelasan kondisi laut dalam bahasa natural yang mudah dipahami.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude (-90 sampai 90) |
| `longitude` | float | ✅ | Koordinat longitude (-180 sampai 180) |
| `boat_type` | string | ❌ | Jenis perahu: perahu_kecil, kapal_nelayan, kapal_besar |
| `trip_purpose` | string | ❌ | Tujuan: fishing, transport, recreation, emergency |
| `language` | string | ❌ | Bahasa: id (default), en |

#### Contoh Request
```bash
POST /api/ai/explain-conditions
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -6.1344,
  "longitude": 106.8446,
  "boat_type": "kapal_nelayan",
  "trip_purpose": "fishing",
  "language": "id"
}
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "area_name": "Perairan Jakarta Utara"
    },
    "weather_summary": {
      "wave_height": 1.2,
      "wind_speed": 12.5,
      "weather_condition": "Berawan",
      "overall_safety": "Aman dengan perhatian"
    },
    "ai_explanation": {
      "condition_summary": "Kondisi laut saat ini cukup baik untuk aktivitas penangkapan ikan menggunakan kapal nelayan. Tinggi gelombang 1.2 meter masih dalam batas aman, dengan angin bertiup dari arah selatan dengan kecepatan 12.5 km/jam.",
      "safety_advice": "Disarankan untuk tetap menggunakan pelampung keselamatan dan memantau perubahan cuaca. Kondisi berawan dapat berubah menjadi hujan, jadi siapkan perlengkapan anti hujan.",
      "best_practices": [
        "Gunakan pelampung keselamatan untuk semua penumpang",
        "Bawa alat komunikasi darurat",
        "Pantau prakiraan cuaca setiap 2 jam",
        "Siapkan perlengkapan anti hujan"
      ],
      "risk_factors": [
        "Kemungkinan hujan ringan dalam 2-3 jam ke depan",
        "Angin dapat meningkat hingga 15-18 km/jam sore hari"
      ]
    },
    "confidence_score": 85,
    "generated_at": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 2. Rekomendasi Waktu Berlayar
**`POST /api/ai/recommend-times`**

Mendapatkan rekomendasi waktu terbaik untuk berlayar berdasarkan jenis perahu dan kondisi cuaca.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude |
| `longitude` | float | ✅ | Koordinat longitude |
| `boat_type` | string | ✅ | Jenis perahu |
| `trip_purpose` | string | ❌ | Tujuan perjalanan |
| `duration_hours` | integer | ❌ | Durasi perjalanan dalam jam |
| `forecast_days` | integer | ❌ | Jumlah hari forecast (default: 3) |

#### Contoh Request
```bash
POST /api/ai/recommend-times
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -6.1344,
  "longitude": 106.8446,
  "boat_type": "perahu_kecil",
  "trip_purpose": "fishing",
  "duration_hours": 4,
  "forecast_days": 3
}
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
    "boat_type": "perahu_kecil",
    "recommendations": [
      {
        "date": "2025-07-24",
        "time_slots": [
          {
            "start_time": "06:00",
            "end_time": "10:00",
            "safety_score": 92,
            "weather_conditions": {
              "wave_height": 0.8,
              "wind_speed": 8.5,
              "weather_description": "Cerah"
            },
            "ai_reasoning": "Waktu pagi sangat ideal untuk perahu kecil. Gelombang tenang, angin sepoi-sepoi, dan cuaca cerah memberikan kondisi optimal untuk memancing. Visibilitas sangat baik dan risiko cuaca buruk minimal.",
            "advantages": [
              "Gelombang sangat tenang (0.8m)",
              "Angin ringan dan stabil",
              "Cuaca cerah dengan visibilitas baik",
              "Suhu nyaman untuk aktivitas outdoor"
            ],
            "precautions": [
              "Gunakan tabir surya",
              "Bawa air minum yang cukup"
            ]
          },
          {
            "start_time": "16:00",
            "end_time": "19:00",
            "safety_score": 78,
            "weather_conditions": {
              "wave_height": 1.1,
              "wind_speed": 12.0,
              "weather_description": "Berawan"
            },
            "ai_reasoning": "Sore hari masih cukup aman untuk perahu kecil, meskipun gelombang sedikit meningkat. Angin masih dalam batas toleransi, namun perlu waspada terhadap perubahan cuaca menjelang malam.",
            "advantages": [
              "Suhu lebih sejuk",
              "Angin masih dalam batas aman"
            ],
            "precautions": [
              "Pantau perubahan cuaca",
              "Siapkan lampu navigasi",
              "Jangan terlalu jauh dari pantai"
            ]
          }
        ]
      },
      {
        "date": "2025-07-25",
        "time_slots": [
          {
            "start_time": "07:00",
            "end_time": "11:00",
            "safety_score": 85,
            "weather_conditions": {
              "wave_height": 1.0,
              "wind_speed": 10.2,
              "weather_description": "Sebagian berawan"
            },
            "ai_reasoning": "Kondisi pagi masih baik meskipun sedikit berawan. Gelombang masih dalam batas aman untuk perahu kecil dengan tinggi 1 meter.",
            "advantages": [
              "Kondisi relatif stabil",
              "Gelombang masih aman"
            ],
            "precautions": [
              "Siapkan jas hujan",
              "Pantau perkembangan awan"
            ]
          }
        ]
      }
    ],
    "general_advice": {
      "best_overall_time": "2025-07-24 06:00-10:00",
      "avoid_times": [
        "2025-07-25 14:00-18:00 (Prediksi hujan dan angin kencang)"
      ],
      "seasonal_notes": "Musim ini umumnya baik untuk aktivitas memancing di pagi hari. Hindari sore hari karena sering terjadi hujan lokal."
    },
    "confidence_score": 88,
    "generated_at": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 3. Deteksi Anomali Cuaca
**`POST /api/ai/detect-anomalies`**

Mendeteksi pola cuaca tidak normal dan memberikan peringatan dini.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude |
| `longitude` | float | ✅ | Koordinat longitude |
| `sensitivity` | string | ❌ | Tingkat sensitivitas: low, medium, high |
| `historical_days` | integer | ❌ | Hari historis untuk analisis (default: 7) |
| `forecast_days` | integer | ❌ | Hari forecast untuk prediksi (default: 3) |

#### Contoh Request
```bash
POST /api/ai/detect-anomalies
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": -6.1344,
  "longitude": 106.8446,
  "sensitivity": "high",
  "historical_days": 14,
  "forecast_days": 5
}
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "area_name": "Perairan Jakarta Utara"
    },
    "analysis_period": {
      "historical_start": "2025-07-10",
      "historical_end": "2025-07-24",
      "forecast_start": "2025-07-24",
      "forecast_end": "2025-07-29"
    },
    "anomalies_detected": [
      {
        "type": "wave_height_spike",
        "severity": "medium",
        "date": "2025-07-26",
        "time": "14:00-18:00",
        "description": "Tinggi gelombang diprediksi naik drastis dari 1.2m menjadi 3.5m dalam waktu 4 jam",
        "ai_analysis": "Pola ini tidak biasa untuk wilayah Jakarta Utara pada musim ini. Kemungkinan disebabkan oleh sistem cuaca dari arah barat daya yang bergerak cepat. Nelayan disarankan untuk tidak berlayar pada periode ini.",
        "impact_assessment": {
          "perahu_kecil": "Sangat berbahaya - hindari berlayar",
          "kapal_nelayan": "Berbahaya - pertimbangkan menunda",
          "kapal_besar": "Hati-hati - gunakan rute alternatif"
        },
        "confidence": 78
      },
      {
        "type": "wind_pattern_change",
        "severity": "low",
        "date": "2025-07-27",
        "time": "06:00-12:00",
        "description": "Arah angin berubah drastis dari timur ke barat dalam waktu singkat",
        "ai_analysis": "Perubahan arah angin ini dapat menyebabkan gelombang silang yang berbahaya bagi perahu kecil. Meskipun kecepatan angin tidak terlalu tinggi, pola ini perlu diwaspadai.",
        "impact_assessment": {
          "perahu_kecil": "Perhatian khusus diperlukan",
          "kapal_nelayan": "Kondisi normal dengan pengawasan",
          "kapal_besar": "Tidak berpengaruh signifikan"
        },
        "confidence": 65
      }
    ],
    "normal_patterns": [
      {
        "parameter": "temperature",
        "status": "normal",
        "description": "Suhu laut dalam rentang normal 27-29°C"
      },
      {
        "parameter": "pressure",
        "status": "normal", 
        "description": "Tekanan atmosfer stabil di sekitar 1013 hPa"
      }
    ],
    "recommendations": {
      "immediate_actions": [
        "Pantau perkembangan cuaca setiap 2 jam mulai 25 Juli",
        "Siapkan rencana alternatif untuk perjalanan 26-27 Juli",
        "Informasikan kepada nelayan lain tentang potensi anomali"
      ],
      "long_term_monitoring": [
        "Lakukan pemantauan intensif sistem cuaca dari barat daya",
        "Koordinasi dengan BMKG untuk update terkini"
      ]
    },
    "overall_risk_level": "medium",
    "confidence_score": 82,
    "generated_at": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 4. Peringatan Dini
**`GET /api/ai/early-warnings`**

Mendapatkan peringatan dini untuk lokasi tertentu.

#### Parameter Query
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `latitude` | float | ✅ | Koordinat latitude |
| `longitude` | float | ✅ | Koordinat longitude |
| `radius_km` | float | ❌ | Radius area dalam km (default: 50) |
| `severity` | string | ❌ | Filter tingkat keparahan: low, medium, high |

#### Contoh Request
```bash
GET /api/ai/early-warnings?latitude=-6.1344&longitude=106.8446&radius_km=25&severity=medium
Authorization: Bearer <token>
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "radius_km": 25
    },
    "active_warnings": [
      {
        "id": "warning_001",
        "type": "high_waves",
        "severity": "medium",
        "title": "Peringatan Gelombang Tinggi",
        "description": "Gelombang diprediksi mencapai 2.5-3.5 meter pada 26 Juli 2025",
        "affected_area": {
          "center": [-6.1344, 106.8446],
          "radius_km": 15,
          "area_names": ["Perairan Jakarta Utara", "Kepulauan Seribu Selatan"]
        },
        "time_period": {
          "start": "2025-07-26T12:00:00Z",
          "end": "2025-07-26T20:00:00Z",
          "duration_hours": 8
        },
        "ai_assessment": {
          "cause": "Sistem cuaca dari barat daya dengan tekanan rendah",
          "development": "Gelombang akan meningkat bertahap mulai siang hari",
          "peak_time": "2025-07-26T16:00:00Z",
          "recovery": "Kondisi mulai membaik setelah pukul 20:00"
        },
        "safety_recommendations": {
          "perahu_kecil": "Hindari berlayar selama periode peringatan",
          "kapal_nelayan": "Gunakan rute alternatif atau tunda perjalanan",
          "kapal_besar": "Navigasi dengan hati-hati, hindari area terbuka"
        },
        "confidence": 85,
        "issued_at": "2025-07-24T10:30:00Z",
        "expires_at": "2025-07-27T00:00:00Z"
      }
    ],
    "upcoming_concerns": [
      {
        "date": "2025-07-28",
        "concern": "Potensi cuaca buruk",
        "probability": 45,
        "description": "Sistem tekanan rendah berpotensi berkembang"
      }
    ],
    "all_clear_periods": [
      {
        "start": "2025-07-24T06:00:00Z",
        "end": "2025-07-25T18:00:00Z",
        "description": "Kondisi cuaca stabil dan aman untuk semua jenis perahu"
      }
    ],
    "total_warnings": 1,
    "last_updated": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 5. Status Layanan AI
**`GET /api/ai/status`**

Mendapatkan status layanan AI dan statistik penggunaan.

#### Contoh Request
```bash
GET /api/ai/status
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "service_status": "operational",
    "ai_model": {
      "provider": "Google Gemini",
      "model": "gemini-1.5-flash",
      "version": "latest",
      "status": "healthy"
    },
    "performance_metrics": {
      "avg_response_time_ms": 1250,
      "success_rate": 98.5,
      "total_requests_today": 342,
      "error_rate": 1.5
    },
    "feature_availability": {
      "explain_conditions": true,
      "recommend_times": true,
      "detect_anomalies": true,
      "early_warnings": true
    },
    "rate_limits": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000,
      "requests_per_day": 10000
    },
    "last_health_check": "2025-07-24T10:25:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🚨 Response Error

### Error AI Service (503)
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "details": {
    "service": "Google Gemini",
    "status": "rate_limited",
    "retry_after": 60
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error Invalid Parameters (400)
```json
{
  "success": false,
  "error": "Parameter tidak valid",
  "details": {
    "latitude": "Latitude harus berupa angka antara -90 dan 90",
    "boat_type": "Jenis perahu tidak valid"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Best Practices

### 1. Rate Limiting
```javascript
// Implementasi retry dengan exponential backoff
async function callAIAPI(endpoint, data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

### 2. Caching AI Responses
```javascript
// Cache AI responses untuk mengurangi API calls
const aiCache = new Map();

async function getCachedAIResponse(cacheKey, apiCall) {
  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 menit
      return cached.data;
    }
  }
  
  const response = await apiCall();
  aiCache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });
  
  return response;
}
```

---

_Terakhir diperbarui: Juli 2025_
