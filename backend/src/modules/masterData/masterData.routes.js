const express = require('express');
const router = express.Router();
const mdCtrl = require('./masterData.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Public lookups
router.get('/property-types', mdCtrl.getPropertyTypes);
router.get('/amenities', mdCtrl.getAmenities);
router.get('/locations', mdCtrl.getLocations);
router.get('/banners', mdCtrl.getBanners);

// Admin Master Data CRUD
router.post('/admin/property-types', authenticate, authorize('admin', 'super_admin'), mdCtrl.createPropertyType);
router.post('/admin/amenities', authenticate, authorize('admin', 'super_admin'), mdCtrl.createAmenity);
router.post('/admin/cities', authenticate, authorize('admin', 'super_admin'), mdCtrl.createCity);
router.delete('/admin/:entity/:id', authenticate, authorize('admin', 'super_admin'), mdCtrl.deleteMasterData);

module.exports = router;
