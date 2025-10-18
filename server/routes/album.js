var express = require('express');
var router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', (req, res, next) => albumController.getUserAlbums({ req, res, next }));
router.get('/album-photos', (req, res, next) => albumController.getUsersAlbumPhotoUrls({ req, res, next }));
router.post('/add-to-album', (req, res, next) => albumController.addPhotosToAlbum({ req, res, next }));
router.post('/change-photo-order', (req, res, next) => albumController.changeAlbumPhotoOrder({ req, res, next }));

module.exports = router;
