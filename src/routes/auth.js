const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { getAuthAdmin, getFirestoreAdmin } = require('../config/firebase');
const ApiResponse = require('../utils/response');
const Logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/auth/config
 * Mendapatkan konfigurasi Firebase untuk frontend
 */
router.get('/config', (req, res) => {
  try {
    const config = require('../config');
    
    const firebaseConfig = {
      apiKey: config.firebase.web.apiKey,
      authDomain: config.firebase.web.authDomain,
      databaseURL: config.firebase.web.databaseURL,
      projectId: config.firebase.web.projectId,
      storageBucket: config.firebase.web.storageBucket,
    };

    return ApiResponse.success(res, firebaseConfig, 'Konfigurasi Firebase berhasil diambil');
  } catch (error) {
    Logger.error('Failed to get Firebase config:', error);
    return ApiResponse.error(res, 'Gagal mengambil konfigurasi Firebase');
  }
});

/**
 * POST /api/auth/verify
 * Verifikasi Firebase ID Token
 */
router.post('/verify', authenticateToken, (req, res) => {
  try {
    // Jika middleware authenticateToken berhasil, berarti token valid
    const userInfo = {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      name: req.user.name,
      picture: req.user.picture,
    };

    return ApiResponse.success(res, userInfo, 'Token berhasil diverifikasi');
  } catch (error) {
    Logger.error('Token verification failed:', error);
    return ApiResponse.unauthorized(res, 'Token tidak valid');
  }
});

/**
 * GET /api/auth/profile
 * Mendapatkan profil user yang sedang login
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, 'Database tidak tersedia');
    }

    // Ambil data user dari Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    let userData = {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      name: req.user.name,
      picture: req.user.picture,
    };

    // Jika ada data tambahan di Firestore, gabungkan
    if (userDoc.exists) {
      userData = { ...userData, ...userDoc.data() };
    }

    return ApiResponse.success(res, userData, 'Profil user berhasil diambil');
  } catch (error) {
    Logger.error('Failed to get user profile:', error);
    return ApiResponse.error(res, 'Gagal mengambil profil user');
  }
});

/**
 * PUT /api/auth/profile
 * Update profil user
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, 'Database tidak tersedia');
    }

    const { name, phone, location, bio } = req.body;
    
    // Data yang bisa diupdate
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;

    // Update data di Firestore
    await db.collection('users').doc(req.user.uid).set(updateData, { merge: true });

    return ApiResponse.success(res, updateData, 'Profil berhasil diperbarui');
  } catch (error) {
    Logger.error('Failed to update user profile:', error);
    return ApiResponse.error(res, 'Gagal memperbarui profil');
  }
});

/**
 * POST /api/auth/create-user-record
 * Membuat record user di Firestore setelah registrasi
 */
router.post('/create-user-record', authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, 'Database tidak tersedia');
    }

    const userRecord = {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || '',
      picture: req.user.picture || '',
      emailVerified: req.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'user', // default role
    };

    // Cek apakah user sudah ada
    const existingUser = await db.collection('users').doc(req.user.uid).get();
    
    if (existingUser.exists) {
      return ApiResponse.success(res, existingUser.data(), 'User record sudah ada');
    }

    // Buat user record baru
    await db.collection('users').doc(req.user.uid).set(userRecord);

    return ApiResponse.success(res, userRecord, 'User record berhasil dibuat');
  } catch (error) {
    Logger.error('Failed to create user record:', error);
    return ApiResponse.error(res, 'Gagal membuat user record');
  }
});

/**
 * DELETE /api/auth/account
 * Hapus akun user
 */
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const authAdmin = getAuthAdmin();
    const db = getFirestoreAdmin();
    
    if (!authAdmin || !db) {
      return ApiResponse.error(res, 'Service tidak tersedia');
    }

    // Hapus user dari Firebase Auth
    await authAdmin.deleteUser(req.user.uid);
    
    // Hapus user record dari Firestore
    await db.collection('users').doc(req.user.uid).delete();

    return ApiResponse.success(res, null, 'Akun berhasil dihapus');
  } catch (error) {
    Logger.error('Failed to delete user account:', error);
    return ApiResponse.error(res, 'Gagal menghapus akun');
  }
});

module.exports = router;
