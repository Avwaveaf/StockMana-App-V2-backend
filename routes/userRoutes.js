const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getLoginStatus,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/userControllers');
const protectRoute = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/log-out', logoutUser);
router.get('/get-user', protectRoute, getUser);
router.get('/login-status', getLoginStatus);
router.patch('/update-profile', protectRoute, updateProfile);
router.patch('/change-password', protectRoute, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;
