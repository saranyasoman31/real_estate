const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Mock OTP and password reset endpoints matching SRS Section 11.1
router.post('/verify-otp', (req, res) => {
  res.json({ success: true, message: 'OTP verified successfully.' });
});
router.post('/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Password reset link sent to your registered email.' });
});
router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password has been reset successfully.' });
});
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
