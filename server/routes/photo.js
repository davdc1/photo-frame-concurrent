var express = require('express');
var router = express.Router();
const photoController = require('../controllers/photoController');
const uploadFile = require('../utils/upload')

// router.get('/', (req, res, next) => photoController.getPhotos({ req, res, next }));
router.get('/new-session', (req, res, next) => photoController.startNewSession({ req, res, next }));
router.get('/retrieve-session', (req, res, next) => photoController.retrieveSession({ req, res, next }));
router.get('/session-photo', (req, res, next) => photoController.getSessionPhoto({ res, req, next }));
router.get('/prev', (req, res, next) => photoController.getPhotoById({ req, res, next }));
router.get('/thumbnails', (req, res, next) => photoController.getUserThumbnails({ req, res, next }));
router.get('/test', (req, res, next) => photoController.testConnection({ res, req, next }));
router.get('/upload', (req, res, next) => photoController.serveUploadPage({ req, res, next }));
router.post('/upload-photo', uploadFile.array('fileToUpload', 10), (req, res, next) => photoController.uploadPhoto({ req, res, next }));
router.post('/upload-photos', (req, res, next) => photoController.uploadPhotos({ req, res, next }));
router.post('/validate-files', (req, res, next) => photoController.validateFiles({ req, res, next }));
router.delete('/failed-upload', (req, res, next) => photoController.deleteFailedUpload({ req, res, next }));
router.delete('/delete', (req, res, next) => photoController.deletePhotos({ req, res, next }));

module.exports = router;
