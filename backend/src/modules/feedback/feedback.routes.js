const express = require('express');
const router = express.Router();
const feedbackCtrl = require('./feedback.controller');
const { authenticate, optionalAuth, authorize } = require('../../middleware/auth');

// Public endpoints
router.post('/', optionalAuth, feedbackCtrl.submitFeedback);
router.get('/public', feedbackCtrl.getPublicFeedback);
router.get('/stats', feedbackCtrl.getTrustStats);

// Agent / Client Portal endpoints
router.get('/agent', authenticate, authorize('client', 'admin', 'super_admin'), feedbackCtrl.getAgentFeedback);
router.put('/agent/:id/reply', authenticate, authorize('client', 'admin', 'super_admin'), feedbackCtrl.replyToFeedback);
router.put('/agent/:id/feature', authenticate, authorize('client', 'admin', 'super_admin'), feedbackCtrl.toggleFeaturedFeedback);
router.delete('/agent/:id', authenticate, authorize('client', 'admin', 'super_admin'), feedbackCtrl.deleteFeedback);

module.exports = router;
