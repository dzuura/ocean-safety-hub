const { verifyIdToken } = require('../config/firebase');
const ApiResponse = require('../utils/response');
const Logger = require('../utils/logger');

/**
 * Middleware untuk verifikasi Firebase ID Token
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return ApiResponse.unauthorized(res, 'Token autentikasi diperlukan');
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return ApiResponse.unauthorized(res, 'Format token tidak valid');
    }

    // Verify token dengan Firebase Admin
    const decodedToken = await verifyIdToken(token);
    
    // Tambahkan user info ke request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebase: decodedToken,
    };

    Logger.debug('User authenticated:', { uid: req.user.uid, email: req.user.email });
    next();
  } catch (error) {
    Logger.error('Authentication failed:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return ApiResponse.unauthorized(res, 'Token telah kedaluwarsa');
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return ApiResponse.unauthorized(res, 'Token telah dicabut');
    }
    
    return ApiResponse.unauthorized(res, 'Token tidak valid');
  }
}

/**
 * Middleware untuk verifikasi token opsional
 * Jika token ada, verifikasi. Jika tidak ada, lanjutkan tanpa user info
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    // Verify token dengan Firebase Admin
    const decodedToken = await verifyIdToken(token);
    
    // Tambahkan user info ke request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebase: decodedToken,
    };

    Logger.debug('Optional auth - User authenticated:', { uid: req.user.uid, email: req.user.email });
    next();
  } catch (error) {
    Logger.warn('Optional auth failed, continuing without user:', error.message);
    // Lanjutkan tanpa user info jika token tidak valid
    next();
  }
}

/**
 * Middleware untuk memeriksa apakah user adalah admin
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Autentikasi diperlukan');
    }

    // Cek custom claims untuk admin role
    const customClaims = req.user.firebase.admin || false;
    
    if (!customClaims) {
      return ApiResponse.forbidden(res, 'Akses admin diperlukan');
    }

    next();
  } catch (error) {
    Logger.error('Admin check failed:', error);
    return ApiResponse.forbidden(res, 'Gagal memverifikasi hak akses admin');
  }
}

/**
 * Middleware untuk memeriksa apakah email user sudah diverifikasi
 */
function requireEmailVerified(req, res, next) {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Autentikasi diperlukan');
    }

    if (!req.user.emailVerified) {
      return ApiResponse.forbidden(res, 'Email harus diverifikasi terlebih dahulu');
    }

    next();
  } catch (error) {
    Logger.error('Email verification check failed:', error);
    return ApiResponse.error(res, 'Gagal memverifikasi status email');
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireEmailVerified,
};
