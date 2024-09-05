const { Model } = require('objection')

class Album extends Model {
    static get tableName() {
        return 'albums'
    }
}

module.exports = Album