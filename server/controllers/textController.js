const Text = require('../models/Text')

const getTextsByLng = async ({ req, res }) => {
    try {
        const { lng } = req.query

        const texts = await Text.query()
            .select('component', 'content')
            .where('lng', lng || 'eng')

        res.set('Cache-Control', 'no-store')
        res.status(200).send(texts)
    } catch (error) {
        console.log('getTextsByLng', error);
        res.status(500).send('error')
    }
}

module.exports = {
    getTextsByLng,
}