var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
const { authMiddleware } = require('../utils/middleware');

router.post('/register', (req, res, next) => userController.register({ req, res, next }));
router.post('/login', (req, res, next) => userController.login({ req, res, next }));
router.post('/logout', (req, res, next) => userController.logout({ req, res, next }));
router.post('/user-info', authMiddleware, (req, res, next) => userController.getUserInfo({ req, res, next }));
router.post('/refresh-auth', (req, res, next) => userController.refreshAuth({ req, res, next }));
router.get('/verify-email', (req, res, next) => userController.verifyEmail({ req, res, next }));

module.exports = router;
