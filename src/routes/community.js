const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateCommunityData, validateCommunityUpdateData, validateMembershipData } = require('../middleware/validation');

router.post('/', authenticateToken, validateCommunityData, communityController.createCommunity);
router.get('/search', optionalAuth, communityController.searchCommunities);
router.get('/my', authenticateToken, communityController.getUserCommunities);
router.get('/:communityId', optionalAuth, communityController.getCommunity);
router.put('/:communityId', authenticateToken, validateCommunityUpdateData, communityController.updateCommunity);
router.delete('/:communityId', authenticateToken, communityController.deleteCommunity);
router.post('/:communityId/join', authenticateToken, communityController.joinCommunity);
router.post('/:communityId/leave', authenticateToken, communityController.leaveCommunity);
router.get('/:communityId/members', authenticateToken, communityController.getCommunityMembers);
router.post('/:communityId/moderators', authenticateToken, validateMembershipData, communityController.addModerator);
router.delete('/:communityId/moderators', authenticateToken, validateMembershipData, communityController.removeModerator);
router.delete('/:communityId/members', authenticateToken, validateMembershipData, communityController.removeMember);

module.exports = router;
