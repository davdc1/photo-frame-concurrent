var express = require('express');
var router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', (req, res, next) => albumController.getUserAlbums({ req, res, next }));
router.get('/album-photos', (req, res, next) => albumController.getUsersAlbumPhotoUrls({ req, res, next }));

module.exports = router;
