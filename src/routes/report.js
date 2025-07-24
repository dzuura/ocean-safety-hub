const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateReportData, validateVoteData, validateCommentData } = require('../middleware/validation');

/**
 * @route   POST /api/report
 * @desc    Create a new report
 * @access  Private
 */
router.post('/', 
  authenticateToken, 
  validateReportData, 
  reportController.createReport
);

/**
 * @route   GET /api/report/search
 * @desc    Search reports with filters
 * @access  Public
 */
router.get('/search', 
  optionalAuth, 
  reportController.searchReports
);

/**
 * @route   GET /api/report/location
 * @desc    Get reports by location
 * @access  Public
 */
router.get('/location', 
  optionalAuth, 
  reportController.getReportsByLocation
);

/**
 * @route   GET /api/report/community/:communityId/stats
 * @desc    Get community report statistics
 * @access  Public (with restrictions for private communities)
 */
router.get('/community/:communityId/stats', 
  optionalAuth, 
  reportController.getCommunityReportStats
);

/**
 * @route   GET /api/report/:reportId
 * @desc    Get report by ID
 * @access  Public (with restrictions for private communities)
 */
router.get('/:reportId', 
  optionalAuth, 
  reportController.getReport
);

/**
 * @route   PUT /api/report/:reportId
 * @desc    Update report
 * @access  Private (Author/Moderator/Admin only)
 */
router.put('/:reportId', 
  authenticateToken, 
  validateReportData, 
  reportController.updateReport
);

/**
 * @route   DELETE /api/report/:reportId
 * @desc    Delete report
 * @access  Private (Author/Moderator/Admin only)
 */
router.delete('/:reportId', 
  authenticateToken, 
  reportController.deleteReport
);

/**
 * @route   POST /api/report/:reportId/vote
 * @desc    Vote on report
 * @access  Private
 */
router.post('/:reportId/vote', 
  authenticateToken, 
  validateVoteData, 
  reportController.voteOnReport
);

/**
 * @route   POST /api/report/:reportId/verify
 * @desc    Verify report
 * @access  Private (Moderator/Admin only)
 */
router.post('/:reportId/verify', 
  authenticateToken, 
  reportController.verifyReport
);

/**
 * @route   POST /api/report/:reportId/comments
 * @desc    Add comment to report
 * @access  Private
 */
router.post('/:reportId/comments', 
  authenticateToken, 
  validateCommentData, 
  reportController.addComment
);

module.exports = router;
