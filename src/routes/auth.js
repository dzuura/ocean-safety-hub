const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getAuthAdmin, getFirestoreAdmin } = require("../config/firebase");
const ApiResponse = require("../utils/response");
const Logger = require("../utils/logger");

const router = express.Router();

// Registrasi user baru dengan email/password
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return ApiResponse.badRequest(res, "Email dan password diperlukan");
    }

    if (password.length < 6) {
      return ApiResponse.badRequest(res, "Password minimal 6 karakter");
    }

    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Buat user di Firebase Auth
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: name || "",
      emailVerified: false,
    });

    // Buat record di Firestore
    const db = getFirestoreAdmin();
    if (db) {
      await db
        .collection("users")
        .doc(userRecord.uid)
        .set({
          uid: userRecord.uid,
          email: userRecord.email,
          name: name || "",
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: "user",
          authProvider: "email",
        });
    }

    // Generate custom token untuk auto-login
    const customToken = await authAdmin.createCustomToken(userRecord.uid);

    const responseData = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: name || "",
      customToken: customToken,
      emailVerified: false,
    };

    Logger.info("User registered successfully:", {
      uid: userRecord.uid,
      email: userRecord.email,
    });
    return ApiResponse.success(res, responseData, "Registrasi berhasil");
  } catch (error) {
    Logger.error("Registration failed:", error);

    if (error.code === "auth/email-already-exists") {
      return ApiResponse.badRequest(res, "Email sudah terdaftar");
    }

    if (error.code === "auth/invalid-email") {
      return ApiResponse.badRequest(res, "Format email tidak valid");
    }

    if (error.code === "auth/weak-password") {
      return ApiResponse.badRequest(res, "Password terlalu lemah");
    }

    return ApiResponse.error(res, "Gagal melakukan registrasi");
  }
});

/**
 * POST /api/auth/login
 * Login dengan email dan password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.badRequest(res, "Email dan password diperlukan");
    }

    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Verifikasi user exists
    const userRecord = await authAdmin.getUserByEmail(email);

    // Generate custom token untuk login
    // Note: Firebase Admin SDK tidak bisa verify password secara langsung
    // Password verification harus dilakukan di client-side dengan Firebase Client SDK
    // Endpoint ini memberikan custom token untuk testing/development
    const customToken = await authAdmin.createCustomToken(userRecord.uid);

    // Get user data dari Firestore
    const db = getFirestoreAdmin();
    let userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      name: userRecord.displayName || "",
    };

    if (db) {
      const userDoc = await db.collection("users").doc(userRecord.uid).get();
      if (userDoc.exists) {
        userData = { ...userData, ...userDoc.data() };
      }
    }

    const responseData = {
      ...userData,
      customToken: customToken,
    };

    Logger.info("User logged in:", {
      uid: userRecord.uid,
      email: userRecord.email,
    });
    return ApiResponse.success(res, responseData, "Login berhasil");
  } catch (error) {
    Logger.error("Login failed:", error);

    if (error.code === "auth/user-not-found") {
      return ApiResponse.unauthorized(res, "Email atau password salah");
    }

    return ApiResponse.unauthorized(res, "Email atau password salah");
  }
});

/**
 * POST /api/auth/verify
 * Verifikasi Firebase ID Token
 */
router.post("/verify", authenticateToken, (req, res) => {
  try {
    // Jika middleware authenticateToken berhasil, berarti token valid
    const userInfo = {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      name: req.user.name,
      picture: req.user.picture,
    };

    return ApiResponse.success(res, userInfo, "Token berhasil diverifikasi");
  } catch (error) {
    Logger.error("Token verification failed:", error);
    return ApiResponse.unauthorized(res, "Token tidak valid");
  }
});

/**
 * GET /api/auth/profile
 * Mendapatkan profil user yang sedang login
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, "Database tidak tersedia");
    }

    // Ambil data user dari Firestore
    const userDoc = await db.collection("users").doc(req.user.uid).get();

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

    return ApiResponse.success(res, userData, "Profil user berhasil diambil");
  } catch (error) {
    Logger.error("Failed to get user profile:", error);
    return ApiResponse.error(res, "Gagal mengambil profil user");
  }
});

/**
 * PUT /api/auth/profile
 * Update profil user
 */
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, "Database tidak tersedia");
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
    await db
      .collection("users")
      .doc(req.user.uid)
      .set(updateData, { merge: true });

    return ApiResponse.success(res, updateData, "Profil berhasil diperbarui");
  } catch (error) {
    Logger.error("Failed to update user profile:", error);
    return ApiResponse.error(res, "Gagal memperbarui profil");
  }
});

/**
 * POST /api/auth/google-signin
 * Handle Google Sign-In dari frontend
 */
router.post("/google-signin", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return ApiResponse.badRequest(res, "Google ID Token diperlukan");
    }

    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Verifikasi Google ID Token
    const decodedToken = await authAdmin.verifyIdToken(idToken);

    // Cek apakah user sudah ada di Firestore
    const db = getFirestoreAdmin();
    let userData = null;

    if (db) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        // Buat record baru untuk user Google Sign-In
        userData = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || "",
          picture: decodedToken.picture || "",
          emailVerified: decodedToken.email_verified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: "user",
          authProvider: "google",
        };

        await db.collection("users").doc(decodedToken.uid).set(userData);
        Logger.info("New Google user created:", {
          uid: decodedToken.uid,
          email: decodedToken.email,
        });
      } else {
        userData = userDoc.data();
        // Update last login time
        await db.collection("users").doc(decodedToken.uid).update({
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const responseData = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || "",
      picture: decodedToken.picture || "",
      emailVerified: decodedToken.email_verified || false,
      authProvider: "google",
      isNewUser: !userData || userData.createdAt === userData.updatedAt,
    };

    return ApiResponse.success(res, responseData, "Google Sign-In berhasil");
  } catch (error) {
    Logger.error("Google Sign-In failed:", error);

    if (error.code === "auth/id-token-expired") {
      return ApiResponse.unauthorized(res, "Google token telah kedaluwarsa");
    }

    if (error.code === "auth/id-token-revoked") {
      return ApiResponse.unauthorized(res, "Google token telah dicabut");
    }

    return ApiResponse.error(res, "Gagal melakukan Google Sign-In");
  }
});

/**
 * POST /api/auth/send-verification-email
 * Kirim email verifikasi
 */
router.post("/send-verification-email", authenticateToken, async (req, res) => {
  try {
    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Generate email verification link
    const actionCodeSettings = {
      url: process.env.CORS_ORIGIN || "http://localhost:3000",
      handleCodeInApp: true,
    };

    const link = await authAdmin.generateEmailVerificationLink(
      req.user.email,
      actionCodeSettings
    );

    // Di production, Anda akan mengirim email menggunakan service seperti SendGrid
    // Untuk development, kita return link-nya
    return ApiResponse.success(
      res,
      { verificationLink: link },
      "Link verifikasi email berhasil dibuat"
    );
  } catch (error) {
    Logger.error("Failed to send verification email:", error);
    return ApiResponse.error(res, "Gagal mengirim email verifikasi");
  }
});

/**
 * POST /api/auth/create-user-record
 * Membuat record user di Firestore setelah registrasi
 */
router.post("/create-user-record", authenticateToken, async (req, res) => {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return ApiResponse.error(res, "Database tidak tersedia");
    }

    const userRecord = {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || "",
      picture: req.user.picture || "",
      emailVerified: req.user.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: "user", // default role
    };

    // Cek apakah user sudah ada
    const existingUser = await db.collection("users").doc(req.user.uid).get();

    if (existingUser.exists) {
      return ApiResponse.success(
        res,
        existingUser.data(),
        "User record sudah ada"
      );
    }

    // Buat user record baru
    await db.collection("users").doc(req.user.uid).set(userRecord);

    return ApiResponse.success(res, userRecord, "User record berhasil dibuat");
  } catch (error) {
    Logger.error("Failed to create user record:", error);
    return ApiResponse.error(res, "Gagal membuat user record");
  }
});

/**
 * POST /api/auth/logout
 * Logout user (revoke refresh tokens)
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Revoke all refresh tokens untuk user
    await authAdmin.revokeRefreshTokens(req.user.uid);

    Logger.info("User logged out:", {
      uid: req.user.uid,
      email: req.user.email,
    });
    return ApiResponse.success(res, null, "Logout berhasil");
  } catch (error) {
    Logger.error("Logout failed:", error);
    return ApiResponse.error(res, "Gagal melakukan logout");
  }
});

/**
 * POST /api/auth/forgot-password
 * Kirim email reset password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.badRequest(res, "Email diperlukan");
    }

    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      return ApiResponse.error(res, "Service autentikasi tidak tersedia");
    }

    // Generate password reset link
    const actionCodeSettings = {
      url: process.env.CORS_ORIGIN || "http://localhost:3000",
      handleCodeInApp: false,
    };

    const link = await authAdmin.generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    // Di production, Anda akan mengirim email menggunakan service seperti SendGrid
    // Untuk development, kita return link-nya
    return ApiResponse.success(
      res,
      { resetLink: link },
      "Link reset password berhasil dibuat"
    );
  } catch (error) {
    Logger.error("Failed to send password reset email:", error);

    if (error.code === "auth/user-not-found") {
      // Untuk keamanan, jangan beri tahu bahwa email tidak ditemukan
      return ApiResponse.success(
        res,
        null,
        "Jika email terdaftar, link reset password akan dikirim"
      );
    }

    return ApiResponse.error(res, "Gagal mengirim email reset password");
  }
});

/**
 * DELETE /api/auth/account
 * Hapus akun user
 */
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    const authAdmin = getAuthAdmin();
    const db = getFirestoreAdmin();

    if (!authAdmin || !db) {
      return ApiResponse.error(res, "Service tidak tersedia");
    }

    // Hapus user dari Firebase Auth
    await authAdmin.deleteUser(req.user.uid);

    // Hapus user record dari Firestore
    await db.collection("users").doc(req.user.uid).delete();

    return ApiResponse.success(res, null, "Akun berhasil dihapus");
  } catch (error) {
    Logger.error("Failed to delete user account:", error);
    return ApiResponse.error(res, "Gagal menghapus akun");
  }
});

module.exports = router;
