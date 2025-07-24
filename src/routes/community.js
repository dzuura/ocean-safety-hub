const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateCommunityData, validateMembershipData } = require('../middleware/validation');

/**
 * @route   POST /api/community
 * @desc    Create a new community
 * @access  Private
 */
router.post('/', 
  authenticateToken, 
  validateCommunityData, 
  communityController.createCommunity
);

/**
 * @route   GET /api/community/search
 * @desc    Search communities with filters
 * @access  Public
 */
router.get('/search', 
  optionalAuth, 
  communityController.searchCommunities
);

/**
 * @route   GET /api/community/my
 * @desc    Get user's communities
 * @access  Private
 */
router.get('/my', 
  authenticateToken, 
  communityController.getUserCommunities
);

/**
 * @route   GET /api/community/:communityId
 * @desc    Get community by ID
 * @access  Public (with restrictions for private communities)
 */
router.get('/:communityId', 
  optionalAuth, 
  communityController.getCommunity
);

/**
 * @route   PUT /api/community/:communityId
 * @desc    Update community
 * @access  Private (Admin/Moderator only)
 */
router.put('/:communityId', 
  authenticateToken, 
  validateCommunityData, 
  communityController.updateCommunity
);

/**
 * @route   DELETE /api/community/:communityId
 * @desc    Delete community
 * @access  Private (Admin only)
 */
router.delete('/:communityId', 
  authenticateToken, 
  communityController.deleteCommunity
);

/**
 * @route   POST /api/community/:communityId/join
 * @desc    Join community
 * @access  Private
 */
router.post('/:communityId/join', 
  authenticateToken, 
  communityController.joinCommunity
);

/**
 * @route   POST /api/community/:communityId/leave
 * @desc    Leave community
 * @access  Private
 */
router.post('/:communityId/leave', 
  authenticateToken, 
  communityController.leaveCommunity
);

/**
 * @route   GET /api/community/:communityId/members
 * @desc    Get community members
 * @access  Public (with restrictions for private communities)
 */
router.get('/:communityId/members', 
  optionalAuth, 
  communityController.getCommunityMembers
);

/**
 * @route   POST /api/community/:communityId/moderators
 * @desc    Add moderator to community
 * @access  Private (Admin only)
 */
router.post('/:communityId/moderators', 
  authenticateToken, 
  validateMembershipData, 
  communityController.addModerator
);

/**
 * @route   DELETE /api/community/:communityId/moderators
 * @desc    Remove moderator from community
 * @access  Private (Admin only)
 */
router.delete('/:communityId/moderators', 
  authenticateToken, 
  validateMembershipData, 
  communityController.removeModerator
);

module.exports = router;
