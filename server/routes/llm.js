var express = require('express')
var router = express.Router()
const llmController = require('../controllers/llmController')
const middleware = require('../utils/middleware')

router.use(middleware.authMiddleware)
router.use(middleware.rateLimiter)

router.post('/create-album', (req, res, next) => llmController.createAlbum({ req, res, next }))

module.exports = router
