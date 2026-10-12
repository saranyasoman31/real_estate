const express = require('express');
const router = express.Router();
const adminCtrl = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.get('/dashboard', authenticate, authorize('admin', 'super_admin'), adminCtrl.getAdminDashboard);
router.get('/users', authenticate, authorize('admin', 'super_admin'), adminCtrl.getUsers);
router.put('/users/:id/status', authenticate, authorize('admin', 'super_admin'), adminCtrl.toggleUserStatus);

module.exports = router;
