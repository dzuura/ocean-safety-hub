# 📋 Guide API - Referensi Lengkap

## 📋 Ringkasan

API Panduan memungkinkan pengguna untuk mengakses panduan keselamatan berlayar yang dipersonalisasi berdasarkan kondisi perjalanan, dengan sistem checklist interaktif dan video tutorial.

---

## 🎯 Endpoint Panduan

### 1. Daftar Panduan
**`GET /api/guide`**

Mendapatkan daftar semua panduan keselamatan.

#### Parameter Query
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `category` | string | ❌ | Filter berdasarkan kategori |
| `is_active` | boolean | ❌ | Filter panduan aktif |
| `is_mandatory` | boolean | ❌ | Filter panduan wajib |
| `sort_by` | string | ❌ | Urutan: priority, created_at, title |
| `sort_order` | string | ❌ | asc atau desc |
| `limit` | integer | ❌ | Jumlah hasil (default: 20) |

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
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `trip_purpose` | string | ✅ | Tujuan: fishing, transport, recreation, emergency |
| `duration_minutes` | integer | ✅ | Durasi perjalanan dalam menit (15-1440) |
| `passenger_count` | integer | ✅ | Jumlah penumpang (1-100) |
| `boat_type` | string | ✅ | Jenis: perahu_kecil, kapal_nelayan, kapal_besar |
| `departure_location` | string | ❌ | Lokasi keberangkatan |
| `destination_location` | string | ❌ | Lokasi tujuan |
| `planned_departure_time` | string | ❌ | Waktu keberangkatan (ISO string) |
| `weather_condition` | string | ❌ | Kondisi: calm, moderate, rough |
| `urgency_level` | string | ❌ | Urgensi: low, normal, high, critical |

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
  "departure_location": "Pelabuhan Muara Angke",
  "destination_location": "Kepulauan Seribu",
  "planned_departure_time": "2025-07-25T06:00:00Z",
  "weather_condition": "calm",
  "urgency_level": "normal"
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
      "departure_location": "Pelabuhan Muara Angke",
      "destination_location": "Kepulauan Seribu"
    },
    "status": "form_filling",
    "created_at": "2025-07-24T10:30:00Z",
    "expires_at": "2025-07-25T10:30:00Z"
  }
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
      "boat_type": "kapal_nelayan"
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
      "boat_type": "kapal_nelayan"
    },
    "checklist": [
      {
        "id": "guide_123",
        "title": "Periksa Pelampung Keselamatan",
        "description": "Pastikan semua pelampung dalam kondisi baik",
        "image_url": "https://example.com/images/life_jacket.jpg",
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
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `is_completed` | boolean | ✅ | Status completion item |

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
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `status` | string | ❌ | Filter berdasarkan status |
| `limit` | integer | ❌ | Jumlah hasil (default: 20) |

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

Membuat panduan baru (Admin only).

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `title` | string | ✅ | Judul panduan (min 3 karakter) |
| `description` | string | ✅ | Deskripsi (min 10 karakter) |
| `image_url` | string | ✅ | URL gambar panduan |
| `video_url` | string | ❌ | URL video tutorial |
| `category` | string | ❌ | Kategori: general, safety, navigation, emergency |
| `priority` | integer | ❌ | Prioritas 1-5 (1 = tertinggi) |
| `estimated_time_minutes` | integer | ❌ | Estimasi waktu 1-120 menit |
| `conditions` | object | ❌ | Kondisi kapan panduan ditampilkan |
| `is_mandatory` | boolean | ❌ | Apakah wajib |
| `tags` | array | ❌ | Tag panduan |

### 11. Update Panduan (Admin)
**`PUT /api/guide/:guideId`**

Update panduan existing (Admin only).

### 12. Hapus Panduan (Admin)
**`DELETE /api/guide/:guideId`**

Hapus panduan (Admin only).

### 13. Statistik (Admin)
**`GET /api/guide/admin/statistics`**

Mendapatkan statistik panduan dan session (Admin only).

---

## 🚨 Response Error

### Error Validasi (400)
```json
{
  "success": false,
  "error": "Informasi perjalanan tidak valid",
  "details": {
    "trip_purpose": "Tujuan perjalanan harus dipilih",
    "duration_minutes": "Durasi perjalanan minimal 15 menit"
  }
}
```

### Error Session Expired (410)
```json
{
  "success": false,
  "error": "Session has expired"
}
```

---

_Terakhir diperbarui: Juli 2025_
