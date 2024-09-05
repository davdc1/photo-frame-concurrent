var path = require('path')
var multer = require('multer')

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../', 'public/images'), // Define the destination directory
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Keep the original file name
    },
  });
  
  const upload = multer({ storage: storage });


  module.exports = upload