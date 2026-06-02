const { Model } = require('objection')

class Text extends Model {
    static get tableName() {
        return 'texts'
    }
}

module.exports = Text