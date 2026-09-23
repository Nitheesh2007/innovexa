const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getProfile, googleLogin, githubLogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/google', googleLogin);
router.post('/github', githubLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/mock-social', require('../controllers/authController').mockSocialLogin);
router.get('/profile', protect, getProfile);
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
