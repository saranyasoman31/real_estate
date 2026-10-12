const express = require('express');
const router = express.Router();
const propCtrl = require('./properties.controller');
const { authenticate, optionalAuth, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Image upload helper endpoint
router.post('/upload-image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

// Customer Favorites
router.get('/user/favorites', authenticate, propCtrl.getMyFavorites);

// Client Owner Portal endpoints (Single Client Model)
router.get('/client/dashboard', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.getClientDashboardStats);
router.get('/client/my-listings', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.getClientProperties);
router.post('/client/create', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.createProperty);
router.put('/client/:id/status', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.changeStatus);
router.put('/client/:id/feature', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.toggleFeatured);
router.put('/client/:id', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.updateProperty);
router.delete('/client/:id', authenticate, authorize('client', 'admin', 'super_admin'), propCtrl.deleteProperty);

// Backwards compatibility aliases for agent/admin calls
router.get('/agent/my-listings', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), propCtrl.getClientProperties);
router.post('/agent/create', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), propCtrl.createProperty);
router.put('/agent/:id/status', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), propCtrl.changeStatus);
router.put('/agent/:id', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), propCtrl.updateProperty);
router.delete('/agent/:id', authenticate, authorize('client', 'admin', 'super_admin', 'agent'), propCtrl.deleteProperty);

// Public properties endpoints
router.get('/', optionalAuth, propCtrl.getPublicProperties);
router.post('/:id/favorite', authenticate, propCtrl.toggleFavorite);
router.get('/:id', optionalAuth, propCtrl.getPropertyById);

module.exports = router;
