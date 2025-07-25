const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateReportData, validateVoteData, validateCommentData } = require('../middleware/validation');

router.post('/', authenticateToken, validateReportData, reportController.createReport);
router.get('/search', optionalAuth, reportController.searchReports);
router.get('/location', optionalAuth, reportController.getReportsByLocation);
router.get('/community/:communityId/stats', optionalAuth, reportController.getCommunityReportStats);
router.get('/:reportId', optionalAuth, reportController.getReport);
router.put('/:reportId', authenticateToken, validateReportData, reportController.updateReport);
router.delete('/:reportId', authenticateToken, reportController.deleteReport);
router.post('/:reportId/vote', authenticateToken, validateVoteData, reportController.voteOnReport);
router.post('/:reportId/verify', authenticateToken, reportController.verifyReport);
router.post('/:reportId/comments', authenticateToken, validateCommentData, reportController.addComment);

module.exports = router;
