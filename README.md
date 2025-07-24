# 🌊 Pelaut Hebat - Ocean Safety Hub API

**Platform keselamatan maritim Indonesia** yang menyediakan data cuaca laut real-time, analisis AI, dan sistem peringatan dini untuk nelayan dan masyarakat pesisir.

## ✨ Fitur Utama

- **🌊 Data Cuaca Maritim**: Gelombang, angin, dan kondisi laut dari Open Meteo API
- **🤖 AI-Powered Analysis**: Penjelasan kondisi laut dalam bahasa natural menggunakan Google Gemini AI
- **⚖️ Safety Prediction System**: Sistem prediksi keamanan berlayar dengan penilaian kuantitatif (0-100)
- **🗺️ Analisis Zona Aman**: Analisis zona keamanan dengan grid mapping untuk area planning
- **🛣️ Rekomendasi Route Aman**: Rekomendasi rute aman dengan waypoint analysis
- **🏘️ Komunitas Nelayan**: Platform komunitas untuk berbagi informasi dan koordinasi antar nelayan
- **📊 Laporan Kondisi Laut**: Sistem laporan real-time dari nelayan dengan verifikasi dan voting
- **⏰ Rekomendasi Waktu Berlayar**: Saran waktu terbaik berdasarkan jenis perahu dan kondisi cuaca
- **🚨 Deteksi Anomali & Peringatan Dini**: Sistem deteksi pola cuaca tidak normal dengan berbagai tingkat sensitivitas
- **🗺️ Auto-Detection Timezone**: Deteksi otomatis zona waktu Indonesia (WIB/WITA/WIT) berdasarkan koordinat
- **🔐 Authentication & Authorization**: Sistem autentikasi Firebase dengan Google OAuth
- **📊 Caching & Performance**: Sistem cache untuk optimasi performa API

## 🛠️ Tech Stack

- **Backend Framework**: Express.js dengan middleware keamanan lengkap
- **Database**: Firebase Firestore untuk data pengguna dan konfigurasi
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **External APIs**:
  - **Open Meteo API**: Data cuaca maritim dan forecast
  - **Google Gemini AI**: Analisis kondisi laut dan rekomendasi cerdas
- **Security**: Helmet, CORS, Rate Limiting, Input validation
- **Performance**: Response caching, request optimization
- **Testing**: Jest, Supertest dengan coverage lengkap
- **Monitoring**: Structured logging dengan Winston

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Firebase Project dengan Firestore dan Authentication enabled

### Installation

1. Clone repository

```bash
git clone https://github.com/dzuura/ocean-safety-hub.git
cd ocean-safety-hub
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
# Edit .env dengan API keys Firebase dan konfigurasi lainnya
```

4. Start development server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server dengan nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests dalam watch mode

## 📁 Struktur Proyek

```
src/
├── config/          # Konfigurasi aplikasi
├── controllers/     # Request handlers
│   ├── weatherController.js    # Weather & marine data
│   ├── aiController.js         # AI-powered features
│   ├── safetyController.js     # Safety prediction system
│   ├── communityController.js  # Community management
│   ├── reportController.js     # Report management
│   └── authController.js       # Authentication
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── validation.js # Input validation
├── models/          # Database models
│   ├── Community.js # Community model
│   ├── Report.js    # Report model
│   └── Discussion.js # Discussion model
├── routes/          # API routes
│   ├── weather.js   # Weather endpoints
│   ├── ai.js        # AI endpoints
│   ├── safety.js    # Safety endpoints
│   ├── community.js # Community endpoints
│   ├── report.js    # Report endpoints
│   └── auth.js      # Auth endpoints
├── services/        # Business logic & external API integrations
│   ├── weatherService.js       # Weather data integration
│   ├── aiService.js            # AI service integration
│   ├── safetyAnalyzer.js       # Safety analysis algorithms
│   ├── communityService.js     # Community operations
│   └── reportService.js        # Report operations
├── utils/           # Utility functions
└── docs/            # Documentation
    ├── SAFETY_SYSTEMS_COMPARISON.md
    ├── SAFETY_API_REFERENCE.md
    ├── COMMUNITY_API_REFERENCE.md
    └── REPORT_API_REFERENCE.md
```

## 🔧 Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

Key variables:

- `OPEN_METEO_API_URL`: URL API Open Meteo
- `GEMINI_API_KEY`: API key untuk Google Gemini AI
- `FIREBASE_PROJECT_ID`: Firebase Project ID
- `FIREBASE_PRIVATE_KEY`: Firebase Admin SDK Private Key
- `FIREBASE_CLIENT_EMAIL`: Firebase Service Account Email
- `FIREBASE_CLIENT_ID`: Firebase Client ID
- `PORT`: Port server (default: 3001)

## 📊 API Endpoints

### 🏥 Health Check

- `GET /api/health` - Status kesehatan API dan environment info
- `GET /api` - Informasi API dan daftar semua endpoint tersedia

### 🌊 Weather & Marine Data

| Endpoint                   | Method | Description                                   | Auth Required |
| -------------------------- | ------ | --------------------------------------------- | ------------- |
| `/api/weather/marine`      | GET    | Data cuaca maritim (gelombang, arah, periode) | Optional      |
| `/api/weather/current`     | GET    | Data cuaca umum (suhu, angin, tekanan)        | Optional      |
| `/api/weather/complete`    | GET    | Data cuaca lengkap (maritim + umum)           | Optional      |
| `/api/weather/cache/stats` | GET    | Statistik cache weather service               | No            |
| `/api/weather/cache`       | DELETE | Clear cache weather service                   | No            |

### ⚖️ Safety Prediction System

| Endpoint              | Method | Description                                      | Auth Required |
| --------------------- | ------ | ------------------------------------------------ | ------------- |
| `/api/safety/analyze` | GET    | Analisis keamanan berlayar untuk lokasi tertentu | Optional      |
| `/api/safety/zones`   | GET    | Grid analysis zona keamanan dalam area tertentu  | Optional      |
| `/api/safety/route`   | GET    | Rekomendasi rute aman dengan waypoint analysis   | Optional      |

### 🏘️ Community Management

| Endpoint                        | Method | Description                             | Auth Required |
| ------------------------------- | ------ | --------------------------------------- | ------------- |
| `/api/community`                | POST   | Membuat komunitas baru                  | Yes           |
| `/api/community/search`         | GET    | Mencari komunitas dengan filter         | Optional      |
| `/api/community/my`             | GET    | Daftar komunitas yang diikuti pengguna  | Yes           |
| `/api/community/:id`            | GET    | Detail komunitas                        | Optional      |
| `/api/community/:id`            | PUT    | Update komunitas (admin/moderator only) | Yes           |
| `/api/community/:id`            | DELETE | Hapus komunitas (admin only)            | Yes           |
| `/api/community/:id/join`       | POST   | Bergabung dengan komunitas              | Yes           |
| `/api/community/:id/leave`      | POST   | Keluar dari komunitas                   | Yes           |
| `/api/community/:id/members`    | GET    | Daftar anggota komunitas                | Optional      |
| `/api/community/:id/moderators` | POST   | Tambah moderator (admin only)           | Yes           |
| `/api/community/:id/moderators` | DELETE | Hapus moderator (admin only)            | Yes           |

### 📊 Report Management

| Endpoint                          | Method | Description                                  | Auth Required |
| --------------------------------- | ------ | -------------------------------------------- | ------------- |
| `/api/report`                     | POST   | Membuat laporan kondisi laut                 | Yes           |
| `/api/report/search`              | GET    | Mencari laporan dengan filter                | Optional      |
| `/api/report/location`            | GET    | Laporan berdasarkan koordinat                | Optional      |
| `/api/report/:id`                 | GET    | Detail laporan                               | Optional      |
| `/api/report/:id`                 | PUT    | Update laporan (author/moderator only)       | Yes           |
| `/api/report/:id`                 | DELETE | Hapus laporan (author/moderator only)        | Yes           |
| `/api/report/:id/vote`            | POST   | Vote pada laporan (upvote/downvote + rating) | Yes           |
| `/api/report/:id/verify`          | POST   | Verifikasi laporan (moderator only)          | Yes           |
| `/api/report/:id/comments`        | POST   | Tambah komentar pada laporan                 | Yes           |
| `/api/report/community/:id/stats` | GET    | Statistik laporan komunitas                  | Optional      |

### 🤖 AI-Powered Features

| Endpoint                     | Method | Description                                         | Auth Required |
| ---------------------------- | ------ | --------------------------------------------------- | ------------- |
| `/api/ai/explain-conditions` | POST   | Penjelasan kondisi laut dalam bahasa natural        | Yes           |
| `/api/ai/recommend-times`    | POST   | Rekomendasi waktu berlayar berdasarkan jenis perahu | Yes           |
| `/api/ai/detect-anomalies`   | POST   | Deteksi anomali cuaca dan peringatan dini           | Yes           |
| `/api/ai/early-warnings`     | GET    | Peringatan dini untuk lokasi tertentu               | Yes           |
| `/api/ai/status`             | GET    | Status layanan AI                                   | No            |

### 🔐 Authentication

| Endpoint                            | Method | Description                                |
| ----------------------------------- | ------ | ------------------------------------------ |
| `/api/auth/register`                | POST   | Registrasi user baru dengan email/password |
| `/api/auth/login`                   | POST   | Login dengan email/password                |
| `/api/auth/google-signin`           | POST   | Login dengan Google OAuth                  |
| `/api/auth/verify`                  | POST   | Verifikasi Firebase ID token               |
| `/api/auth/profile`                 | GET    | Mendapatkan profil user                    |
| `/api/auth/profile`                 | PUT    | Update profil user                         |
| `/api/auth/logout`                  | POST   | Logout user                                |
| `/api/auth/forgot-password`         | POST   | Reset password via email                   |
| `/api/auth/send-verification-email` | POST   | Kirim email verifikasi                     |
| `/api/auth/account`                 | DELETE | Hapus akun user                            |

## 📋 Response Format

Semua API endpoint menggunakan format response yang konsisten:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Error details if available
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "latitude": "Latitude harus berupa angka antara -90 dan 90",
    "longitude": "Longitude diperlukan"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🏘️ Fitur Komunitas & Laporan

### **Community Features**

- ✅ **Buat/Join Komunitas** - Nelayan dapat membuat atau bergabung dengan komunitas lokal
- ✅ **Membership Management** - Admin komunitas dapat mengelola anggota dan moderator
- ✅ **Public/Private Communities** - Komunitas publik dan privat dengan approval system
- ✅ **Location-based** - Komunitas berdasarkan wilayah geografis (WIB/WITA/WIT)
- ✅ **Search & Filter** - Pencarian komunitas dengan tags dan region
- ✅ **Role Management** - Sistem admin, moderator, dan member

### **Report Features**

- ✅ **Real-time Reports** - Laporan kondisi laut dari nelayan di lapangan
- ✅ **Verification System** - Sistem verifikasi laporan oleh moderator komunitas
- ✅ **Voting & Rating** - Upvote/downvote dengan accuracy rating (1-5)
- ✅ **Location-based** - Laporan berdasarkan koordinat dengan radius search
- ✅ **Comment System** - Sistem komentar untuk diskusi laporan
- ✅ **Urgency Levels** - 4 level urgensi (low, normal, high, critical)
- ✅ **Safety Assessment** - Rekomendasi keamanan per jenis perahu
- ✅ **Statistics** - Statistik laporan per komunitas

### **Advanced Features**

- ✅ **Media Support** - Upload foto/video dalam laporan
- ✅ **Expiration System** - Laporan dengan waktu kedaluwarsa
- ✅ **Confidence Scoring** - Algoritma confidence score berdasarkan voting
- ✅ **Geolocation Search** - Pencarian berdasarkan koordinat dan radius
- ✅ **Tag System** - Sistem tag untuk kategorisasi dan pencarian

### 📊 Performance & Limits

**Open Meteo Free Tier Limits:**

- Daily: 10,000 calls/day
- Hourly: 5,000 calls/hour
- Forecast: Up to 16 days (recommend max 7)
- Historical: Up to 92 days (recommend max 7)

**Recommended Parameters:**

- `forecast_days`: 1-7 (optimal performance)
- `forecast_hours`: 6-168 (optimal performance)
- `historical_days`: 1-7 (optimal performance)

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- weather.test.js
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

### Development Guidelines

- Gunakan ESLint dan Prettier untuk code formatting
- Tulis tests untuk semua fitur baru
- Update dokumentasi API jika menambah endpoint baru
- Ikuti conventional commits untuk pesan commit

## 📞 Support

- **Documentation**: [API Documentation](https://documenter.getpostman.com/view/39730752/2sB34mhHjK)
- **Issues**: [GitHub Issues](https://github.com/dzuura/ocean-safety-hub/issues)
- **Email**: support@pelaut-hebat.com

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.
