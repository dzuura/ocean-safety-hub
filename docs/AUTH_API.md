# 🔐 Auth API - Referensi Lengkap

## 📋 Ringkasan

API Authentication menyediakan sistem autentikasi lengkap menggunakan Firebase Authentication dengan dukungan Google OAuth, email/password, dan manajemen profil pengguna.

---

## 🎯 Endpoint Authentication

### 1. Registrasi Pengguna
**`POST /api/auth/register`**

Mendaftarkan pengguna baru dengan email dan password.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `email` | string | ✅ | Email pengguna (format valid) |
| `password` | string | ✅ | Password (minimal 6 karakter) |
| `displayName` | string | ❌ | Nama tampilan pengguna |
| `phoneNumber` | string | ❌ | Nomor telepon |

#### Contoh Request
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "nelayan@example.com",
  "password": "password123",
  "displayName": "Ahmad Nelayan",
  "phoneNumber": "+6281234567890"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "uid": "firebase_user_id_123",
      "email": "nelayan@example.com",
      "displayName": "Ahmad Nelayan",
      "phoneNumber": "+6281234567890",
      "emailVerified": false,
      "photoURL": null,
      "disabled": false,
      "metadata": {
        "creationTime": "2025-07-24T10:30:00Z",
        "lastSignInTime": null
      },
      "customClaims": {},
      "providerData": [
        {
          "uid": "nelayan@example.com",
          "email": "nelayan@example.com",
          "providerId": "password"
        }
      ]
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBwAAAAAGQhqOZ8...",
    "expiresIn": "3600"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 2. Login Pengguna
**`POST /api/auth/login`**

Login pengguna dengan email dan password.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `email` | string | ✅ | Email pengguna |
| `password` | string | ✅ | Password pengguna |

#### Contoh Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "nelayan@example.com",
  "password": "password123"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uid": "firebase_user_id_123",
      "email": "nelayan@example.com",
      "displayName": "Ahmad Nelayan",
      "phoneNumber": "+6281234567890",
      "emailVerified": true,
      "photoURL": "https://example.com/avatar.jpg",
      "disabled": false,
      "metadata": {
        "creationTime": "2025-07-20T10:30:00Z",
        "lastSignInTime": "2025-07-24T10:30:00Z"
      },
      "customClaims": {
        "role": "user",
        "community_admin": ["community_123"]
      }
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBwAAAAAGQhqOZ8...",
    "expiresIn": "3600"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 3. Google OAuth Login
**`POST /api/auth/google`**

Login menggunakan Google OAuth token.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `idToken` | string | ✅ | Google ID Token dari client |

#### Contoh Request
```bash
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzAyN..."
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "uid": "google_firebase_user_id",
      "email": "user@gmail.com",
      "displayName": "User Name",
      "photoURL": "https://lh3.googleusercontent.com/...",
      "emailVerified": true,
      "disabled": false,
      "metadata": {
        "creationTime": "2025-07-24T10:30:00Z",
        "lastSignInTime": "2025-07-24T10:30:00Z"
      },
      "providerData": [
        {
          "uid": "google_user_id",
          "email": "user@gmail.com",
          "displayName": "User Name",
          "photoURL": "https://lh3.googleusercontent.com/...",
          "providerId": "google.com"
        }
      ]
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBwAAAAAGQhqOZ8...",
    "expiresIn": "3600",
    "isNewUser": false
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 4. Refresh Token
**`POST /api/auth/refresh`**

Memperbarui access token menggunakan refresh token.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `refreshToken` | string | ✅ | Refresh token yang valid |

#### Contoh Request
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "AMf-vBwAAAAAGQhqOZ8..."
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBwAAAAAGQhqOZ8...",
    "expiresIn": "3600",
    "tokenType": "Bearer"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 5. Logout
**`POST /api/auth/logout`**

Logout pengguna dan invalidate token.

#### Contoh Request
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "uid": "firebase_user_id_123",
    "loggedOutAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 👤 Profile Management

### 6. Get Profile
**`GET /api/auth/profile`**

Mendapatkan profil pengguna yang sedang login.

#### Contoh Request
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "firebase_user_id_123",
      "email": "nelayan@example.com",
      "displayName": "Ahmad Nelayan",
      "phoneNumber": "+6281234567890",
      "photoURL": "https://example.com/avatar.jpg",
      "emailVerified": true,
      "disabled": false,
      "metadata": {
        "creationTime": "2025-07-20T10:30:00Z",
        "lastSignInTime": "2025-07-24T10:30:00Z"
      },
      "customClaims": {
        "role": "user",
        "community_admin": ["community_123"],
        "community_moderator": ["community_456"]
      },
      "providerData": [
        {
          "uid": "nelayan@example.com",
          "email": "nelayan@example.com",
          "providerId": "password"
        }
      ]
    },
    "statistics": {
      "communities_joined": 3,
      "reports_created": 15,
      "sessions_completed": 8
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 7. Update Profile
**`PUT /api/auth/profile`**

Memperbarui profil pengguna.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `displayName` | string | ❌ | Nama tampilan baru |
| `phoneNumber` | string | ❌ | Nomor telepon baru |
| `photoURL` | string | ❌ | URL foto profil baru |

#### Contoh Request
```bash
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Ahmad Nelayan Berpengalaman",
  "phoneNumber": "+6281234567891",
  "photoURL": "https://example.com/new-avatar.jpg"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "uid": "firebase_user_id_123",
      "email": "nelayan@example.com",
      "displayName": "Ahmad Nelayan Berpengalaman",
      "phoneNumber": "+6281234567891",
      "photoURL": "https://example.com/new-avatar.jpg",
      "emailVerified": true,
      "disabled": false,
      "metadata": {
        "creationTime": "2025-07-20T10:30:00Z",
        "lastSignInTime": "2025-07-24T10:30:00Z"
      }
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 8. Change Password
**`PUT /api/auth/password`**

Mengubah password pengguna.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `currentPassword` | string | ✅ | Password saat ini |
| `newPassword` | string | ✅ | Password baru (minimal 6 karakter) |

#### Contoh Request
```bash
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "uid": "firebase_user_id_123",
    "passwordChangedAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔑 Password Reset

### 9. Forgot Password
**`POST /api/auth/forgot-password`**

Mengirim email reset password.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `email` | string | ✅ | Email pengguna |

#### Contoh Request
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "nelayan@example.com"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "email": "nelayan@example.com",
    "sentAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 10. Reset Password
**`POST /api/auth/reset-password`**

Reset password menggunakan kode dari email.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `oobCode` | string | ✅ | Kode reset dari email |
| `newPassword` | string | ✅ | Password baru |

#### Contoh Request
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "oobCode": "reset_code_from_email",
  "newPassword": "newpassword123"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "email": "nelayan@example.com",
    "resetAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## ✉️ Email Verification

### 11. Send Verification Email
**`POST /api/auth/send-verification`**

Mengirim ulang email verifikasi.

#### Contoh Request
```bash
POST /api/auth/send-verification
Authorization: Bearer <token>
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "data": {
    "email": "nelayan@example.com",
    "sentAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

### 12. Verify Email
**`POST /api/auth/verify-email`**

Verifikasi email menggunakan kode dari email.

#### Parameter Request Body
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `oobCode` | string | ✅ | Kode verifikasi dari email |

#### Contoh Request
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "oobCode": "verification_code_from_email"
}
```

#### Contoh Response
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "nelayan@example.com",
    "verifiedAt": "2025-07-24T10:30:00Z"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Token Validation

### 13. Validate Token
**`GET /api/auth/validate`**

Memvalidasi token yang sedang digunakan.

#### Contoh Request
```bash
GET /api/auth/validate
Authorization: Bearer <token>
```

#### Contoh Response
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "uid": "firebase_user_id_123",
      "email": "nelayan@example.com",
      "emailVerified": true
    },
    "token": {
      "iss": "https://securetoken.google.com/project-id",
      "aud": "project-id",
      "auth_time": 1721814600,
      "user_id": "firebase_user_id_123",
      "sub": "firebase_user_id_123",
      "iat": 1721814600,
      "exp": 1721818200,
      "email": "nelayan@example.com",
      "email_verified": true,
      "firebase": {
        "identities": {
          "email": ["nelayan@example.com"]
        },
        "sign_in_provider": "password"
      }
    }
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🚨 Response Error

### Error Validation (400)
```json
{
  "success": false,
  "error": "Data tidak valid",
  "details": {
    "email": "Format email tidak valid",
    "password": "Password minimal 6 karakter"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error Authentication (401)
```json
{
  "success": false,
  "error": "Email atau password salah",
  "code": "auth/wrong-password",
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error User Not Found (404)
```json
{
  "success": false,
  "error": "Pengguna tidak ditemukan",
  "code": "auth/user-not-found",
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Error Email Already Exists (409)
```json
{
  "success": false,
  "error": "Email sudah terdaftar",
  "code": "auth/email-already-exists",
  "timestamp": "2025-07-24T10:30:00Z"
}
```

---

## 🔧 Best Practices

### 1. Token Management
```javascript
// Simpan token dengan aman
localStorage.setItem('authToken', response.data.token);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Auto-refresh token sebelum expired
setInterval(async () => {
  const token = localStorage.getItem('authToken');
  if (isTokenExpiringSoon(token)) {
    await refreshAuthToken();
  }
}, 5 * 60 * 1000); // Check setiap 5 menit
```

### 2. Error Handling
```javascript
async function handleAuthError(error) {
  switch (error.code) {
    case 'auth/wrong-password':
      showError('Password salah');
      break;
    case 'auth/user-not-found':
      showError('Email tidak terdaftar');
      break;
    case 'auth/email-already-exists':
      showError('Email sudah terdaftar');
      break;
    case 'auth/weak-password':
      showError('Password terlalu lemah');
      break;
    default:
      showError('Terjadi kesalahan, silakan coba lagi');
  }
}
```

### 3. Google OAuth Integration
```javascript
// Frontend Google Sign-In
import { GoogleAuth } from '@google-cloud/auth';

async function signInWithGoogle() {
  try {
    const auth = new GoogleAuth();
    const idToken = await auth.getIdToken();
    
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      // Redirect to dashboard
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
  }
}
```

---

## 🔐 Security Features

### 1. Token Security
- **JWT Tokens** dengan expiry time 1 jam
- **Refresh Tokens** untuk perpanjangan otomatis
- **Secure HTTP-only cookies** untuk sensitive data
- **CORS protection** untuk cross-origin requests

### 2. Password Security
- **Minimum 6 characters** requirement
- **Firebase password hashing** dengan bcrypt
- **Password reset** dengan secure email codes
- **Rate limiting** untuk prevent brute force

### 3. Email Verification
- **Mandatory email verification** untuk new users
- **Secure verification codes** dengan expiry
- **Resend verification** dengan rate limiting

---

_Terakhir diperbarui: Juli 2025_
