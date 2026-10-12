const express = require('express');
const router = express.Router();
const agentsCtrl = require('./agents.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Public agent routes
router.get('/', agentsCtrl.getPublicAgents);
router.get('/public/primary', agentsCtrl.getPrimaryAgentPublic);
router.get('/primary', agentsCtrl.getPrimaryAgentPublic);
router.get('/:id', agentsCtrl.getAgentPublicProfile);

// Agent authenticated routes
router.get('/dashboard/stats', authenticate, authorize('client', 'agent', 'admin', 'super_admin'), agentsCtrl.getAgentDashboard);
router.get('/profile/me', authenticate, authorize('client', 'agent', 'admin', 'super_admin'), agentsCtrl.getAgentProfile);
router.put('/profile/me', authenticate, authorize('client', 'agent', 'admin', 'super_admin'), agentsCtrl.updateAgentProfile);
router.post('/profile/logo', authenticate, authorize('client', 'agent', 'admin', 'super_admin'), upload.single('logo'), agentsCtrl.uploadAgentLogo);
router.post('/documents/upload', authenticate, authorize('client', 'agent', 'admin', 'super_admin'), upload.single('document'), agentsCtrl.uploadAgentDocument);

// Admin agent routes
router.get('/admin/all', authenticate, authorize('admin', 'super_admin'), agentsCtrl.getAdminAgents);
router.put('/admin/:id/approve', authenticate, authorize('admin', 'super_admin'), agentsCtrl.approveAgent);
router.put('/admin/:id/reject', authenticate, authorize('admin', 'super_admin'), agentsCtrl.rejectAgent);
router.put('/admin/:id/status', authenticate, authorize('admin', 'super_admin'), agentsCtrl.toggleAgentStatus);

module.exports = router;
