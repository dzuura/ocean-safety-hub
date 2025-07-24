const admin = require("firebase-admin");
const config = require("./index");
const Logger = require("../utils/logger");

let adminApp = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  try {
    if (!adminApp && config.firebase.admin.projectId) {
      const serviceAccount = {
        type: "service_account",
        project_id: config.firebase.admin.projectId,
        private_key_id: config.firebase.admin.privateKeyId,
        private_key: config.firebase.admin.privateKey,
        client_email: config.firebase.admin.clientEmail,
        client_id: config.firebase.admin.clientId,
        auth_uri: config.firebase.admin.authUri,
        token_uri: config.firebase.admin.tokenUri,
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: config.firebase.admin.clientX509CertUrl,
      };

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      Logger.info("Firebase Admin SDK initialized successfully");
    }
  } catch (error) {
    Logger.error("Failed to initialize Firebase Admin SDK:", error);
  }
}

/**
 * Get Firebase Admin instance
 */
function getFirebaseAdmin() {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return adminApp;
}

/**
 * Get Firestore Admin instance
 */
function getFirestoreAdmin() {
  const app = getFirebaseAdmin();
  return app ? admin.firestore() : null;
}

/**
 * Get Firebase Auth Admin instance
 */
function getAuthAdmin() {
  const app = getFirebaseAdmin();
  return app ? admin.auth() : null;
}

/**
 * Get Firebase Client Auth instance (TIDAK DIPERLUKAN untuk backend)
 */
function getClientAuth() {
  Logger.warn("getClientAuth() called - consider using Admin SDK instead");
  return null;
}

/**
 * Get Firestore Client instance (TIDAK DIPERLUKAN untuk backend)
 */
function getFirestoreClient() {
  Logger.warn("getFirestoreClient() called - consider using Admin SDK instead");
  return null;
}

/**
 * Verify Firebase ID Token
 */
async function verifyIdToken(idToken) {
  try {
    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      throw new Error("Firebase Admin not initialized");
    }

    const decodedToken = await authAdmin.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    Logger.error("Failed to verify ID token:", error);
    throw error;
  }
}

/**
 * Initialize Firebase services (Backend hanya butuh Admin SDK)
 */
function initializeFirebase() {
  initializeFirebaseAdmin();
  // initializeFirebaseClient(); // Tidak diperlukan untuk backend
}

// Lazy initialization untuk db
let _db = null;
function getDb() {
  if (!_db) {
    _db = getFirestoreAdmin();
  }
  return _db;
}

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getFirestoreAdmin,
  getAuthAdmin,
  getClientAuth,
  getFirestoreClient,
  verifyIdToken,
  get db() {
    return getDb();
  },
};
