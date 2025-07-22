const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { initializeFirebase } = require("./config/firebase");

const app = express();

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.",
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Pelaut Hebat API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Import routes
const weatherRoutes = require("./routes/weather");
const authRoutes = require("./routes/auth");

// API routes
app.use("/api/weather", weatherRoutes);
app.use("/api/auth", authRoutes);

// API info endpoint
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
        locations: "/api/weather/locations/popular",
      },
      auth: {
        verify: "/api/auth/verify",
        profile: "/api/auth/profile",
      },
      safety: "/api/safety (coming soon)",
      community: "/api/community (coming soon)",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint tidak ditemukan",
    message: "Silakan periksa dokumentasi API untuk endpoint yang tersedia.",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error:
      config.nodeEnv === "production"
        ? "Terjadi kesalahan server internal"
        : err.message,
    ...(config.nodeEnv !== "production" && { stack: err.stack }),
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🌊 Pelaut Hebat API berjalan di port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

module.exports = app;
