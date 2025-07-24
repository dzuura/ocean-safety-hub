const express = require("express");
const safetyController = require("../controllers/safetyController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Menganalisis tingkat keamanan berlayar untuk lokasi tertentu
router.get("/analyze", optionalAuth, safetyController.analyzeSafety);

// Mendapatkan zona keamanan untuk area tertentu (grid analysis)
router.get("/zones", optionalAuth, safetyController.getSafetyZones);

// Mendapatkan rekomendasi rute aman antara dua titik
router.get("/route", optionalAuth, safetyController.getRouteRecommendations);

module.exports = router;
