var express = require('express');
var router = express.Router();
var textController = require('../controllers/textController');
const { authMiddleware } = require('../utils/middleware');

// router.use(authMiddleware)

router.get('/', (req, res, next) => textController.getTextsByLng({ req, res, next }));

module.exports = router;
