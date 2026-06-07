const Text = require('../models/Text')

const getTextsByLng = async ({ req, res }) => {
    try {
        const { lng } = req.query

        console.log('GET /api/texts')
        console.log('if-none-match:', req.headers['if-none-match'])

        const texts = await Text.query()
            .select('component', 'content')
            .where('lng', lng || 'eng')

        // Express's res.send() automatically checks If-None-Match and returns 304
        // if the ETag matches, even when Cache-Control: no-store is set.
        // Deleting the header prevents the ETag comparison, guaranteeing a 200 with body.

        // delete req.headers['if-none-match']
        // res.set('Cache-Control', 'no-store')

        res.status(200).send(texts)
    } catch (error) {
        console.log('getTextsByLng', error);
        res.status(500).send('error')
    }
}

module.exports = {
    getTextsByLng,
}