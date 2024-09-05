const knex = require('knex')
const { Model } = require('objection')

require('dotenv').config()

const connectionConfig = {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE
    }
}

const connection = knex(connectionConfig)

connection.raw('SELECT 1')
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch((err) => {
        console.error('Failed to establish database connection:', err);
    });

Model.knex(connection) 


module.exports = connection