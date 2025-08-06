const express = require("express");
const router = express.Router();
const guideController = require("../controllers/guideController");
const {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} = require("../middleware/auth");
const {
  validateGuideData,
  validateGuideUpdateData,
  validateTripInfo,
  validateChecklistUpdate,
} = require("../middleware/validation");

router.get("/", optionalAuth, guideController.getAllGuides);
router.get(
  "/admin/statistics",
  authenticateToken,
  requireAdmin,
  guideController.getStatistics
);
router.get("/:guideId", optionalAuth, guideController.getGuideById);
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateGuideData,
  guideController.createGuide
);
router.put(
  "/:guideId",
  authenticateToken,
  requireAdmin,
  validateGuideUpdateData,
  guideController.updateGuide
);
router.delete(
  "/:guideId",
  authenticateToken,
  requireAdmin,
  guideController.deleteGuide
);
router.post(
  "/session/start",
  authenticateToken,
  validateTripInfo,
  guideController.startSession
);
router.get(
  "/session/active",
  authenticateToken,
  guideController.getActiveSession
);
router.get(
  "/session/history",
  authenticateToken,
  guideController.getUserSessions
);
router.get(
  "/session/:sessionId",
  authenticateToken,
  guideController.getSessionById
);
router.post(
  "/session/:sessionId/checklist",
  authenticateToken,
  guideController.generateChecklist
);
router.put(
  "/session/:sessionId/checklist/:guideId",
  authenticateToken,
  validateChecklistUpdate,
  guideController.updateChecklistProgress
);
router.get(
  "/session/:sessionId/summary",
  authenticateToken,
  guideController.getSummary
);
router.post(
  "/session/:sessionId/complete",
  authenticateToken,
  guideController.completeSession
);

module.exports = router;
