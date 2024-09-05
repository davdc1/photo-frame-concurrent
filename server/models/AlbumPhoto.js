const { Model } = require('objection')

class AlbumPhoto extends Model {
    static get tableName() {
        return 'album_photos'
    }
}

module.exports = AlbumPhoto