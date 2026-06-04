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
const index = require('../services/pineconeService');
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_S3_REGION,
// })
// const s3 = new AWS.S3();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
});
const sqs = new AWS.SQS({ region: 'eu-north-1' })

const getUserPhotoCount = async ({ req, res }) => {
    try {
        const result = await Photo.query()
            .where({ user_id: req.user.id })
            .count('* as count')
            .first()

        res.status(200).send({ count: result.count })
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

const startNewSession = async ({ req, res }) => {

    try {

        const { startWith, album_id } = req.query

        if (album_id) {
            const albumVerified = await Album.query()
                .where({ id: album_id, user_id: req.user.id })
                .first()

            if (!albumVerified) {
                return res.status(400).end()
            }
        }

        let session
        if (album_id) {
            session = await Session.query().insert({
                user_id: req.user.id,
                album_id
            })
        } else {
            session = await Session.query().insert({
                user_id: req.user.id,
                photo_id: startWith || 1 // user's authorization to the photo id is checked when retrieving it.
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
        const { session_id } = req.query
        // const session = await Session.query().findById(session_id)
        const session = await Session.query().where({
            id: session_id,
            user_id: req.user.id
        })
            .first()

        if (session) {
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
        let { session_id, album_id, random } = req.query

        // const session = await Session.query().findById(session_id) // + req.user.id

        const session = await Session.query()
            .where({ id: session_id, user_id: req.user.id })
            .first()

        if (!session) {
            return res.status(400).send('session not found')
        }

        let nextPhoto

        if (album_id) {
            // first album-photo in album      
            nextPhoto = await getFirstAlbumPhoto({ album_id, user_id: req.user.id })

            if (!nextPhoto) {
                return res.status(400).send('album mismatch')
            }

            session.album_id = album_id
            session.photo_id = nextPhoto.photo_id
            session.order = nextPhoto.order
            await session.$query().patch()

        } else if (session.album_id) {
            // next album-photo
            const lastPhoto = await getLastAlbumPhoto({ album_id: session.album_id, user_id: req.user.id })

            if (!lastPhoto) { // could mean req.user.id and album_id don't match. or album is empty.
                return res.status(400).send('album mismatch')
            }

            nextPhoto = await getNextAlbumPhoto({ album_id: session.album_id, startAtOrder: session.order + 1 })
            session.photo_id = nextPhoto.photo_id
            session.order = nextPhoto.order

            if (nextPhoto.order === lastPhoto.order) {
                nextPhoto.last_in_album = true
            }

            await session.$query().patch()
        } else {


            // next photo all-photos
            if (random) {
                console.log('RANDOM', random);
                nextPhoto = await getRandomUserPhoto({ user_id: req.user.id })
            } else {
                console.log('NOT RANDOM');
                nextPhoto = await getNextUserPhoto({ user_id: req.user.id, startAt: session.photo_id + 1 })
            }

            if (!nextPhoto) {
                return res.status(400).send('an error occurred')
            }
            session.photo_id = nextPhoto.photo_id
            await session.$query().patch()
        }

        let albumId = album_id || session.album_id || ''

        try {
            const url = await getPhotoUrl({ user_id: req.user.id, photoName: nextPhoto.name })
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
        Expires: 60 * 60,
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
            .where({ id: photo_id, user_id: req.user.id })
            .first()

        const url = await getPhotoUrl({ user_id, photoName: name })

        return res.status(200).send({ url })
    } catch (error) {
        console.log('getPhotoPrev', error);
        return res.status(500).send(error)
    }
}

const getUserThumbnails = async ({ req, res }) => {
    try {
        const { page, perPage } = req.query

        const lastPhoto = await Photo.query()
            .where({ user_id: req.user.id })
            .orderBy('id', 'desc')
            .first()

        let photos = await Photo.query()
            .select('*')
            .where({
                user_id: req.user.id,
                active: 1
            })
            .page(page - 1, perPage)

        let promises = []
        for (const photo of photos.results) {
            promises.push(
                getPhotoUrl({ user_id: req.user.id, photoName: photo.name, thumbnail: true })
                    .then((url) => photo.url = url)
            )
        }
        await Promise.allSettled(promises)

        return res.status(200).send({ photos, lastPhoto })

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
            root: path.join(__dirname, '../', '/public/images')
        }

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
    try {
        const { files, album_id, startAtOrder } = req.body

        if (album_id) {
            let albumVerified = await Album.query()
                .where({ id: album_id, user_id: req.user.id })
                .first()

            if (!albumVerified) {
                return res.status(400).send('album not found')
            }
        }

        // insert file data
        let insertPhotos = []
        for (const file of files) {
            file.name = `${uuidv4()}-${Date.now()}`

            insertPhotos.push({
                name: file.name,
                name_user: file.name_user,
                ext: file.ext,
                user_id: req.user.id,
                active: 1,
                ...file.meta,
                location: file.meta.location
                    ? connection.raw(
                        "ST_SRID(POINT(?, ?), 4326)",
                        [file.meta.location.lng, file.meta.location.lat]
                    )
                    : connection.raw(
                        "ST_SRID(POINT(0, 0), 4326)"
                    ),
                has_location: file.meta.location ? true : false
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
                Key: `user-uploads/${req.user.id}${thumbnailPath}/${thumbnailName}${file.name}`,
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

const confirmUpload = async ({ req, res }) => {
    try {
        const { name } = req.body

        let photo = await Photo.query()
            .where('name', name)
            .andWhere('user_id', req.user.id)
            .first()

        if (!photo) {
            return res.status(404).send('photo not found')
        }

        // message sqs with photo id, trigger embedding worker:
        let sqsResponse = await sqs.sendMessage({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
                photoId: photo.id,
                userId: photo.user_id,
                s3Key: `user-uploads/${photo.user_id}/${photo.name}`
            })
        }).promise()

        console.log('sqsResponse', sqsResponse);

        return res.status(200).send(photo)
    } catch (error) {
        console.log('confirmUpload', error);
        return res.status(500).send('error')
    }
}

const deleteFailedUpload = async ({ req, res }) => {

    try {
        const { name } = req.query

        let albumPhotoDelete = await AlbumPhoto.query()
            .leftJoin('photos', 'album_photos.photo_id', 'photos.id')
            .where('photos.name', name)
            .andWhere('photos.user_id', req.user.id)
            .delete()

        let photoDelete = await Photo.query()
            .where('name', name)
            .andWhere('user_id', req.user.id)
            .delete()

        return res.status(200).send({ photoDelete, albumPhotoDelete })
    } catch (error) {
        console.log('deleteFailedUploads', error);
        return res.status(500).send('error')
    }
}

const deletePhotos = async ({ req, res }) => {
    try {

        const { ids } = req.query

        let photos = await Photo.query()
            .whereIn('id', ids)
            .andWhere('user_id', req.user.id)

        let promises = []

        for (const photo of photos) {
            promises.push(
                deletePhotoPromise(req.user.id, photo.name, false),
                deletePhotoPromise(req.user.id, photo.name, true)
            )
        }

        await Promise.allSettled(promises)
            .then((res) => console.log('all setteled', res))

        let deletedFromAlbum = await AlbumPhoto.query()
            .leftJoin('albums', 'albums.id', 'album_photos.album_id')
            .whereIn('photo_id', ids)
            .andWhere('albums.user_id', req.user.id)
            .delete()


        let deletedPhotos = await Photo.query()
            .whereIn('id', ids)
            .andWhere('user_id', req.user.id)
            .delete()

        try {

            const vectorIds = ids.map(id => `photo_${id}`)

            console.log('delete ids', vectorIds);
            await index.deleteMany({ ids: vectorIds })
        } catch (error) {
            console.log('error while deleting vectors', error);
        }

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
                console.log(`error while delting photo: ${name}`, error);
                reject(error)
            } else {
                resolve(res)
            }
        })
    })
}

const testConnection = async ({ req, res }) => {
    try {

        console.log('testConnection');

        return res.status(200).send('ok')

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

const validateFiles = async ({ req, res }) => {
    try {


        let { list } = req.body

        let existObj = {}
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

const getFirstAlbumPhoto = async ({ album_id, user_id }) => {
    let albumPhoto = await AlbumPhoto.query()
        .select(
            'album_photos.photo_id',
            'album_photos.order',
            'photos.name',
            'photos.ext',
            'photos.active'
        )
        .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
        .leftJoin('albums', 'albums.id', 'album_photos.album_id')
        .where({
            album_id,
            'photos.active': 1,
            'albums.user_id': user_id
        })
        .andWhereNot('photos.id', null)
        .orderBy('order', 'ASC')
        .first()
    return albumPhoto
}

const getLastAlbumPhoto = async ({ album_id, user_id }) => {
    let albumPhoto = await AlbumPhoto.query()
        .select(
            'album_photos.photo_id',
            'album_photos.order',
            'photos.name',
            'photos.ext',
            'photos.active'
        )
        .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
        .leftJoin('albums', 'albums.id', 'album_photos.album_id')
        .where({
            album_id,
            'photos.active': 1,
            'albums.user_id': user_id
        })
        .andWhereNot('photos.id', null)
        .orderBy('order', 'DESC')
        .first()
    return albumPhoto
}

// TODO. internal.
const getRandomUserPhoto = async ({ user_id }) => {

    const [{ min, max }] = await Photo.query()
        .min('id AS min')
        .max('id AS max')
        .where('user_id', user_id)
        .andWhereNot('active', null)

    let randId = min + Math.floor(Math.random() * (max - min + 1))

    let photo = await Photo.query()
        .select(
            'photos.id AS photo_id',
            'photos.name',
            'photos.ext'
        )
        .where('photos.user_id', user_id)
        .andWhere('photos.id', '>=', randId)
        .andWhereNot('photos.active', null)
        .orderBy('photos.id', 'ASC')
        .first()

    if (!photo) {
        photo = await Photo.query()
            .select(
                'photos.id AS photo_id',
                'photos.name',
                'photos.ext'
            )
            .where('photos.user_id', user_id)
            .andWhere('photos.id', '<=', randId)
            .andWhereNot('photos.active', null)
            .orderBy('photos.id', 'ASC')
            .first()
    }

    return photo
}

// todo: function should not be exposed (since its not going through auth). consider enforcing.
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
                stop = true // return null ?
            }
        } else return nextPhoto

    }

}

module.exports = {
    getUserPhotoCount,
    startNewSession,
    retrieveSession,
    getSessionPhoto,
    // getSessionPhoto1,
    testConnection,
    serveUploadPage,
    // uploadPhoto,
    uploadPhotos,
    confirmUpload,
    deleteFailedUpload,
    deletePhotos,
    // validateFiles,
    getPhotoById,
    getUserThumbnails,
    // filterPhotos,
    getPhotoUrl
}
