var express = require('express');
var router = express.Router();
const albumController = require('../controllers/albumController');
const { authMiddleware } = require('../utils/middleware')
router.use(authMiddleware)

router.get('/', (req, res, next) => albumController.getUserAlbums({ req, res, next }));
router.get('/album-photos', (req, res, next) => albumController.getUsersAlbumPhotoUrls({ req, res, next }));
router.post('/add-to-album', (req, res, next) => albumController.addPhotosToAlbum({ req, res, next }));
router.post('/change-photo-order', (req, res, next) => albumController.changeAlbumPhotoOrder({ req, res, next }));
router.post('/new-album', (req, res, next) => albumController.createNewAlbum({ req, res, next }))
router.delete('/delete', (req, res, next) => albumController.deleteAlbum({ req, res, next }))
router.delete('/remove-photos', (req, res, next) => albumController.removeAlbumPhotos({ req, res, next }))
router.put('/rename', (req, res, next) => albumController.renameAlbum({ req, res, next }))



//albums/delete

module.exports = router;
