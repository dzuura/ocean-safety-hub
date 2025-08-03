# 📋 Guide API - Referensi Lengkap

## 📋 Ringkasan

API Panduan memungkinkan pengguna untuk mengakses panduan keselamatan berlayar yang dipersonalisasi berdasarkan kondisi perjalanan, dengan sistem checklist interaktif dan video tutorial.

---

## 🎯 Endpoint Panduan

### 1. Daftar Panduan

**`GET /api/guide`**

Mendapatkan daftar semua panduan keselamatan.

#### Parameter Query

| Parameter      | Tipe    | Wajib | Deskripsi                           |
| -------------- | ------- | ----- | ----------------------------------- |
| `category`     | string  | ❌    | Filter berdasarkan kategori         |
| `is_active`    | boolean | ❌    | Filter panduan aktif                |
| `is_mandatory` | boolean | ❌    | Filter panduan wajib                |
| `sort_by`      | string  | ❌    | Urutan: priority, created_at, title |
| `sort_order`   | string  | ❌    | asc atau desc                       |
| `limit`        | integer | ❌    | Jumlah hasil (default: 20)          |

#### Contoh Request

```bash
GET /api/guide?category=safety&is_active=true&sort_by=priority&limit=10
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "guides": [
      {
        "id": "guide_123",
        "title": "Periksa Pelampung Keselamatan",
        "description": "Pastikan semua pelampung dalam kondisi baik dan mudah dijangkau",
        "image_url": "https://example.com/images/life_jacket.jpg",
        "category": "safety",
        "priority": 1,
        "estimated_time_minutes": 5,
        "is_mandatory": true,
        "tags": ["keselamatan", "pelampung", "wajib"]
      }
    ],
    "total": 1,
    "filters": {
      "category": "safety",
      "is_active": true
    }
  }
}
```

---

### 2. Detail Panduan

**`GET /api/guide/:guideId`**

Mendapatkan detail lengkap panduan.

#### Contoh Request

```bash
GET /api/guide/guide_123
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "id": "guide_123",
    "title": "Periksa Pelampung Keselamatan",
    "description": "Pastikan semua pelampung dalam kondisi baik dan mudah dijangkau. Periksa tali pengikat, kondisi bahan, dan pastikan ukuran sesuai dengan penumpang.",
    "image_url": "https://example.com/images/life_jacket.jpg",
    "video_url": "https://example.com/videos/life_jacket_check.mp4",
    "category": "safety",
    "priority": 1,
    "estimated_time_minutes": 5,
    "conditions": {
      "trip_purposes": ["fishing", "transport", "recreation"],
      "boat_types": ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      "duration_ranges": ["short", "medium", "long"],
      "passenger_ranges": ["solo", "small", "medium", "large"]
    },
    "is_mandatory": true,
    "is_active": true,
    "tags": ["keselamatan", "pelampung", "wajib"],
    "created_at": "2025-07-24T10:30:00Z"
  }
}
```

---

## 🚀 Session Management

### 3. Mulai Session Baru

**`POST /api/guide/session/start`**

Memulai session panduan baru dengan informasi perjalanan.

#### Parameter Request Body

| Parameter           | Tipe    | Wajib | Deskripsi                                            |
| ------------------- | ------- | ----- | ---------------------------------------------------- |
| `trip_purpose`      | string  | ✅    | Tujuan: fishing, transport, recreation, emergency    |
| `duration_minutes`  | integer | ✅    | Durasi perjalanan pulang pergi dalam menit (30-1440) |
| `passenger_count`   | integer | ✅    | Jumlah penumpang (1-100)                             |
| `boat_type`         | string  | ✅    | Jenis: perahu_kecil, kapal_nelayan, kapal_besar      |
| `weather_condition` | string  | ✅    | Kondisi: calm, moderate, rough                       |
| `distance_km`       | number  | ✅    | Jarak tempuh dalam kilometer (0.1-1000)              |

#### Detail Parameter

##### `trip_purpose` (string, required)

Tujuan perjalanan yang akan mempengaruhi pemilihan guide:

- **`fishing`** - Perjalanan memancing
- **`transport`** - Transportasi penumpang/barang
- **`recreation`** - Rekreasi/wisata
- **`emergency`** - Situasi darurat

##### `duration_minutes` (integer, required)

Durasi total perjalanan pulang pergi dalam menit:

- **Minimal**: 30 menit
- **Maksimal**: 1440 menit (24 jam)
- **Contoh**: 240 = 4 jam pulang pergi

##### `passenger_count` (integer, required)

Jumlah total penumpang termasuk operator:

- **Minimal**: 1 orang
- **Maksimal**: 100 orang
- **Range Mapping**:
  - Solo: 1 orang
  - Small: 2-5 orang
  - Medium: 6-15 orang
  - Large: 16+ orang

##### `boat_type` (string, required)

Jenis perahu yang akan digunakan:

- **`perahu_kecil`** - Perahu kecil (< 5 meter)
- **`kapal_nelayan`** - Kapal nelayan tradisional (5-15 meter)
- **`kapal_besar`** - Kapal besar (> 15 meter)

##### `weather_condition` (string, required)

Kondisi cuaca saat ini atau yang diperkirakan:

- **`calm`** - Tenang (gelombang < 0.5m, angin < 10 km/h)
- **`moderate`** - Sedang (gelombang 0.5-1.5m, angin 10-25 km/h)
- **`rough`** - Buruk (gelombang > 1.5m, angin > 25 km/h)

##### `distance_km` (number, required)

Jarak tempuh total perjalanan dalam kilometer:

- **Minimal**: 0.1 km
- **Maksimal**: 1000 km
- **Range Mapping**:
  - Near: < 5 km
  - Medium: 5-50 km
  - Far: > 50 km
- **Contoh**: 15.5 km

#### Contoh Request

```bash
POST /api/guide/session/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "trip_purpose": "fishing",
  "duration_minutes": 240,
  "passenger_count": 3,
  "boat_type": "kapal_nelayan",
  "weather_condition": "calm",
  "distance_km": 15.5
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Guide session started successfully",
  "data": {
    "id": "session_456",
    "user_id": "user_789",
    "trip_info": {
      "trip_purpose": "fishing",
      "duration_minutes": 240,
      "passenger_count": 3,
      "boat_type": "kapal_nelayan",
      "weather_condition": "calm",
      "distance_km": 15.5
    },
    "status": "form_filling",
    "created_at": "2025-07-24T10:30:00Z",
    "expires_at": "2025-07-25T10:30:00Z"
  }
}
```

#### Algoritma Guide Selection

Sistem akan memilih guide berdasarkan kondisi perjalanan dengan mapping sebagai berikut:

##### Duration Range Mapping

```javascript
let duration_range = "short";
if (duration_minutes > 480) duration_range = "long"; // > 8 jam
else if (duration_minutes > 120) duration_range = "medium"; // 2-8 jam
// else "short" untuk < 2 jam
```

##### Passenger Range Mapping

```javascript
let passenger_range = "solo";
if (passenger_count > 15) passenger_range = "large"; // 16+ orang
else if (passenger_count > 5) passenger_range = "medium"; // 6-15 orang
else if (passenger_count > 1) passenger_range = "small"; // 2-5 orang
// else "solo" untuk 1 orang
```

##### Distance Range Mapping

```javascript
let distance_range = "near";
if (distance_km > 50) distance_range = "far"; // > 50 km
else if (distance_km > 5) distance_range = "medium"; // 5-50 km
// else "near" untuk < 5 km
```

##### Guide Matching Logic

Guide akan dipilih jika memenuhi SEMUA kondisi berikut:

- `trip_purposes` kosong ATAU mengandung `trip_purpose` yang dikirim
- `boat_types` kosong ATAU mengandung `boat_type` yang dikirim
- `duration_ranges` kosong ATAU mengandung `duration_range` yang dihitung
- `passenger_ranges` kosong ATAU mengandung `passenger_range` yang dihitung
- `weather_conditions` kosong ATAU mengandung `weather_condition` yang dikirim
- `distance_ranges` kosong ATAU mengandung `distance_range` yang dihitung

#### Validasi Error

Jika ada error validasi, API akan mengembalikan response dengan format:

```json
{
  "success": false,
  "error": "Informasi perjalanan tidak valid",
  "details": {
    "trip_purpose": "Tujuan perjalanan harus dipilih",
    "duration_minutes": "Durasi perjalanan pulang pergi minimal 30 menit",
    "passenger_count": "Jumlah penumpang minimal 1 orang",
    "boat_type": "Jenis perahu harus dipilih",
    "weather_condition": "Kondisi cuaca harus dipilih",
    "distance_km": "Jarak tempuh minimal 0.1 km"
  },
  "timestamp": "2025-08-01T07:30:00Z"
}
```

---

### 4. Session Aktif

**`GET /api/guide/session/active`**

Mendapatkan session aktif pengguna.

#### Contoh Request

```bash
GET /api/guide/session/active
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "id": "session_456",
    "user_id": "user_789",
    "trip_info": {
      "trip_purpose": "fishing",
      "duration_minutes": 240,
      "passenger_count": 3,
      "boat_type": "kapal_nelayan",
      "weather_condition": "calm",
      "distance_km": 15.5
    },
    "checklist_progress": {
      "total_items": 8,
      "completed_items": 3,
      "completion_percentage": 38
    },
    "status": "checklist_active",
    "is_expired": false
  }
}
```

---

### 5. Generate Checklist

**`POST /api/guide/session/:sessionId/checklist`**

Menghasilkan checklist berdasarkan kondisi perjalanan.

#### Contoh Request

```bash
POST /api/guide/session/session_456/checklist
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Checklist generated successfully",
  "data": {
    "session_id": "session_456",
    "trip_info": {
      "trip_purpose": "fishing",
      "duration_minutes": 240,
      "passenger_count": 3,
      "boat_type": "kapal_nelayan",
      "weather_condition": "calm",
      "distance_km": 15.5
    },
    "checklist": [
      {
        "id": "guide_123",
        "title": "Periksa Pelampung Keselamatan",
        "description": "Pastikan semua pelampung dalam kondisi baik",
        "image_url": "https://example.com/images/life_jacket.jpg",
        "video_url": "https://www.youtube.com/watch?v=life_jacket_tutorial",
        "category": "safety",
        "priority": 1,
        "estimated_time_minutes": 5,
        "is_mandatory": true,
        "is_completed": false
      },
      {
        "id": "guide_124",
        "title": "Periksa Kondisi Mesin",
        "description": "Pastikan mesin dalam kondisi prima",
        "image_url": "https://example.com/images/engine_check.jpg",
        "video_url": "https://www.youtube.com/watch?v=engine_check_tutorial",
        "category": "safety",
        "priority": 2,
        "estimated_time_minutes": 10,
        "is_mandatory": true,
        "is_completed": false
      }
    ],
    "summary": {
      "total_items": 8,
      "mandatory_items": 5,
      "estimated_total_time": 45
    }
  }
}
```

---

### 6. Update Progress Checklist

**`PUT /api/guide/session/:sessionId/checklist/:guideId`**

Mengupdate status completion item checklist.

#### Parameter Request Body

| Parameter      | Tipe    | Wajib | Deskripsi              |
| -------------- | ------- | ----- | ---------------------- |
| `is_completed` | boolean | ✅    | Status completion item |

#### Contoh Request

```bash
PUT /api/guide/session/session_456/checklist/guide_123
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_completed": true
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Checklist item completed",
  "data": {
    "session_id": "session_456",
    "guide_id": "guide_123",
    "is_completed": true,
    "progress": {
      "total_items": 8,
      "completed_items": 4,
      "completion_percentage": 50
    },
    "status": "checklist_active"
  }
}
```

---

### 7. Rangkuman Panduan

**`GET /api/guide/session/:sessionId/summary`**

Mendapatkan rangkuman dengan video tutorial (setelah checklist selesai).

#### Contoh Request

```bash
GET /api/guide/session/session_456/summary
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Summary retrieved successfully",
  "data": {
    "session_id": "session_456",
    "trip_info": {
      "trip_purpose": "fishing",
      "duration_minutes": 240,
      "passenger_count": 3,
      "boat_type": "kapal_nelayan"
    },
    "summary": {
      "total_items": 8,
      "completed_items": 8,
      "completion_percentage": 100,
      "mandatory_completed": true
    },
    "items": [
      {
        "id": "guide_123",
        "title": "Periksa Pelampung Keselamatan",
        "description": "Pastikan semua pelampung dalam kondisi baik",
        "image_url": "https://example.com/images/life_jacket.jpg",
        "video_url": "https://example.com/videos/life_jacket_tutorial.mp4",
        "category": "safety",
        "priority": 1,
        "estimated_time_minutes": 5,
        "is_mandatory": true,
        "is_completed": true,
        "completed_at": "2025-07-24T11:00:00Z"
      }
    ]
  }
}
```

---

### 8. Selesaikan Session

**`POST /api/guide/session/:sessionId/complete`**

Menandai session sebagai selesai.

#### Contoh Request

```bash
POST /api/guide/session/session_456/complete
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Session completed successfully",
  "data": {
    "session_id": "session_456",
    "status": "completed",
    "completed_at": "2025-07-24T12:00:00Z",
    "summary": {
      "trip_info": {
        "trip_purpose": "fishing",
        "duration_minutes": 240
      },
      "progress": {
        "total_items": 8,
        "completed_items": 8,
        "completion_percentage": 100,
        "mandatory_completed": true
      },
      "duration_spent": 90
    }
  }
}
```

---

### 9. Riwayat Session

**`GET /api/guide/session/history`**

Mendapatkan riwayat session pengguna.

#### Parameter Query

| Parameter | Tipe    | Wajib | Deskripsi                  |
| --------- | ------- | ----- | -------------------------- |
| `status`  | string  | ❌    | Filter berdasarkan status  |
| `limit`   | integer | ❌    | Jumlah hasil (default: 20) |

#### Contoh Request

```bash
GET /api/guide/session/history?status=completed&limit=5
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_456",
        "trip_info": {
          "trip_purpose": "fishing",
          "duration_minutes": 240
        },
        "status": "completed",
        "completion_percentage": 100,
        "created_at": "2025-07-24T10:30:00Z",
        "completed_at": "2025-07-24T12:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

## 🔧 Admin Endpoints

### 10. Buat Panduan (Admin)

**`POST /api/guide`**

Membuat panduan keselamatan baru. Hanya dapat diakses oleh admin.

#### Headers

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Parameter Request Body

| Parameter                | Tipe    | Wajib | Deskripsi                                        |
| ------------------------ | ------- | ----- | ------------------------------------------------ |
| `title`                  | string  | ✅    | Judul panduan (minimal 3 karakter)               |
| `description`            | string  | ✅    | Deskripsi panduan (minimal 10 karakter)          |
| `image_url`              | string  | ✅    | URL gambar panduan (harus valid URL)             |
| `video_url`              | string  | ❌    | URL video tutorial (opsional, harus valid URL)   |
| `category`               | string  | ❌    | Kategori: general, safety, navigation, emergency |
| `priority`               | integer | ❌    | Prioritas 1-5 (1 = tertinggi, default: 1)        |
| `estimated_time_minutes` | integer | ❌    | Estimasi waktu 1-120 menit (default: 5)          |
| `conditions`             | object  | ❌    | Kondisi kapan panduan ditampilkan                |
| `is_mandatory`           | boolean | ❌    | Apakah panduan wajib (default: false)            |
| `is_active`              | boolean | ❌    | Status aktif panduan (default: true)             |
| `tags`                   | array   | ❌    | Array tag untuk kategorisasi                     |

#### Detail Parameter Conditions

```javascript
{
  "conditions": {
    "trip_purposes": ["fishing", "transport", "recreation", "emergency"],
    "boat_types": ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
    "duration_ranges": ["short", "medium", "long"],
    "passenger_ranges": ["solo", "small", "medium", "large"],
    "weather_conditions": ["calm", "moderate", "rough"],
    "distance_ranges": ["near", "medium", "far"]
  }
}
```

**Penjelasan Conditions:**

- **trip_purposes**: Tujuan perjalanan yang sesuai
- **boat_types**: Jenis perahu yang sesuai
- **duration_ranges**: Range durasi (short: <2h, medium: 2-8h, long: >8h)
- **passenger_ranges**: Range penumpang (solo: 1, small: 2-5, medium: 6-15, large: 16+)
- **weather_conditions**: Kondisi cuaca yang sesuai
- **distance_ranges**: Range jarak (near: <5km, medium: 5-50km, far: >50km)

#### Contoh Request

```bash
POST /api/guide
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Periksa Sistem Navigasi GPS",
  "description": "Pastikan GPS berfungsi dengan baik, sinyal kuat, dan baterai mencukupi. Kalibrasi kompas dan siapkan peta cadangan untuk navigasi darurat.",
  "image_url": "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=500",
  "video_url": "https://www.youtube.com/watch?v=navigation_tutorial",
  "category": "navigation",
  "priority": 2,
  "estimated_time_minutes": 8,
  "conditions": {
    "trip_purposes": ["fishing", "transport", "recreation"],
    "boat_types": ["kapal_nelayan", "kapal_besar"],
    "duration_ranges": ["medium", "long"],
    "passenger_ranges": ["small", "medium", "large"],
    "weather_conditions": ["calm", "moderate"],
    "distance_ranges": ["medium", "far"]
  },
  "is_mandatory": false,
  "is_active": true,
  "tags": ["navigasi", "gps", "kompas"]
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Guide created successfully",
  "data": {
    "id": "guide_new_123",
    "title": "Periksa Sistem Navigasi GPS",
    "description": "Pastikan GPS berfungsi dengan baik, sinyal kuat, dan baterai mencukupi. Kalibrasi kompas dan siapkan peta cadangan untuk navigasi darurat.",
    "image_url": "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=500",
    "video_url": "https://www.youtube.com/watch?v=navigation_tutorial",
    "category": "navigation",
    "priority": 2,
    "estimated_time_minutes": 8,
    "conditions": {
      "trip_purposes": ["fishing", "transport", "recreation"],
      "boat_types": ["kapal_nelayan", "kapal_besar"],
      "duration_ranges": ["medium", "long"],
      "passenger_ranges": ["small", "medium", "large"],
      "weather_conditions": ["calm", "moderate"],
      "distance_ranges": ["medium", "far"]
    },
    "is_mandatory": false,
    "is_active": true,
    "tags": ["navigasi", "gps", "kompas"],
    "created_at": "2025-08-01T10:30:00Z",
    "updated_at": "2025-08-01T10:30:00Z",
    "created_by": "admin_user_123"
  },
  "timestamp": "2025-08-01T10:30:00Z"
}
```

---

### 11. Update Panduan (Admin)

**`PUT /api/guide/:guideId`**

Memperbarui panduan yang sudah ada. Hanya dapat diakses oleh admin.

#### Headers

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Parameter Request Body

Sama seperti endpoint create, semua field opsional untuk update.

#### Contoh Request

```bash
PUT /api/guide/guide_new_123
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Periksa Sistem Navigasi GPS dan Kompas",
  "priority": 1,
  "is_mandatory": true,
  "conditions": {
    "trip_purposes": ["fishing", "transport", "recreation", "emergency"],
    "weather_conditions": ["calm", "moderate", "rough"]
  }
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Guide updated successfully",
  "data": {
    "id": "guide_new_123",
    "title": "Periksa Sistem Navigasi GPS dan Kompas",
    "description": "Pastikan GPS berfungsi dengan baik, sinyal kuat, dan baterai mencukupi. Kalibrasi kompas dan siapkan peta cadangan untuk navigasi darurat.",
    "priority": 1,
    "is_mandatory": true,
    "conditions": {
      "trip_purposes": ["fishing", "transport", "recreation", "emergency"],
      "boat_types": ["kapal_nelayan", "kapal_besar"],
      "duration_ranges": ["medium", "long"],
      "passenger_ranges": ["small", "medium", "large"],
      "weather_conditions": ["calm", "moderate", "rough"],
      "distance_ranges": ["medium", "far"]
    },
    "updated_at": "2025-08-01T11:15:00Z"
  },
  "timestamp": "2025-08-01T11:15:00Z"
}
```

---

### 12. Hapus Panduan (Admin)

**`DELETE /api/guide/:guideId`**

Menghapus panduan dari sistem. Hanya dapat diakses oleh admin.

#### Headers

```
Authorization: Bearer <admin_token>
```

#### Contoh Request

```bash
DELETE /api/guide/guide_new_123
Authorization: Bearer <admin_token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Guide deleted successfully",
  "data": {
    "id": "guide_new_123",
    "title": "Periksa Sistem Navigasi GPS dan Kompas",
    "deleted_at": "2025-08-01T12:00:00Z"
  },
  "timestamp": "2025-08-01T12:00:00Z"
}
```

---

### 13. Statistik Panduan (Admin)

**`GET /api/guide/admin/statistics`**

Mendapatkan statistik lengkap panduan dan session. Hanya dapat diakses oleh admin.

#### Headers

```
Authorization: Bearer <admin_token>
```

#### Contoh Request

```bash
GET /api/guide/admin/statistics
Authorization: Bearer <admin_token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "guides": {
      "total": 25,
      "active": 22,
      "mandatory": 8,
      "by_category": {
        "safety": 12,
        "navigation": 6,
        "emergency": 4,
        "general": 3
      }
    },
    "sessions": {
      "total": 156,
      "active": 12,
      "completed": 134,
      "by_status": {
        "form_filling": 3,
        "checklist_active": 8,
        "summary_ready": 1,
        "completed": 134,
        "expired": 10
      }
    }
  },
  "timestamp": "2025-08-01T12:30:00Z"
}
```

---

## 🚨 Response Error

### Error Validasi (400)

```json
{
  "success": false,
  "error": "Informasi perjalanan tidak valid",
  "details": {
    "trip_purpose": "Tujuan perjalanan harus dipilih",
    "duration_minutes": "Durasi perjalanan pulang pergi minimal 30 menit",
    "passenger_count": "Jumlah penumpang minimal 1 orang",
    "boat_type": "Jenis perahu harus dipilih",
    "weather_condition": "Kondisi cuaca harus dipilih",
    "distance_km": "Jarak tempuh minimal 0.1 km"
  },
  "timestamp": "2025-08-01T07:30:00Z"
}
```

### Error Session Expired (410)

```json
{
  "success": false,
  "error": "Session has expired"
}
```

### Error Admin Validation (400)

```json
{
  "success": false,
  "error": "Data panduan tidak valid",
  "details": {
    "title": "Judul panduan minimal 3 karakter",
    "description": "Deskripsi panduan minimal 10 karakter",
    "image_url": "URL gambar tidak valid",
    "video_url": "URL video tidak valid",
    "category": "Kategori harus salah satu dari: general, safety, navigation, emergency",
    "priority": "Prioritas harus berupa angka antara 1-5",
    "estimated_time_minutes": "Estimasi waktu harus berupa angka antara 1-120 menit"
  },
  "timestamp": "2025-08-01T07:30:00Z"
}
```

### Error Unauthorized (401)

```json
{
  "success": false,
  "message": "Token autentikasi diperlukan",
  "timestamp": "2025-08-01T07:30:00Z"
}
```

### Error Forbidden (403)

```json
{
  "success": false,
  "message": "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini",
  "timestamp": "2025-08-01T07:30:00Z"
}
```

### Error Not Found (404)

```json
{
  "success": false,
  "error": "Guide not found",
  "timestamp": "2025-08-01T07:30:00Z"
}
```

---

## 📚 Contoh Penggunaan

### Skenario 1: Perjalanan Memancing Jarak Dekat

```javascript
// Request untuk perjalanan memancing 2 jam di perairan tenang
const tripData = {
  trip_purpose: "fishing",
  duration_minutes: 120, // 2 jam pulang pergi
  passenger_count: 2, // 2 orang
  boat_type: "perahu_kecil",
  weather_condition: "calm",
  distance_km: 3.5, // 3.5 km dari pantai
};

// Akan menghasilkan:
// - duration_range: "short" (< 2 jam)
// - passenger_range: "small" (2-5 orang)
// - distance_range: "near" (< 5 km)
```

### Skenario 2: Transportasi Jarak Jauh

```javascript
// Request untuk transportasi penumpang jarak jauh
const tripData = {
  trip_purpose: "transport",
  duration_minutes: 480, // 8 jam pulang pergi
  passenger_count: 25, // 25 penumpang
  boat_type: "kapal_besar",
  weather_condition: "moderate",
  distance_km: 75, // 75 km
};

// Akan menghasilkan:
// - duration_range: "long" (> 8 jam)
// - passenger_range: "large" (16+ orang)
// - distance_range: "far" (> 50 km)
```

### Skenario 3: Situasi Darurat

```javascript
// Request untuk situasi darurat
const tripData = {
  trip_purpose: "emergency",
  duration_minutes: 60, // 1 jam pulang pergi
  passenger_count: 1, // 1 operator
  boat_type: "kapal_nelayan",
  weather_condition: "rough",
  distance_km: 12, // 12 km
};

// Akan menghasilkan:
// - duration_range: "short" (< 2 jam)
// - passenger_range: "solo" (1 orang)
// - distance_range: "medium" (5-50 km)
```

## 💡 Best Practices

### 1. Validasi Client-Side

```javascript
function validateTripData(data) {
  const errors = {};

  // Validasi trip_purpose
  if (
    !["fishing", "transport", "recreation", "emergency"].includes(
      data.trip_purpose
    )
  ) {
    errors.trip_purpose = "Tujuan perjalanan tidak valid";
  }

  // Validasi duration_minutes
  if (data.duration_minutes < 30 || data.duration_minutes > 1440) {
    errors.duration_minutes = "Durasi harus antara 30-1440 menit";
  }

  // Validasi distance_km
  if (data.distance_km < 0.1 || data.distance_km > 1000) {
    errors.distance_km = "Jarak harus antara 0.1-1000 km";
  }

  return Object.keys(errors).length === 0 ? null : errors;
}
```

### 2. Error Handling

```javascript
async function startGuideSession(tripData) {
  try {
    const response = await fetch("/api/guide/session/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });

    const result = await response.json();

    if (!result.success) {
      // Handle validation errors
      if (result.details) {
        console.error("Validation errors:", result.details);
        return { error: "validation", details: result.details };
      }

      // Handle other errors
      console.error("API error:", result.error);
      return { error: "api", message: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Network error:", error);
    return { error: "network", message: "Gagal terhubung ke server" };
  }
}
```

### 3. Caching Strategy

```javascript
// Cache guide data untuk mengurangi API calls
const guideCache = new Map();

async function getGuidesWithCache(tripData) {
  const cacheKey = JSON.stringify(tripData);

  if (guideCache.has(cacheKey)) {
    const cached = guideCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) {
      // 5 menit
      return cached.data;
    }
  }

  const result = await startGuideSession(tripData);

  if (result.success) {
    guideCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now(),
    });
  }

  return result;
}
```

---

_Terakhir diperbarui: Agustus 2025_
