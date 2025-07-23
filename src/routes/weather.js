const express = require("express");
const weatherController = require("../controllers/weatherController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/marine", optionalAuth, weatherController.getMarineWeather);
router.get("/current", optionalAuth, weatherController.getCurrentWeather);
router.get("/complete", optionalAuth, weatherController.getCompleteWeather);
router.get("/cache/stats", weatherController.getCacheStats);
router.delete("/cache", weatherController.clearCache);

module.exports = router;
