require("dotenv").config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // API Configuration
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_API_URL,
    marineUrl: process.env.OPEN_METEO_MARINE_URL,
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
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
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 menit
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Cache Configuration
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS) || 300, // 5 menit
  },

  // Notification
  notifications: {
    checkIntervalMinutes:
      parseInt(process.env.NOTIFICATION_CHECK_INTERVAL_MINUTES) || 30,
  },

  // Safety Thresholds
  safety: {
    waveHeight: {
      safe: 1.5, // meter
      moderate: 3.0, // meter
      dangerous: 5.0, // meter
    },
    windSpeed: {
      safe: 15, // km/jam
      moderate: 30, // km/jam
      dangerous: 50, // km/jam
    },
  },
};

module.exports = config;
