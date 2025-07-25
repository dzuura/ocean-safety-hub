const express = require("express");
const router = express.Router();
const safetyController = require("../controllers/safetyController");
const { optionalAuth } = require("../middleware/auth");


router.get("/analyze", optionalAuth, safetyController.analyzeSafety);
router.get("/zones", optionalAuth, safetyController.getSafetyZones);
router.get("/route", optionalAuth, safetyController.getRouteRecommendations);

module.exports = router;
