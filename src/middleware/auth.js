const { verifyIdToken } = require("../config/firebase");
const ApiResponse = require("../utils/response");
const Logger = require("../utils/logger");

// Verifikasi Firebase ID Token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ApiResponse.unauthorized(res, "Token autentikasi diperlukan");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return ApiResponse.unauthorized(res, "Format token tidak valid");
    }

    // Verifikasi token dengan Firebase Admin
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

    Logger.debug("User authenticated:", {
      uid: req.user.uid,
      email: req.user.email,
    });
    next();
  } catch (error) {
    Logger.error("Authentication failed:", error);

    if (error.code === "auth/id-token-expired") {
      return ApiResponse.unauthorized(res, "Token telah kedaluwarsa");
    }

    if (error.code === "auth/id-token-revoked") {
      return ApiResponse.unauthorized(res, "Token telah dicabut");
    }

    return ApiResponse.unauthorized(res, "Token tidak valid");
  }
}

// Verifikasi token opsional - lanjutkan tanpa user jika tidak ada token
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    // Verifikasi token dengan Firebase Admin
    const decodedToken = await verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebase: decodedToken,
    };

    Logger.debug("Optional auth - User authenticated:", {
      uid: req.user.uid,
      email: req.user.email,
    });
    next();
  } catch (error) {
    Logger.warn(
      "Optional auth failed, continuing without user:",
      error.message
    );
    next();
  }
}

// Periksa apakah user adalah admin
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Autentikasi diperlukan");
    }

    const customClaims = req.user.firebase.admin || false;

    if (!customClaims) {
      return ApiResponse.forbidden(res, "Akses admin diperlukan");
    }

    next();
  } catch (error) {
    Logger.error("Admin check failed:", error);
    return ApiResponse.forbidden(res, "Gagal memverifikasi hak akses admin");
  }
}

// Periksa apakah email user sudah diverifikasi
function requireEmailVerified(req, res, next) {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Autentikasi diperlukan");
    }

    if (!req.user.emailVerified) {
      return ApiResponse.forbidden(
        res,
        "Email harus diverifikasi terlebih dahulu"
      );
    }

    next();
  } catch (error) {
    Logger.error("Email verification check failed:", error);
    return ApiResponse.error(res, "Gagal memverifikasi status email");
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireEmailVerified,
};
