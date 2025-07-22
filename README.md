# Pelaut Hebat - Backend API

Platform backend untuk Pelaut Hebat, sistem keselamatan transportasi laut dan kesejahteraan masyarakat pesisir.

## 🌊 Fitur Utama

- **Peta Interaktif**: API untuk data zona aman/berbahaya berdasarkan kondisi laut
- **Prediksi Waktu Aman Berlayar**: Rekomendasi waktu terbaik untuk berlayar
- **Notifikasi & Peringatan**: Sistem peringatan real-time untuk cuaca buruk
- **Cek Lokasi Spesifik**: Data kondisi laut berdasarkan koordinat
- **Integrasi AI**: Insight dari Gemini AI untuk analisis kondisi laut
- **Fitur Komunitas**: Sistem laporan dan diskusi antar pengguna

## 🛠️ Tech Stack

- **Backend**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **External APIs**:
  - Open Meteo (data cuaca laut)
  - Google Gemini AI (analisis dan insight)
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Firebase Project dengan Firestore dan Authentication enabled

### Installation

1. Clone repository

```bash
git clone <repository-url>
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
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic & external API integrations
└── utils/           # Utility functions
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

### Health Check

- `GET /health` - Status kesehatan API

### Weather & Marine Data

- `GET /api/weather/marine` - Data cuaca maritim (gelombang, arah, periode)
- `GET /api/weather/current` - Data cuaca umum (suhu, angin, tekanan)
- `GET /api/weather/complete` - Data cuaca lengkap (maritim + umum)
- `GET /api/weather/locations/popular` - Lokasi populer nelayan Indonesia
- `GET /api/weather/cache/stats` - Statistik cache
- `DELETE /api/weather/cache` - Clear cache

### Authentication

- `POST /api/auth/verify` - Verifikasi Firebase token
- `GET /api/auth/profile` - Profil user
- `PUT /api/auth/profile` - Update profil user

### Safety & Predictions (Coming Soon)

- `GET /api/safety` - Analisis zona keamanan
- `GET /api/predictions` - Prediksi waktu aman berlayar

### Community (Coming Soon)

- `GET /api/community/reports` - Laporan komunitas
- `POST /api/community/reports` - Buat laporan baru

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.
