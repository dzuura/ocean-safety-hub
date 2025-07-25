const admin = require("firebase-admin");
const config = require("./index");
const Logger = require("../utils/logger");

let adminApp = null;

// Inisialisasi Firebase Admin SDK
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

// Mendapatkan instance Firebase Admin
function getFirebaseAdmin() {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return adminApp;
}

// Mendapatkan Firestore Admin
function getFirestoreAdmin() {
  const app = getFirebaseAdmin();
  return app ? admin.firestore() : null;
}

// Mendapatkan Auth Admin
function getAuthAdmin() {
  const app = getFirebaseAdmin();
  return app ? admin.auth() : null;
}

// Verifikasi ID Token
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

// Inisialisasi Firebase
function initializeFirebase() {
  initializeFirebaseAdmin();
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
