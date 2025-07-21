require("dotenv").config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // API Configuration
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_API_URL || "https://api.open-meteo.com/v1",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  // Firebase Configuration
  firebase: {
    // Admin SDK Configuration
    admin: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    },
    // Web App Configuration (untuk frontend)
    web: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Cache Configuration
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 300, // 5 minutes
  },

  // Notification Settings
  notifications: {
    checkIntervalMinutes:
      parseInt(process.env.NOTIFICATION_CHECK_INTERVAL_MINUTES) || 30,
  },

  // Safety Thresholds
  safety: {
    waveHeight: {
      safe: 1.5, // meters
      moderate: 3.0, // meters
      dangerous: 5.0, // meters
    },
    windSpeed: {
      safe: 15, // km/h
      moderate: 30, // km/h
      dangerous: 50, // km/h
    },
  },
};

module.exports = config;
