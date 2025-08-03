# 📊 Report API - Referensi Lengkap

## 📋 Ringkasan

API Laporan memungkinkan anggota komunitas untuk membuat, memverifikasi, dan mengelola laporan kondisi laut dengan sistem voting dan komentar.

---

## 🎯 Endpoint Laporan

### 1. Buat Laporan Baru

**`POST /api/report`**

Membuat laporan kondisi laut baru dalam komunitas.

#### Parameter Request Body

| Parameter            | Tipe   | Wajib | Deskripsi                                  |
| -------------------- | ------ | ----- | ------------------------------------------ |
| `community_id`       | string | ✅    | ID komunitas                               |
| `title`              | string | ✅    | Judul laporan (min 5 karakter)             |
| `description`        | string | ✅    | Deskripsi laporan (min 20 karakter)        |
| `location`           | object | ✅    | Data lokasi laporan                        |
| `location.latitude`  | float  | ✅    | Latitude (-90 sampai 90)                   |
| `location.longitude` | float  | ✅    | Longitude (-180 sampai 180)                |
| `location.address`   | string | ❌    | Alamat lokasi                              |
| `location.area_name` | string | ❌    | Nama area                                  |
| `conditions`         | object | ❌    | Kondisi cuaca dan laut                     |
| `safety_assessment`  | object | ❌    | Penilaian keamanan                         |
| `media`              | object | ❌    | Media foto/video                           |
| `tags`               | array  | ❌    | Tag laporan                                |
| `urgency_level`      | string | ❌    | Level urgensi: low, normal, high, critical |
| `valid_until`        | string | ❌    | Waktu kedaluwarsa (ISO string)             |

#### Contoh Request

```bash
POST /api/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "community_id": "community_123",
  "title": "Gelombang Tinggi di Teluk Jakarta",
  "description": "Laporan kondisi gelombang tinggi mencapai 2.5 meter di area Teluk Jakarta. Nelayan disarankan berhati-hati saat berlayar.",
  "location": {
    "latitude": -6.1344,
    "longitude": 106.8446,
    "address": "Teluk Jakarta",
    "area_name": "Jakarta Utara"
  },
  "conditions": {
    "wave_height": 2.5,
    "wind_speed": 25,
    "wind_direction": 180,
    "visibility": 3,
    "weather_description": "Berawan dengan angin kencang",
    "sea_temperature": 28,
    "current_strength": 2,
    "tide_level": "high"
  },
  "safety_assessment": {
    "overall_safety": "caution",
    "boat_recommendations": {
      "perahu_kecil": "avoid",
      "kapal_nelayan": "caution",
      "kapal_besar": "safe"
    },
    "recommended_actions": [
      "Gunakan pelampung keselamatan",
      "Periksa kondisi cuaca secara berkala",
      "Bawa alat komunikasi darurat"
    ]
  },
  "tags": ["gelombang_tinggi", "angin_kencang", "jakarta"],
  "urgency_level": "high"
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Laporan berhasil dibuat",
  "data": {
    "id": "report_456",
    "community_id": "community_123",
    "author_id": "user_789",
    "author_name": "Ahmad Nelayan",
    "title": "Gelombang Tinggi di Teluk Jakarta",
    "description": "Laporan kondisi gelombang tinggi...",
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "address": "Teluk Jakarta"
    },
    "conditions": {
      "wave_height": 2.5,
      "wind_speed": 25
    },
    "urgency_level": "high",
    "verification": {
      "status": "pending",
      "confidence_score": 50
    },
    "voting": {
      "upvotes": 0,
      "downvotes": 0,
      "total_votes": 0
    },
    "created_at": "2025-07-24T10:30:00Z"
  }
}
```

---

### 2. Cari Laporan

**`GET /api/report/search`**

Mencari laporan dengan berbagai filter.

#### Parameter Query

| Parameter             | Tipe         | Wajib | Deskripsi                            | Nilai yang Valid                                 |
| --------------------- | ------------ | ----- | ------------------------------------ | ------------------------------------------------ |
| `community_id`        | string       | ❌    | Filter berdasarkan komunitas         | ID komunitas yang valid                          |
| `author_id`           | string       | ❌    | Filter berdasarkan pembuat           | User ID yang valid                               |
| `urgency_level`       | string       | ❌    | Filter berdasarkan tingkat urgensi   | `low`, `normal`, `high`, `critical`              |
| `verification_status` | string       | ❌    | Filter berdasarkan status verifikasi | `pending`, `verified`, `disputed`, `rejected`    |
| `tags`                | array/string | ❌    | Filter berdasarkan tag               | Array tag atau single tag                        |
| `near_lat`            | float        | ❌    | Latitude untuk pencarian lokasi      | -90.0 sampai 90.0                                |
| `near_lng`            | float        | ❌    | Longitude untuk pencarian lokasi     | -180.0 sampai 180.0                              |
| `radius_km`           | float        | ❌    | Radius pencarian dalam km            | 0.1 sampai 1000 (default: 10)                    |
| `sort_by`             | string       | ❌    | Urutan hasil                         | `created_at`, `votes`, `urgency`, `verification` |
| `limit`               | integer      | ❌    | Jumlah hasil per halaman             | 1 sampai 100 (default: 20)                       |
| `start_after`         | string       | ❌    | ID laporan untuk pagination          | Report ID yang valid                             |
| `include_expired`     | boolean      | ❌    | Sertakan laporan kedaluwarsa         | `true`, `false` (default: false)                 |

#### Query Parameter

##### **urgency_level**

- `low`: Tingkat urgensi rendah (informasi umum)
- `normal`: Tingkat urgensi normal (kondisi standar)
- `high`: Tingkat urgensi tinggi (perlu perhatian)
- `critical`: Tingkat urgensi kritis (bahaya segera)

##### **verification_status**

- `pending`: Menunggu verifikasi
- `verified`: Sudah diverifikasi dan valid
- `disputed`: Dipertanyakan keakuratannya
- `rejected`: Ditolak karena tidak valid

##### **sort_by**

- `created_at`: Urutkan berdasarkan waktu pembuatan (terbaru dulu)
- `votes`: Urutkan berdasarkan jumlah vote (terbanyak dulu)
- `urgency`: Urutkan berdasarkan tingkat urgensi (tertinggi dulu)
- `verification`: Urutkan berdasarkan confidence score verifikasi (tertinggi dulu)

##### **tags** (Contoh tag yang umum digunakan)

- `gelombang_tinggi`: Kondisi gelombang tinggi
- `angin_kencang`: Angin kencang
- `kabut_tebal`: Kabut tebal/visibility rendah
- `cuaca_buruk`: Cuaca buruk secara umum
- `arus_kuat`: Arus laut yang kuat
- `pasang_surut`: Kondisi pasang surut ekstrem
- `bahaya_navigasi`: Bahaya untuk navigasi
- `kecelakaan`: Laporan kecelakaan
- `pencarian_pertolongan`: SAR/pencarian dan pertolongan

#### Contoh Request

```bash
GET /api/report/search?community_id=community_123&urgency_level=high&limit=10
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_456",
        "title": "Gelombang Tinggi di Teluk Jakarta",
        "urgency_level": "high",
        "verification": {
          "status": "verified",
          "confidence_score": 85
        },
        "voting": {
          "total_votes": 12,
          "accuracy_rating": 4.2
        },
        "created_at": "2025-07-24T10:30:00Z"
      }
    ],
    "total": 1,
    "filters": {
      "community_id": "community_123",
      "urgency_level": "high"
    }
  }
}
```

---

### 3. Laporan Berdasarkan Lokasi

**`GET /api/report/location`**

Mendapatkan laporan di sekitar koordinat tertentu.

#### Parameter Query

| Parameter   | Tipe    | Wajib | Deskripsi                      |
| ----------- | ------- | ----- | ------------------------------ |
| `latitude`  | float   | ✅    | Latitude pusat pencarian       |
| `longitude` | float   | ✅    | Longitude pusat pencarian      |
| `radius_km` | float   | ❌    | Radius pencarian (default: 10) |
| `limit`     | integer | ❌    | Jumlah hasil (default: 20)     |

#### Contoh Request

```bash
GET /api/report/location?latitude=-6.1344&longitude=106.8446&radius_km=5
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_456",
        "title": "Gelombang Tinggi di Teluk Jakarta",
        "location": {
          "latitude": -6.1344,
          "longitude": 106.8446
        },
        "urgency_level": "high",
        "created_at": "2025-07-24T10:30:00Z"
      }
    ],
    "total": 1,
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446
    },
    "radius_km": 5
  }
}
```

---

### 4. Detail Laporan

**`GET /api/report/:reportId`**

Mendapatkan detail lengkap laporan.

#### Contoh Request

```bash
GET /api/report/report_456
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "id": "report_456",
    "community_id": "community_123",
    "author_id": "user_789",
    "author_name": "Ahmad Nelayan",
    "title": "Gelombang Tinggi di Teluk Jakarta",
    "description": "Laporan kondisi gelombang tinggi...",
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "address": "Teluk Jakarta"
    },
    "conditions": {
      "wave_height": 2.5,
      "wind_speed": 25,
      "visibility": 3
    },
    "safety_assessment": {
      "overall_safety": "caution",
      "boat_recommendations": {
        "perahu_kecil": "avoid",
        "kapal_nelayan": "caution"
      }
    },
    "verification": {
      "status": "verified",
      "verified_by": "moderator_123",
      "verified_at": "2025-07-24T11:00:00Z",
      "confidence_score": 85
    },
    "voting": {
      "upvotes": 8,
      "downvotes": 1,
      "total_votes": 9,
      "accuracy_rating": 4.2
    },
    "comments": [
      {
        "id": "comment_789",
        "author_name": "Budi Nelayan",
        "content": "Terima kasih atas laporannya, sangat membantu!",
        "created_at": "2025-07-24T11:30:00Z"
      }
    ],
    "view_count": 45,
    "created_at": "2025-07-24T10:30:00Z"
  }
}
```

---

### 5. Vote Laporan

**`POST /api/report/:reportId/vote`**

Memberikan vote dan rating akurasi pada laporan.

#### Parameter Request Body

| Parameter         | Tipe    | Wajib | Deskripsi                                              |
| ----------------- | ------- | ----- | ------------------------------------------------------ |
| `vote_type`       | string  | ❌    | Jenis vote: "up" atau "down" (kosong untuk hapus vote) |
| `accuracy_rating` | integer | ❌    | Rating akurasi 1-5                                     |

#### Contoh Request

```bash
POST /api/report/report_456/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "vote_type": "up",
  "accuracy_rating": 4
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Vote up berhasil",
  "data": {
    "report_id": "report_456",
    "voting": {
      "upvotes": 9,
      "downvotes": 1,
      "total_votes": 10,
      "accuracy_rating": 4.1
    }
  }
}
```

---

### 6. Verifikasi Laporan

**`POST /api/report/:reportId/verify`**

Memverifikasi laporan (hanya moderator/admin).

#### Parameter Request Body

| Parameter | Tipe   | Wajib | Deskripsi                                  |
| --------- | ------ | ----- | ------------------------------------------ |
| `status`  | string | ✅    | Status: "verified", "disputed", "rejected" |
| `notes`   | string | ❌    | Catatan verifikasi                         |

#### Contoh Request

```bash
POST /api/report/report_456/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified",
  "notes": "Laporan telah diverifikasi berdasarkan data cuaca resmi BMKG"
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Laporan berhasil diverifikasi",
  "data": {
    "id": "report_456",
    "verification": {
      "status": "verified",
      "verified_by": "moderator_123",
      "verified_at": "2025-07-24T12:00:00Z",
      "verification_notes": "Laporan telah diverifikasi...",
      "confidence_score": 90
    }
  }
}
```

---

### 7. Tambah Komentar

**`POST /api/report/:reportId/comments`**

Menambahkan komentar pada laporan.

#### Parameter Request Body

| Parameter | Tipe   | Wajib | Deskripsi                     |
| --------- | ------ | ----- | ----------------------------- |
| `content` | string | ✅    | Isi komentar (min 5 karakter) |

#### Contoh Request

```bash
POST /api/report/report_456/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Terima kasih atas laporannya. Sangat membantu untuk keselamatan berlayar di area ini."
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Komentar berhasil ditambahkan",
  "data": {
    "report_id": "report_456",
    "comments": [
      {
        "id": "comment_new",
        "author_name": "Current User",
        "content": "Terima kasih atas laporannya...",
        "created_at": "2025-07-24T13:00:00Z"
      }
    ]
  }
}
```

---

### 8. Statistik Laporan Komunitas

**`GET /api/report/community/:communityId/stats`**

Mendapatkan statistik laporan untuk komunitas.

#### Contoh Request

```bash
GET /api/report/community/community_123/stats
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "community_id": "community_123",
    "statistics": {
      "total_reports": 45,
      "verified_reports": 38,
      "pending_reports": 5,
      "high_urgency_reports": 8,
      "reports_last_24h": 3,
      "average_accuracy_rating": 4.2
    }
  }
}
```

---

## 🚨 Response Error

### Error Validasi (400)

```json
{
  "success": false,
  "error": "Data tidak valid",
  "details": {
    "title": "Judul laporan minimal 5 karakter",
    "location": "Koordinat latitude dan longitude diperlukan"
  }
}
```

### Error Akses Ditolak (403)

```json
{
  "success": false,
  "error": "Hanya moderator atau admin yang dapat memverifikasi laporan"
}
```

---

_Terakhir diperbarui: Juli 2025_
