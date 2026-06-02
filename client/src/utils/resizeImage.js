import Resizer from "react-image-file-resizer";

const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
        try {
            Resizer.imageFileResizer(
                file,
                400,
                400,
                'jpeg',
                100,
                0,
                (uri) => resolve(uri),
                'file',
            )
        } catch (error) {
            console.log('resize error', error);
            reject(error)
        }
    })
}

export default resizeImage
