const { readFile, readFileSync } = require('fs');
const path = require('path');
const connection = require('../data/connect')
const { v4: uuidv4 } = require('uuid');


const Session = require('../models/Session');
const Photo = require('../models/Photo');
const AlbumPhoto = require('../models/AlbumPhoto');
const Album = require('../models/Album');
const User = require('../models/User');


const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
})
const s3 = new AWS.S3();


const startNewSession = async ({ req, res }) => {

    try {
        
        console.log('startNewSession');
        const { startWith, album_id, user_id } = req.query
        let session
        if (album_id) {
            session = await Session.query().insert({
                user_id,
                album_id
            })
        } else {
            session = await Session.query().insert({
                user_id,
                photo_id: startWith || 1
            })
        }

        // console.log('session', session);
        res.status(200).send(session)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }        
}

const retrieveSession = async ({ req, res }) => {
    try {
        const { session_id, user_id } = req.query
        // const session = await Session.query().findById(session_id)
        const session = await Session.query().where({
            id: session_id,
            user_id
        })
        .first()

        if (session) {
            console.log('sesssssss', session);
            res.status(200).send(session)
        } else {
            res.status(201).send('invalid')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

const getSessionPhoto = async ({ req, res }) => {

    try {
        let { session_id, album_id, user_id } = req.query

        console.log('req.query', req.query);

        const session = await Session.query().findById(session_id)

        let nextPhoto

        if (album_id) {
            // first album-photo
            nextPhoto = await getFirstAlbumPhoto({ album_id })
            session.album_id = album_id
            session.photo_id = nextPhoto.photo_id
            await session.$query().patch()
        } else if (session.album_id) {
            // next album-photo
            const lastPhoto = await getLastAlbumPhoto({ album_id: session.album_id })
            nextPhoto = await getNextAlbumPhoto({ album_id: session.album_id, startAtOrder: session.order + 1 })
            session.photo_id = nextPhoto.photo_id
            session.order = nextPhoto.order

            if (nextPhoto.order === lastPhoto.order) {
                nextPhoto.last_in_album = true
            }

            await session.$query().patch()
        } else {
            // next photo all-photos
            nextPhoto = await getNextUserPhoto({ user_id, startAt: session.photo_id + 1 })
            session.photo_id = nextPhoto.photo_id
            await session.$query().patch()
        }

        console.log('nextPhoto', nextPhoto);

        let albumId = album_id || session.album_id || ''


        // send file
        // TODO:
        // add last_in_album
        
        // let options = {
        //     root:  path.join(__dirname, '../', '/public/images')
        // }

        // console.log(`${nextPhoto.name}.${nextPhoto.ext}`);

        // res.sendFile(`${nextPhoto.name}.${nextPhoto.ext}`, options, (error) => {
        //     if (error) {
        //         console.log('error. getSessionPhoto', error);
        //         res.status(500).send(error)
        //     }
        // })

        

        // send url (temp)
        // let url = path.join('images', `/${nextPhoto.name}.${nextPhoto.ext}`)
        // return res.status(200).send({ url, ...nextPhoto, album_id: albumId, last_in_album: nextPhoto.last_in_album }) // either signed url or file. + metadata



        // signed url:
        // const params = {
        //     Bucket: process.env.AWS_BUCKET,
        //     Key: `user-uploads/${user_id}/${nextPhoto.name}`,
        //     Expires: 60 * 10, // seconds. consider setting dynamiclly according to user's slideshow settings
        // };
            
        // s3.getSignedUrl('getObject', params, (err, url) => {
        //     if (err) console.log('getSigendUrl error', err);
        //     return res.status(200).send({ url, ...nextPhoto, album_id: albumId, last_in_album: nextPhoto.last_in_album })
        // })

        try {
            const url = await getPhotoUrl({ user_id, photoName: nextPhoto.name })
            return res.status(200).send({ url, ...nextPhoto, album_id: albumId, last_in_album: nextPhoto.last_in_album })
        } catch (error) {
            // ?????
        }
        
    } catch (error) {
        console.log('getSessionPhoto', error);
        return res.status(500).send('eror')
    }
    
}

const getPhotoUrl = ({ user_id, photoName, thumbnail }) => {

    const path = thumbnail ? `thumbnails/thumbnail-${photoName}` : `${photoName}`

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `user-uploads/${user_id}/${path}`,
        Expires: 60 * 10,
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (error, url) => {
            if (error) {
                console.log('getPhotoUrl error', error);
                reject(error)
            }

            resolve(url)
            
        })
    })
}

const getPhotoById = async ({ req, res }) => {
    try {

        const { photo_id, user_id } = req.query

        const { name } = await Photo.query()
            .findById(photo_id)

        const url = await getPhotoUrl({ user_id, photoName: name })

        return res. status(200).send({ url })
    } catch (error) {
        console.log('getPhotoPrev', error);
        return res.status(500).send(error)
    }
}

const getUserThumbnails = async ({ req, res }) => {
    try {
        const { user_id, page, perPage } = req.query

        console.log('page, perPage', page, perPage);

        let photos = await Photo.query()
            .select('*')
            .where({
                user_id,
                active: 1
            })
            .page(page - 1, perPage)

        // console.log('getthem photos', photos);

        let promises = []
        for (const photo of photos.results) {
            promises.push(
                getPhotoUrl({ user_id, photoName: photo.name, thumbnail: true })
                    .then((url) => photo.url = url)
            )
        }
       await Promise.allSettled(promises)

       return res.status(200).send(photos)
        
    } catch (error) {
        console.log('getUserThumbnails', error);
        res.status(500).send(error)
    }
}

const getSessionPhoto1 = async ({ req, res }) => {
    try {

        const { session_id } = req.query

        const session = await Session.query().findById(session_id)
        const lastPhoto = await Photo.query().orderBy('id', 'desc').first()
        let currentPhotoId = session.photo_id // + 1
        let photo
        
        while (!photo || photo.active == false) {
            console.log(photo);
            photo = await Photo.query().findById(currentPhotoId)
            if (currentPhotoId == lastPhoto.id) currentPhotoId = 1
            else {
                currentPhotoId++
            }
        }

        
        let sessionUpdated = await Session.query()
            .patchAndFetchById(session_id, { photo_id: currentPhotoId })


        let options = {
            root:  path.join(__dirname, '../', '/public/images')
        }

        console.log(`${photo.name}.${photo.ext}`);

        res.sendFile(`${photo.name}.${photo.ext}`, options, (error) => {
            if (error) {
                console.log('error. getSessionPhoto', error);
                res.status(500).send(error)
            }
        })




        // let meta = {
        //     ...photo
        // }

        // let imagePath = path.join(__dirname, '../', '/public/images/', `${photo.name}.${photo.ext}`)
        // const image = readFileSync(imagePath)

        // console.log('meta', meta);

        // // res.set('Content-Type', 'image/jpeg');
        // res.json({ meta, image: image.toString('base64') })
        // // res.status(201).json({ meta })




        
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    } 
}

const uploadPhotos = async ({ req, res }) => {
    // recieve up to 10 file-data objs
    // give unique names
    // insert file data to table:photos and table:album_photos if necessary
    // lop through file and create upload urls
    // respond to client with: objs, each containing url, unique name, id



    try {
        const { files, user_id, album_id, startAtOrder } = req.body
       
        // insert file data
        let insertPhotos = []
        for (const file of files) {
            file.name = `${uuidv4()}-${Date.now()}`

            insertPhotos.push({
                name: file.name,
                name_user: file.name_user,
                ext: file.ext,
                user_id,
                active: 1
            })

        }
        
        try {
            await connection('photos').insert(insertPhotos)
        } catch (error) {
            // ?????
        }

        if (album_id) { 
            try {
                let photos = await Photo.query()
                    .whereIn('name', insertPhotos.map(({ name }) => name))
                    .orderBy('id', 'asc')
    
                let insertAlbumPhotos = photos.map(({ id }, idx) => {
                    return { photo_id: id, album_id, order: startAtOrder + 1 + idx }
                })
                await connection('album_photos').insert(insertAlbumPhotos)
            } catch (error) {
                // ?????
            }
        }
    
        // create urls:
        const getUrlPromise = (file, thumbnail) => {

            let thumbnailPath = thumbnail ? '/thumbnails' : ''
            let thumbnailName = thumbnail ? 'thumbnail-' : ''

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `user-uploads/${user_id}${thumbnailPath}/${thumbnailName}${file.name}`,
                ContentType: 'image/jpeg',
                Expires: 60 * 5
            }
            
            return new Promise((resolve, reject) => {
                s3.getSignedUrl('putObject', params, (error, url) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(url)
                    }
                })
            })
        }
        
        for (const file of files) {
            try {
                let url = await getUrlPromise(file)
                let thumbnailUrl = await getUrlPromise(file, true)
                file.url = url
                file.thumbnailUrl = thumbnailUrl
            } catch (error) {
                // ?????
            }
        }

        return res.status(200).send(files)
        
    } catch (error) {
        console.log('uploadPhotos', error);
        return res.status(500).send('test')
    }

}

const deleteFailedUpload = async ({ req, res }) => {
    
    try {
        const { name } = req.query

        let albumPhotoDelete = await AlbumPhoto.query()
            .leftJoin('photos', 'album_photos.photo_id', 'photos.id')
            .where('photos.name', name)
            .delete()

        let photoDelete = await Photo.query()
            .where('name', name)
            .delete()

        return res.status(200).send({ photoDelete, albumPhotoDelete })
    } catch (error) {
        console.log('deleteFailedUploads', error);
        return res.status(500).send('error')
    }
}

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))

const deletePhotos = async ({ req, res }) => {
    try {

        await delay(3000)

        const { ids, user_id } = req.query

        console.log('deletePhotos', ids);

        let photos = await Photo.query()
            .whereIn('id', ids)
            .andWhere('user_id', user_id) // just in case. but must use auth !!

        console.log('photoso', photos);

        let promises = []

        for (const photo of photos) {
            promises.push(
                deletePhotoPromise(user_id, photo.name, false),
                deletePhotoPromise(user_id, photo.name, true)
            )
        }

        await Promise.allSettled(promises)
        .then((res) => console.log('all setteled', res))

        let deletedFromAlbum = await AlbumPhoto.query()
            .whereIn('photo_id', ids)
            .delete()

        console.log('deletedFromAlbum', deletedFromAlbum);
       
        let deletedPhotos = await Photo.query()
            .whereIn('id', ids)
            .andWhere('user_id', user_id)
            .delete()

        console.log('deletedPhotos', deletedPhotos);


        res.status(200).send('ok')
        
    } catch (error) {
        console.log('deletePhotos', error);
        res.status(500).send(error)
    }
}


const deletePhotoPromise = (user_id, name, thumbnail) => {
    let thumbnailPath = thumbnail ? '/thumbnails' : ''
    let thumbnailName = thumbnail ? 'thumbnail-' : ''

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `user-uploads/${user_id}${thumbnailPath}/${thumbnailName}${name}`
    }

    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (error, res) => {
            if (error) {
                console.log(`erorr while delting photo: ${name}`, error);
                reject(error)
            } else {
                resolve(res)
            }
        })
    })
}

const testConnection = async ({ req, res }) => {


    try {
        // 

        // const params = {
        //     Bucket: process.env.AWS_BUCKET,
        //     Key: 'user-uploads/11123/testFile',
        //     // Body: "hello there is your test file",
        //     // ContentType: 'txt'
        // };

        // let data = await s3.upload(params).promise()


        // let data2 = await s3.getObject(params).promise()
        // let filePath = path.join(__dirname, '../', '/public/texts/that.txt')
        // writeFileSync(filePath, data2.Body)


        
        // const params = {
            //     Bucket: process.env.AWS_BUCKET,
            //     Key: `user-uploads/11123/testFile`,
            //     Expires: 60 * 10, // URL expiry time in seconds
            //   };
            
            
        // s3.getSignedUrl('getObject', params, (err, url) => {
            //     if (err) console.log('getSigendUrl error', err);
            
            //     console.log('downloadUrl: ', url);
            // })

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: `user-uploads/11123/imgmg.jpeg`,
            Expires: 60 * 10, // URL expiry time in seconds
            ContentType: 'image/jpeg'
            };

        let uploadUrl
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                return res.status(500).json({ error: 'Error generating pre-signed URL' });
            }
            console.log('UPLOAD URL: ', url);
            uploadUrl = url

            let file = readFileSync(path.join(__dirname, '../', '/public/images/1581428816563877124.jpeg'))

            console.log('FILE', file);

            fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                'Content-Type': 'image/jpeg'
                },
                body: file
            })
            .then(async (res) => {
                let ttt = await  res.text()
                console.log('RESPONSE TEXT', ttt);
            })
            .catch((errrr) => {
                console.log('ERRRRR', errrr);
            })

        });


        let result = await Album.query()
        let user = await User.query()

        res.status(200).send({ result, user })
    } catch (error) {
        console.log(error);
        res.status(500).send('connection error', error)
    }
}

const serveUploadPage = async ({ req, res }) => {
    try {

        console.log('serveUploadPage');


        const options = {
            root: path.join(__dirname, '../', 'public/views', 'uploadPhoto.html'),
        }

        readFile(options.root, 'utf8', (error, data) => {
            if (error) {
                console.log('erro reading html file', error);
            }

            data = data.replace('<%= PORT %>', process.env.PORT)

            res.send(data)
        })

        // res.sendFile('uploadPhoto.html', options, (error) => {
        //     if (error) throw error
        // })
        
    } catch (error) {
        console.log(error);
        res.status(500).send('cannot serve page')
    }
}

const uploadPhoto = async ({ req, res }) => {
    try {


        console.log(req.files);
        // output:
        // [
        //     {
        //         fieldname: 'fileToUpload',
        //         originalname: 'IMG_9696.jpeg',
        //         encoding: '7bit',
        //         mimetype: 'image/jpeg',
        //         destination: '/Users/davidcohen/Desktop/java script things.nosync/photo-thing/back/uploads',
        //         filename: 'IMG_9696.jpeg',
        //         path: '/Users/davidcohen/Desktop/java script things.nosync/photo-thing/back/uploads/IMG_9696.jpeg',
        //         size: 2078077
        //       }
        // ]



        let insertArray = []

        req.files.forEach(({ filename }) => {
            let [name, ext] = filename.split('.')
            insertArray.push({ name, ext })
        });

        for (let i = 0; i < insertArray.length; i++) {
            let res = await Photo.query().insert(insertArray[i])
            console.log(`res ${i}`, res);

            // output:
            // Photo { name: 'IMG_9757', ext: 'jpeg', id: 30 }
        }



        res.status(200).end() // send('ok')
        
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}


const validateFiles = async ({ req, res }) => {
    try {
        

        let { list } = req.body
         
        let existObj = {  }
        for (let i = 0; i < list.length; i++) {
            let res = await Photo.query().where({ name: list[i].name })
            console.log('res', Array.isArray(res));
            if (res.length) existObj[i] = list[i].name
        }

        
        res.status(200).send(existObj)
       
        // console.log(fileData);
        // { name, size, type, idx }

        // check if name exists on db.
        // check if exists in storage ?

        // add ids to each fileData obj.

        // return list of invalid (i.e. name exist s in db) fileData obj ids.



    } catch (error) {
        console.log('validateFiles', error);
        res.status(500).send(error)
    }
}


const getFirstAlbumPhoto = async ({ album_id }) => {
    let albumPhoto = await AlbumPhoto.query()
        .select(
            'album_photos.photo_id',
            'album_photos.order',
            'photos.name',
            'photos.ext',
            'photos.active'
        )
        .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
        .where({
            album_id,
            'photos.active': 1
        })
        .andWhereNot('photos.id', null)
        .orderBy('order', 'ASC')
        .first()
    return albumPhoto
}

const getLastAlbumPhoto = async ({ album_id }) => {
    let albumPhoto = await AlbumPhoto.query()
        .select(
            'album_photos.photo_id',
            'album_photos.order',
            'photos.name',
            'photos.ext',
            'photos.active'
        )
        .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
        .where({
            album_id,
            'photos.active': 1
        })
        .andWhereNot('photos.id', null)
        .orderBy('order', 'DESC')
        .first()
    return albumPhoto
}

const getNextUserPhoto = async ({ user_id, startAt }) => {
    let fullRound = false
    let stop = false
    while (!stop) {
        let nextPhoto = await Photo.query()
            .select(
                'photos.id AS photo_id',
                'photos.name',
                'photos.ext'
            )
            // .leftJoin('')
            .where('photos.user_id', user_id)
            .andWhere('photos.id', '>=', startAt)
            .andWhereNot('photos.active', null)
            .orderBy('photos.id', 'ASC')
            .first()

        if (!nextPhoto) {
            if (!fullRound) {
                fullRound = true
                startAt = 1
            } else {
                stop = true
            }
        } else return nextPhoto
    }
}

const getNextAlbumPhoto = async ({ album_id, startAtOrder }) => {
    let fullRound = false
    let stop = false
    while (!stop) {
        
        let nextPhoto = await AlbumPhoto.query()
            .select(
                'photo_id',
                'order',
                'photos.ext',
                'photos.name'
            )
            .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
            .where({
                album_id,
                'photos.active': 1
            })
            .andWhere('order', '>=', startAtOrder)
            .andWhereNot('photos.id', null)
            .orderBy('order', 'ASC')
            .first()
        
            if (!nextPhoto) {
                if (!fullRound) {
                    fullRound = true
                    startAtOrder = 1
                } else {
                    stop = true
                }
            } else return nextPhoto
                    
    }

}


module.exports = {
    startNewSession,
    retrieveSession,
    getSessionPhoto,
    getSessionPhoto1,
    testConnection,
    serveUploadPage,
    uploadPhoto,
    uploadPhotos,
    deleteFailedUpload,
    deletePhotos,
    validateFiles,
    getPhotoById,
    getUserThumbnails
}

// const getNextAlbumPhoto = async ({ album_id, startAtOrder }) => {
//     let lastInAlbum = await getLastAlbumPhoto({ album_id })
//     let fullRound = false
//     let stop = false
//     while (!stop) {
//         if (startAtOrder > lastInAlbum.order) {
//             if (!fullRound) {
//                 fullRound = true
//                 startAtOrder = 1
//             } else {
//                 stop = true
//             }
//         }
        
//         let albumOrder = await AlbumPhoto.query()
//             .select('photo_id', 'order')
//             .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
//             .where({
//                 album_id,
//                 'photos.active': 1
//             })
//             .andWhere('order', '>=', startAtOrder)
//             .andWhereNot('photos.id', null)
//             .orderBy('order', 'ASC')
//             .limit(5)

//         console.log('albumOrder', albumOrder);
                    
//         let nextPhoto
    
//         let i = 0
//         while (i <= 4) {
//             nextPhoto = await Photo.query()
//                 .findById(albumOrder[i].photo_id)

//             if (nextPhoto) {
//                 nextPhoto.order = albumOrder[i].order
//                 console.log('here', nextPhoto);
//                 return nextPhoto
//             }
//             else if (i === 4) {
//                 startAtOrder += 5
//                 break
//             } else i++
//         }
//     }

// }