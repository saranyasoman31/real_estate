const express = require('express');
const router = express.Router();
const notifCtrl = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/', authenticate, notifCtrl.getNotifications);
router.put('/:id/read', authenticate, notifCtrl.markAsRead);
router.put('/read-all', authenticate, notifCtrl.markAllAsRead);

module.exports = router;
