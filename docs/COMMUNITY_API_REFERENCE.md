# 🏘️ Community API - Referensi Lengkap

## 📋 Ringkasan

API Komunitas memungkinkan pengguna untuk membuat, bergabung, dan mengelola komunitas nelayan dengan fitur diskusi, laporan, dan moderasi.

---

## 🎯 Endpoint Komunitas

### 1. Buat Komunitas Baru

**`POST /api/community`**

Membuat komunitas baru dengan pengguna sebagai admin.

#### Parameter Request Body

| Parameter                | Tipe    | Wajib | Deskripsi                                    |
| ------------------------ | ------- | ----- | -------------------------------------------- |
| `name`                   | string  | ✅    | Nama komunitas (min 3 karakter)              |
| `description`            | string  | ✅    | Deskripsi komunitas (min 10 karakter)        |
| `location`               | object  | ✅    | Data lokasi komunitas                        |
| `location.latitude`      | float   | ✅    | Latitude (-90 sampai 90)                     |
| `location.longitude`     | float   | ✅    | Longitude (-180 sampai 180)                  |
| `location.address`       | string  | ❌    | Alamat lengkap                               |
| `location.region`        | string  | ❌    | Wilayah (WIB/WITA/WIT)                       |
| `is_public`              | boolean | ❌    | Komunitas publik (default: true)             |
| `join_approval_required` | boolean | ❌    | Perlu persetujuan bergabung (default: false) |
| `tags`                   | array   | ❌    | Tag komunitas                                |
| `rules`                  | array   | ❌    | Aturan komunitas                             |

#### Contoh Request

```bash
POST /api/community
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nelayan Jakarta Utara",
  "description": "Komunitas nelayan di wilayah Jakarta Utara untuk berbagi informasi dan tips berlayar",
  "location": {
    "latitude": -6.1344,
    "longitude": 106.8446,
    "address": "Jakarta Utara",
    "region": "WIB"
  },
  "is_public": true,
  "tags": ["nelayan", "jakarta", "kapal_nelayan"],
  "rules": [
    "Gunakan bahasa yang sopan",
    "Berbagi informasi yang akurat",
    "Hormati sesama anggota"
  ]
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Komunitas berhasil dibuat",
  "data": {
    "id": "community_123",
    "name": "Nelayan Jakarta Utara",
    "description": "Komunitas nelayan di wilayah Jakarta Utara...",
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446,
      "address": "Jakarta Utara",
      "region": "WIB"
    },
    "admin_id": "user_456",
    "members": ["user_456"],
    "member_count": 1,
    "is_public": true,
    "created_at": "2025-07-24T10:30:00Z"
  }
}
```

---

### 2. Cari Komunitas

**`GET /api/community/search`**

Mencari komunitas dengan berbagai filter.

#### Parameter Query

| Parameter     | Tipe    | Wajib | Deskripsi                             |
| ------------- | ------- | ----- | ------------------------------------- |
| `q`           | string  | ❌    | Kata kunci pencarian                  |
| `region`      | string  | ❌    | Filter berdasarkan wilayah            |
| `tags`        | array   | ❌    | Filter berdasarkan tag                |
| `is_public`   | boolean | ❌    | Filter komunitas publik/privat        |
| `sort_by`     | string  | ❌    | Urutan: created_at, members, activity |
| `limit`       | integer | ❌    | Jumlah hasil (default: 20)            |
| `start_after` | string  | ❌    | ID untuk pagination                   |

#### Contoh Request

```bash
GET /api/community/search?region=WIB&tags=nelayan&is_public=true&limit=10
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "community_123",
        "name": "Nelayan Jakarta Utara",
        "description": "Komunitas nelayan...",
        "member_count": 25,
        "tags": ["nelayan", "jakarta"],
        "location": {
          "region": "WIB"
        },
        "created_at": "2025-07-24T10:30:00Z"
      }
    ],
    "total": 1,
    "filters": {
      "region": "WIB",
      "tags": ["nelayan"],
      "is_public": true
    }
  }
}
```

---

### 3. Detail Komunitas

**`GET /api/community/:communityId`**

Mendapatkan detail komunitas beserta anggota.

#### Contoh Request

```bash
GET /api/community/community_123
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "id": "community_123",
    "name": "Nelayan Jakarta Utara",
    "description": "Komunitas nelayan...",
    "location": {
      "latitude": -6.1344,
      "longitude": 106.8446
    },
    "admin_id": "user_456",
    "moderators": ["user_789"],
    "members": ["user_456", "user_789", "user_101"],
    "member_count": 3,
    "statistics": {
      "total_posts": 15,
      "total_reports": 8,
      "active_members": 12
    },
    "user_role": "admin",
    "created_at": "2025-07-24T10:30:00Z"
  }
}
```

---

### 4. Bergabung dengan Komunitas

**`POST /api/community/:communityId/join`**

Bergabung dengan komunitas yang dipilih.

#### Contoh Request

```bash
POST /api/community/community_123/join
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Berhasil bergabung dengan komunitas",
  "data": {
    "id": "community_123",
    "member_count": 4,
    "members": ["user_456", "user_789", "user_101", "user_current"]
  }
}
```

---

### 5. Keluar dari Komunitas

**`POST /api/community/:communityId/leave`**

Keluar dari komunitas (admin tidak bisa keluar).

#### Contoh Request

```bash
POST /api/community/community_123/leave
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Berhasil keluar dari komunitas",
  "data": {
    "id": "community_123",
    "member_count": 3
  }
}
```

---

### 6. Komunitas Saya

**`GET /api/community/my`**

Mendapatkan daftar komunitas yang diikuti pengguna.

#### Contoh Request

```bash
GET /api/community/my
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "community_123",
        "name": "Nelayan Jakarta Utara",
        "member_count": 25,
        "user_role": "admin"
      },
      {
        "id": "community_456",
        "name": "Nelayan Bali",
        "member_count": 18,
        "user_role": "member"
      }
    ],
    "total": 2
  }
}
```

---

### 7. Anggota Komunitas

**`GET /api/community/:communityId/members`**

Mendapatkan daftar anggota komunitas.

#### Parameter Query

| Parameter | Tipe    | Wajib | Deskripsi                    |
| --------- | ------- | ----- | ---------------------------- |
| `limit`   | integer | ❌    | Jumlah anggota (default: 50) |

#### Contoh Request

```bash
GET /api/community/community_123/members?limit=20
Authorization: Bearer <token>
```

#### Contoh Response

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "user_id": "user_456",
        "role": "admin",
        "joined_at": "2025-07-24T10:30:00Z"
      },
      {
        "user_id": "user_789",
        "role": "moderator",
        "joined_at": "2025-07-24T11:00:00Z"
      }
    ],
    "total": 2,
    "community_id": "community_123"
  }
}
```

---

### 8. Kelola Moderator

**`POST /api/community/:communityId/moderators`** - Tambah Moderator
**`DELETE /api/community/:communityId/moderators`** - Hapus Moderator

Mengelola moderator komunitas (hanya admin).

#### Parameter Request Body

| Parameter | Tipe   | Wajib | Deskripsi                                         |
| --------- | ------ | ----- | ------------------------------------------------- |
| `userId`  | string | ✅    | ID pengguna yang akan dijadikan/dihapus moderator |

#### Contoh Request

```bash
POST /api/community/community_123/moderators
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_789"
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Moderator berhasil ditambahkan",
  "data": {
    "id": "community_123",
    "moderators": ["user_789"]
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
    "name": "Nama komunitas minimal 3 karakter",
    "location": "Koordinat latitude dan longitude diperlukan"
  }
}
```

### Error Autentikasi (401)

```json
{
  "success": false,
  "error": "Token autentikasi diperlukan"
}
```

### Error Akses Ditolak (403)

```json
{
  "success": false,
  "error": "Hanya admin yang dapat mengelola moderator"
}
```

### Error Tidak Ditemukan (404)

```json
{
  "success": false,
  "error": "Komunitas tidak ditemukan"
}
```

---

## 📊 Status Codes

| Code | Status                | Deskripsi                                   |
| ---- | --------------------- | ------------------------------------------- |
| 200  | OK                    | Request berhasil                            |
| 201  | Created               | Resource berhasil dibuat                    |
| 400  | Bad Request           | Data request tidak valid                    |
| 401  | Unauthorized          | Token autentikasi diperlukan                |
| 403  | Forbidden             | Akses ditolak                               |
| 404  | Not Found             | Resource tidak ditemukan                    |
| 409  | Conflict              | Konflik data (misal: sudah menjadi anggota) |
| 500  | Internal Server Error | Error server                                |

---

_Terakhir diperbarui: Juli 2025_
