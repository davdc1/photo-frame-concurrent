const Album = require('../models/Album')
const AlbumPhoto = require('../models/AlbumPhoto')
const connection = require('../data/connect')

const AWS = require('aws-sdk');
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

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time))


const addPhotosToAlbum = async ({ req, res }) => {
    try {

        const { ids, album_id } = req.body

        console.log('ids, album_id', ids, album_id);


        let album = await Album.query()
            .where({ id: album_id, user_id: req.user.id })
            .first()

        if (!album) {
            return res.status(400).send('unauthorized')
        }

        let lastInAlbum = await AlbumPhoto.query()
            .select('album_photos.order')
            .leftJoin('albums', 'albums.id', 'album_photos.album_id')
            .where('album_photos.album_id', album_id)
            .andWhere('albums.user_id', req.user.id)
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

        let inserted = await connection('album_photos').insert(insertAlbumPhotos)

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

        console.log('photos', photos, bottomLimit, album_id, isActuallyTopLimit);


        let usersAlbum = await Album.query()
            .where({ id: album_id, user_id: req.user.id })
            .first()

        if (!usersAlbum) {
            return res.status(400).send('unautorized')
        }

        let rowsToDelete = await AlbumPhoto.query()
            .whereIn('id', photos)
            .andWhere('album_id', album_id)
            .orderBy('order', 'ASC')

        let bottomLimitRow = await AlbumPhoto.query()
            .where('album_id', album_id)
            .andWhere('id', bottomLimit)
            .first()

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
                // order: isActuallyTopLimit ? bottomLimitRow.order - (idx + 1) : bottomLimitRow.order + idx + 1
                order: isActuallyTopLimit ? 0 + idx : bottomLimitRow.order + idx + 1

            }))

        let inserted = await connection('album_photos').insert(rowsToMove)

        let deleted = await AlbumPhoto.query()
            .whereIn('id', rowsToDelete.map(({ id }) => id))
            .delete()

        res.status(200).send({ photos, bottomLimit })

    } catch (error) {
        console.log('changeAlbumPhotoOrder', error);
        res.status(500).send(error)
    }
}

const createNewAlbum = async ({ req, res }) => {
    try {

        const { name, description } = req.body

        let newAlbum = await Album.query().insert({
            name,
            description,
            user_id: req.user.id
        })

        res.status(200).send(newAlbum)

    } catch (error) {
        console.log('createNewALbum', error);
        res.status(500).send('error')
    }
}

const deleteAlbum = async ({ req, res }) => {
    try {

        const { album_id } = req.body

        let deleted = await Album.transaction(async (trx) => {

            await AlbumPhoto.query(trx)
                .delete()
                .whereIn('album_id',
                    Album.query(trx)
                        .select('id')
                        .where({
                            album_id,
                            user_id: req.user.id
                        })
                )

            return await Album.query(trx)
                .delete()
                .where({
                    id: album_id,
                    user_id: req.user.id
                })
        })

        if (deleted === 0) throw 'error while deleting album'

        res.status(200).send('ok')

    } catch (error) {
        console.log('deleteAlbum', error);
        res.status(500).send('error')
    }
}

const renameAlbum = async ({ req, res }) => {
    try {

        const { albumId, name } = req.body

        console.log('renameAlbum', albumId, name);

        await Album.query()
            .where({ id: albumId, user_id: req.user.id })
            .patch({ name })

        res.status(200).send('ok')
    } catch (error) {
        console.log('renameAlbum', error);
        res.status(500).send('error')
    }
}

const removeAlbumPhotos = async ({ req, res }) => {
    try {

        const { ids, album_id } = req.body

        await AlbumPhoto.query()
            .delete()
            .whereIn('id', ids)
            .andWhere('album_id',
                Album.query()
                    .select('id')
                    .from('albums')
                    .where('id', album_id)
                    .andWhere('user_id', req.user.id)
            )

        res.status(200).send('ok')
    } catch (error) {
        console.log('removeAlbumPhotos', error);
        res.status(500).send('error')
    }
}

const getUserAlbums = async ({ req, res }) => {
    try {

        const albums = await Album.query()
            .select('albums.*')
            // .select(
            //     Album.raw(`
            //         EXISTS (
            //             SELECT 1
            //             FROM album_photos
            //             WHERE album_photos.album_id = albums.id
            //             LIMIT 1
            //         ) AS has_photos
            //     `)
            // )

            .select(
                Album.raw(`(
                        SELECT photos.name
                        FROM album_photos
                        LEFT JOIN photos ON photos.id = album_photos.photo_id
                        WHERE album_photos.album_id = albums.id
                        AND photos.active = 1
                        LIMIT 1
                    ) AS has_photos
                `)
            )
            .select(
                Album.raw(`(
                        SELECT COUNT(*)
                        FROM album_photos
                        LEFT JOIN photos ON photos.id = album_photos.photo_id
                        WHERE album_photos.album_id = albums.id
                        AND photos.active = 1
                    ) AS photo_count
                `)
            )
            .where('albums.user_id', req.user?.id);


        let promises = []

        for (let album of albums) {
            promises.push(getThumbnailUrls({ user_id: req.user.id, photoName: album.has_photos }).then((url) => {
                album.cover = url
            }))
        }

        await Promise.all(promises)

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

        const album = await Album.query()
            .findOne({ id: album_id, user_id: req.user.id })

        if (!album) {
            return res.status(400).send('unauthorized') // or 'album not found'. 404 ?
        }

        const data = await getUsersAlbumPhotoData({ album_id, user_id: req.user.id, page, perPage })

        return res.status(200).send(data)

    } catch (error) {
        console.log('getUserAlbumPhotos', error);
        return res.status(500).send(error)
    }
}

const getUsersAlbumPhotoData = async ({ album_id, user_id, page, perPage }) => {
    try {

        // let { order: lastInAlbum } = await AlbumPhoto.query()
        let lastRow = await AlbumPhoto.query()
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
            .leftJoin('albums', 'albums.id', 'album_photos.album_id')
            .where({
                'album_photos.album_id': album_id,
                'photos.active': 1
            })
            .andWhere('albums.user_id', user_id)
            .orderBy('album_photos.order', 'asc')
            .page(page || 0, perPage || (lastRow?.order || 0) + 1)

        return { ...albumPhotos, lastInAlbum: lastRow?.order || 0 }
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

        const album = await Album.query()
            .findOne({ id: album_id, user_id: req.user.id })

        if (!album) {
            return res.status(400).end()
        }

        const data = await getUsersAlbumPhotoData({ album_id, user_id: req.user.id, page, perPage })

        const promises = []
        for (const photo of data.results) {
            try {
                promises.push(
                    getThumbnailUrls({ user_id: req.user.id, photoName: photo.name })
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

        // console.log('DATA', data);

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
        Expires: 60 * 60
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
    getUsersAlbumPhotoUrls,
    createNewAlbum,
    deleteAlbum,
    renameAlbum,
    removeAlbumPhotos
}