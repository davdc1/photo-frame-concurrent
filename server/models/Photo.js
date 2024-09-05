const { Model } = require('objection')

class Photo extends Model {
    static get tableName() {
        return 'photos'
    }
}

module.exports = Photo