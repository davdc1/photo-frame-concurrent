import Resizer from "react-image-file-resizer";

const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
        try {
            Resizer.imageFileResizer (
                file,
                300,
                300,
                'jpeg',
                80,
                0,
                (uri) => resolve(uri),
                'file',
              )
        } catch (error) {
            console.log('eeeeeeeerroror', error);
            reject(error)
        }
    })
}

export default resizeImage
