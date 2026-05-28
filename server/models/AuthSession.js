const { Model } = require('objection')

class AuthSession extends Model {
    static get tableName() {
        return 'auth_sessions'
    }
}

module.exports = AuthSession