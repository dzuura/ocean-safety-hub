# Firebase Setup Guide untuk Pelaut Hebat

Panduan lengkap untuk setup Firebase Authentication dan Firestore untuk aplikasi Pelaut Hebat.

## 🔥 Langkah-langkah Setup Firebase

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project: `pelaut-hebat`
4. Aktifkan Google Analytics (opsional)
5. Pilih region: `asia-southeast1` (Singapore) untuk performa terbaik di Indonesia

### 2. Setup Authentication

1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di sidebar kiri
3. Klik tab "Sign-in method"
4. Aktifkan provider berikut:
   - **Email/Password**: Klik dan aktifkan
   - **Google**: Klik, aktifkan, dan masukkan support email

### 3. Setup Firestore Database

1. Klik "Firestore Database" di sidebar kiri
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih location: `asia-southeast1`

### 4. Buat Service Account

1. Klik ⚙️ (Settings) > "Project settings"
2. Klik tab "Service accounts"
3. Klik "Generate new private key"
4. Download file JSON yang dihasilkan
5. Simpan file dengan aman (jangan commit ke git!)

### 5. Setup Web App

1. Di Project settings, klik tab "General"
2. Scroll ke bawah ke "Your apps"
3. Klik icon web (</>) untuk "Add app"
4. Masukkan app nickname: `pelaut-hebat-web`
5. Centang "Also set up Firebase Hosting" (opsional)
6. Copy konfigurasi yang dihasilkan

## 🔧 Konfigurasi Environment Variables

Buat file `.env` berdasarkan `.env.example` dan isi dengan data dari Firebase:

### Dari Service Account JSON:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
```

### Dari Web App Config:
```env
FIREBASE_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## 🗄️ Struktur Database Firestore

### Collections yang akan dibuat:

#### `users` Collection
```javascript
{
  uid: "firebase-user-uid",
  email: "user@example.com",
  name: "Nama User",
  picture: "https://profile-picture-url",
  phone: "+62812345678",
  location: "Kota, Provinsi",
  bio: "Deskripsi singkat user",
  role: "user", // atau "admin"
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

#### `reports` Collection (untuk laporan komunitas)
```javascript
{
  id: "auto-generated-id",
  userId: "firebase-user-uid",
  userName: "Nama Pelapor",
  title: "Judul Laporan",
  description: "Deskripsi kondisi laut",
  location: {
    latitude: -6.2088,
    longitude: 106.8456,
    address: "Alamat lokasi"
  },
  category: "weather", // "weather", "safety", "emergency"
  severity: "moderate", // "low", "moderate", "high", "critical"
  images: ["url1", "url2"],
  status: "active", // "active", "resolved", "archived"
  likes: 0,
  comments: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Rules

### Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reports are readable by all authenticated users
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## 🧪 Testing Firebase Setup

Setelah konfigurasi selesai, test dengan:

```bash
# Test server
npm run dev

# Test endpoints
curl http://localhost:3001/api/auth/config
```

## 📱 Frontend Integration

Untuk frontend Next.js, gunakan konfigurasi berikut:

```javascript
// firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 🚨 Security Best Practices

1. **Jangan commit file service account** ke repository
2. **Gunakan environment variables** untuk semua konfigurasi sensitif
3. **Setup proper Firestore security rules** sebelum production
4. **Enable App Check** untuk production
5. **Monitor usage** di Firebase Console
6. **Setup billing alerts** untuk menghindari biaya tak terduga

## 📞 Troubleshooting

### Error: "Firebase Admin SDK not initialized"
- Pastikan semua environment variables sudah diset dengan benar
- Cek format FIREBASE_PRIVATE_KEY (harus include \n untuk newlines)

### Error: "Permission denied"
- Cek Firestore security rules
- Pastikan user sudah authenticated

### Error: "Project not found"
- Pastikan FIREBASE_PROJECT_ID benar
- Cek apakah project sudah dibuat di Firebase Console
