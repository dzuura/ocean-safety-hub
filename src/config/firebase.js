const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const config = require('./index');
const Logger = require('../utils/logger');

let adminApp = null;
let clientApp = null;
let db = null;
let auth = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  try {
    if (!adminApp && config.firebase.admin.projectId) {
      const serviceAccount = {
        type: 'service_account',
        project_id: config.firebase.admin.projectId,
        private_key_id: config.firebase.admin.privateKeyId,
        private_key: config.firebase.admin.privateKey,
        client_email: config.firebase.admin.clientEmail,
        client_id: config.firebase.admin.clientId,
        auth_uri: config.firebase.admin.authUri,
        token_uri: config.firebase.admin.tokenUri,
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: config.firebase.admin.clientX509CertUrl,
      };

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.firebase.web.databaseURL,
      });

      Logger.info('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    Logger.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

/**
 * Initialize Firebase Client SDK
 */
function initializeFirebaseClient() {
  try {
    if (!clientApp && config.firebase.web.apiKey) {
      const firebaseConfig = {
        apiKey: config.firebase.web.apiKey,
        authDomain: config.firebase.web.authDomain,
        databaseURL: config.firebase.web.databaseURL,
        projectId: config.firebase.web.projectId,
        storageBucket: config.firebase.web.storageBucket,
        messagingSenderId: config.firebase.web.messagingSenderId,
        appId: config.firebase.web.appId,
      };

      clientApp = initializeApp(firebaseConfig);
      auth = getAuth(clientApp);
      db = getFirestore(clientApp);

      Logger.info('Firebase Client SDK initialized successfully');
    }
  } catch (error) {
    Logger.error('Failed to initialize Firebase Client SDK:', error);
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
 * Get Firebase Client Auth instance
 */
function getClientAuth() {
  if (!auth) {
    initializeFirebaseClient();
  }
  return auth;
}

/**
 * Get Firestore Client instance
 */
function getFirestoreClient() {
  if (!db) {
    initializeFirebaseClient();
  }
  return db;
}

/**
 * Verify Firebase ID Token
 */
async function verifyIdToken(idToken) {
  try {
    const authAdmin = getAuthAdmin();
    if (!authAdmin) {
      throw new Error('Firebase Admin not initialized');
    }
    
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    Logger.error('Failed to verify ID token:', error);
    throw error;
  }
}

/**
 * Initialize Firebase services
 */
function initializeFirebase() {
  initializeFirebaseAdmin();
  initializeFirebaseClient();
}

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getFirestoreAdmin,
  getAuthAdmin,
  getClientAuth,
  getFirestoreClient,
  verifyIdToken,
};
