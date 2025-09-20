const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/test-notification', auth, userController.sendTestNotification);

module.exports = router;