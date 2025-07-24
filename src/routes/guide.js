/**
 * Guide Routes
 * Routes untuk panduan keselamatan berlayar
 */

const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateGuideData, validateTripInfo, validateChecklistUpdate } = require('../middleware/validation');

/**
 * Public Routes (No authentication required)
 */

// Get all guides (public access untuk melihat daftar panduan)
router.get('/', optionalAuth, guideController.getAllGuides);

// Get guide by ID (public access)
router.get('/:guideId', optionalAuth, guideController.getGuideById);

/**
 * Admin Routes (Authentication required + Admin role)
 * Untuk CRUD management guides
 */

// Create new guide (Admin only)
router.post('/', authenticateToken, validateGuideData, guideController.createGuide);

// Update guide (Admin only)
router.put('/:guideId', authenticateToken, validateGuideData, guideController.updateGuide);

// Delete guide (Admin only)
router.delete('/:guideId', authenticateToken, guideController.deleteGuide);

// Get statistics (Admin only)
router.get('/admin/statistics', authenticateToken, guideController.getStatistics);

/**
 * User Session Routes (Authentication required)
 * Untuk user journey: form → checklist → summary
 */

// Start new session dengan trip information
router.post('/session/start', authenticateToken, validateTripInfo, guideController.startSession);

// Get active session untuk user
router.get('/session/active', authenticateToken, guideController.getActiveSession);

// Get user sessions history
router.get('/session/history', authenticateToken, guideController.getUserSessions);

// Get session by ID (untuk debugging/admin)
router.get('/session/:sessionId', authenticateToken, guideController.getSessionById);

// Generate checklist berdasarkan trip info
router.post('/session/:sessionId/checklist', authenticateToken, guideController.generateChecklist);

// Update checklist item progress
router.put('/session/:sessionId/checklist/:guideId', 
  authenticateToken, 
  validateChecklistUpdate, 
  guideController.updateChecklistProgress
);

// Get summary dengan video URLs (setelah checklist selesai)
router.get('/session/:sessionId/summary', authenticateToken, guideController.getSummary);

// Complete session
router.post('/session/:sessionId/complete', authenticateToken, guideController.completeSession);

module.exports = router;
