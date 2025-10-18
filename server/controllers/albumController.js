const Album = require('../models/Album')
const AlbumPhoto = require('../models/AlbumPhoto')
const connection = require('../data/connect')

const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
})
const s3 = new AWS.S3();

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time))


const addPhotosToAlbum = async ({ req, res }) => {
    try {

        console.log('addPhotosToAlbum');

        const { ids, user_id, album_id } = req.body

        console.log('ids, user_id, album_id', ids, user_id, album_id);
        

        // query album_photos to get startAtOrder

        let lastInAlbum = await AlbumPhoto.query()
            .select('album_photos.order')
            .leftJoin('albums', 'albums.id', 'album_photos.album_id')
            .where('album_photos.album_id', album_id)
            .andWhere('albums.user_id', user_id)
            .orderBy('album_photos.order', 'desc')
            .first()

        if (!lastInAlbum) lastInAlbum = 0
        else lastInAlbum = lastInAlbum.order
        
        const insertAlbumPhotos = ids.map((id, idx) => {
            return {
                album_id,
                photo_id: id,
                order: lastInAlbum + 1 + idx
            }
        })

        console.log('insertAlbumPhotos', insertAlbumPhotos);

        let inserted = await connection('album_photos').insert(insertAlbumPhotos)
        
        console.log('RESRESRES', inserted);


        // await delay(1000)
        

        res.status(200).send('HERER')
        
    } catch (error) {
        console.log('addPhotosToAlbum', error);
        res.status(500).send(error)
    }
}

const changeAlbumPhotoOrder = async ({ req, res }) => {
    try {

        const { photos, bottomLimit, album_id, isActuallyTopLimit } = req.body

        let rowsToDelete = await AlbumPhoto.query()
            .whereIn('id', photos)
            .andWhere('album_id', album_id)
            .orderBy('order', 'ASC')
        
        let bottomLimitRow = await AlbumPhoto.query()
            .where('album_id', album_id)
            .andWhere('id', bottomLimit).first()

        let incrementOrder = await AlbumPhoto.query()
        .where('album_id', album_id)
        .andWhere((builder) => {
            if (isActuallyTopLimit) {
                builder.andWhere('order', '>=', bottomLimitRow.order)
            } else {
                builder.andWhere('order', '>', bottomLimitRow.order)
            }
        })
        .whereNotIn('id', photos)
        .patch({
            order: AlbumPhoto.raw('?? + ?', 'order', photos.length),
        })
        
        let rowsToMove =
            rowsToDelete.map(({ photo_id }, idx) => ({
                album_id,
                photo_id,
                order: isActuallyTopLimit ? bottomLimitRow.order - (idx + 1) : bottomLimitRow.order + idx + 1
            }))        

        let inserted = await connection('album_photos').insert(rowsToMove)

        let deleted =  await AlbumPhoto.query()
            .whereIn('id', rowsToDelete.map(({ id }) => id))
            .delete()
        
        res.status(200).send({ photos, bottomLimit })
        
    } catch (error) {
        console.log('changeAlbumPhotoOrder', error);
        res.status(500).send(error)
    }
}

const getUserAlbums = async ({ req, res }) => {
    try {
        const { userId } = req.query
        
        let albums = await Album.query().where({ user_id: userId })
        
        return res.status(200).send(albums)
        
    } catch (error) {
        console.log('getUserAlbums', error);
        return res.status(500).send(error)
    }
}

const getUserAlbumPhotos = async ({ req, res }) => {
    try {
        const { album_id, page, perPage } = req.query

        if (!album_id) {
            return res.status(400).end()
        }

        const data = await getUsersAlbumPhotoData({ album_id, page, perPage })
        
        return res.status(200).send(data)
        
    } catch (error) {
        console.log('getUserAlbumPhotos', error);
        return res.status(500).send(error)
    }
}

const getUsersAlbumPhotoData = async ({ album_id, page, perPage }) => {
    try {

        let { order: lastInAlbum } = await AlbumPhoto.query()
            .select('album_photos.order')
            .where('album_photos.album_id', album_id)
            .orderBy('album_photos.order', 'desc')
            .first()

        let albumPhotos = await AlbumPhoto.query()
            .select(
                'photos.id',
                'photos.name',
                'photos.ext',
                'photos.name_user',
                'album_photos.order',
                'album_photos.id AS album_photo_id'
            )
            .leftJoin('photos', 'photos.id', 'album_photos.photo_id')
            .where({
                'album_photos.album_id': album_id,
                'photos.active': 1
            })
            .orderBy('album_photos.order', 'asc')
            .page(page || 0, perPage || lastInAlbum + 1)
        
        return { ...albumPhotos, lastInAlbum }
    } catch (error) {
        console.log('getUserAlbumPhotoData', error);
    }
}

const getUsersAlbumPhotoUrls = async ({ req, res }) => {
    try {
        
        const { album_id, page, perPage } = req.query
        
        if (!album_id) {
            return res.status(400).end()
        }
        const { user_id } = await Album.query()
            .findOne('id', album_id)
        const data = await getUsersAlbumPhotoData({ album_id, page, perPage })        

        const promises = []
        for (const photo of data.results) {
            try {
                promises.push(
                    getThumbnailUrls({ user_id, photoName: photo.name })
                    .then((url) => {
                        photo.url = url
                    })
                )
            } catch (error) {
                // ??
                // console.log('error', error);
            }
        }

        await Promise.allSettled(promises)

        return res.status(200).send(data)

    } catch (error) {
        console.log('getAlbumPhotoUrls', error);
        return res.status(500).send(error)
    }
}


const getThumbnailUrls = ({ user_id, photoName }) => {
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `user-uploads/${user_id}/thumbnails/thumbnail-${photoName}`,
        Expires: 60 * 5,
    };
        
    return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (error, url) => {
            if (error) {
                console.log('getThumbnailUrls', error);
                reject(error)
            }
            resolve(url)
        })
    })
}

module.exports = {
    addPhotosToAlbum,
    changeAlbumPhotoOrder,
    getUserAlbums,
    getUserAlbumPhotos,
    getUsersAlbumPhotoData,
    getUsersAlbumPhotoUrls
}