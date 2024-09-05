const Album = require('../models/Album')
const AlbumPhoto = require('../models/AlbumPhoto')

const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
})
const s3 = new AWS.S3();


const getUserAlbums = async ({ req, res }) => {
    try {
        const { userId } = req.query
        
        console.log('getUserAlbums', userId);


        let albums = await Album.query().where({ user_id: userId })
        
        console.log('albums', albums);
        return res.status(200).send(albums)
        
    } catch (error) {
        console.log('getUserAlbums', error);
        return res.status(500).send(error)
    }
}

const getUserAlbumPhotos = async ({ req, res }) => {
    try {
        const { album_id, page, perPage } = req.query
        
        console.log('getUserAlbumPhotos', album_id);

        console.log('page, perPage', page, perPage);

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

        console.log('album_id', album_id);
        console.log('page', page, perPage)
        
        let { order: lastInAlbum } = await AlbumPhoto.query()
            .select('album_photos.order')
            .where('album_photos.album_id', album_id)
            .orderBy('album_photos.order', 'desc')
            .first()

        console.log('lastInAlbum', lastInAlbum);

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
            .page(page || 0, perPage || 1)

            console.log('albumPhotos', albumPhotos);
        
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
                // ?????
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
    getUserAlbums,
    getUserAlbumPhotos,
    getUsersAlbumPhotoData,
    getUsersAlbumPhotoUrls
}