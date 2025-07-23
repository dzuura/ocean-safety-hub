const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { initializeFirebase } = require("./config/firebase");

const app = express();

initializeFirebase();

app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// Pembatasan request per IP
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.",
  },
});
app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Endpoint health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Pelaut Hebat API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

const weatherRoutes = require("./routes/weather");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

app.use("/api/weather", weatherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Endpoint informasi API
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Pelaut Hebat API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      weather: {
        marine: "/api/weather/marine",
        current: "/api/weather/current",
        complete: "/api/weather/complete",
      },
      auth: {
        register: "/api/auth/register (email, password, name)",
        login: "/api/auth/login (email, password)",
        "google-signin": "/api/auth/google-signin (idToken)",
        verify: "/api/auth/verify (Authorization header)",
        profile: "/api/auth/profile (GET/PUT)",
        logout: "/api/auth/logout",
        "forgot-password": "/api/auth/forgot-password (email)",
        "send-verification-email": "/api/auth/send-verification-email",
        account: "/api/auth/account (DELETE)",
      },
      ai: {
        status: "/api/ai/status",
        "explain-conditions": "/api/ai/explain-conditions (POST)",
        "recommend-times": "/api/ai/recommend-times (POST)",
        "detect-anomalies": "/api/ai/detect-anomalies (POST)",
        "early-warnings": "/api/ai/early-warnings (GET)",
      },
      safety: "/api/safety (coming soon)",
      community: "/api/community (coming soon)",
    },
  });
});

// Handler untuk endpoint tidak ditemukan
app.use((_req, res) => {
  res.status(404).json({
    error: "Endpoint tidak ditemukan",
    message: "Silakan periksa dokumentasi API untuk endpoint yang tersedia.",
  });
});

// Handler error global
app.use((err, _req, res, _next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error:
      config.nodeEnv === "production"
        ? "Terjadi kesalahan server internal"
        : err.message,
    ...(config.nodeEnv !== "production" && { stack: err.stack }),
  });
});

// Menjalankan server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🌊 Pelaut Hebat API berjalan di port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

module.exports = app;
