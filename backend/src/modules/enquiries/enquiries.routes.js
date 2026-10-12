const express = require('express');
const router = express.Router();
const enqCtrl = require('./enquiries.controller');
const { authenticate, optionalAuth, authorize } = require('../../middleware/auth');

// Public or logged in customer submit enquiry
router.post('/submit', optionalAuth, enqCtrl.submitEnquiry);

// Customer view their own submitted enquiries
router.get('/my', authenticate, enqCtrl.getMyEnquiries);

// Client Owner CRM leads & Customer message requests
router.get('/client', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.getClientEnquiries);
router.put('/client/:id', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.updateEnquiryStatus);

// Email push to customer & history
router.post('/client/:id/email-push', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.pushEmailToCustomer);
router.post('/:id/email-push', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.pushEmailToCustomer);
router.get('/client/:id/email-history', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.getEmailPushHistory);
router.get('/:id/email-history', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.getEmailPushHistory);

// Backwards compatibility alias for agent routes
router.get('/agent', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.getClientEnquiries);
router.put('/agent/:id', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), enqCtrl.updateEnquiryStatus);

module.exports = router;
