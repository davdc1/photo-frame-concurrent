const Text = require('../models/Text')

const getTextsByLng = async ({ req, res }) => {
    try {
        const { lng } = req.query

        console.log('GET /api/texts')
        console.log('if-none-match:', req.headers['if-none-match'])

        const texts = await Text.query()
            .select('component', 'content')
            .where('lng', lng || 'eng')

        // Antigravity says:
        // Express's res.send() automatically checks If-None-Match and returns 304
        // if the ETag matches, even when Cache-Control: no-store is set.
        // Deleting the header prevents the ETag comparison, guaranteeing a 200 with body.

        // delete req.headers['if-none-match']
        // res.set('Cache-Control', 'no-store')



        // in order to prevent caching issue:  

        // req.headers['if-none-match'] = undefined
        // delete req.headers['if-none-match']

        res.set({
            // 'Cache-Control': 'no-store, no-cache, must-revalidate',
            // 'Pragma': 'no-cache',
            // 'Expires': '0',
            // 'Etag': '',
            'etag': false
        })

        // res.removeHeader('Etag')


        res.status(200).send(texts)
    } catch (error) {
        console.log('getTextsByLng', error);
        res.status(500).send('error')
    }
}

module.exports = {
    getTextsByLng,
}