var express = require('express');
var router = express.Router();
var textController = require('../controllers/textController');
const { authMiddleware } = require('../utils/middleware');

// router.use(authMiddleware)

const tempMiddle = (req, res, next) => {
    res.on('finish', () => {
        console.log(
            'tempMiddle',
            req.method,
            req.originalUrl,
            'status:',
            res.statusCode,
            'response etag:',
            res.getHeader('ETag')
        )
    })

    next()
}

router.get('/', tempMiddle, (req, res, next) => textController.getTextsByLng({ req, res, next }));

module.exports = router;
