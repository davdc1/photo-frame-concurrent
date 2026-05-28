const axios = require('axios')

const getBoundingBox = async (query) => {
    try {
        const url = 'https://nominatim.openstreetmap.org/search'

        const { data } = await axios.get(url, {
            params: {
                q: query,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'photo-album-app'
            }
        })

        if (!data.length) return null

        const bbox = data[0].boundingbox

        return {
            south: parseFloat(bbox[0]),
            north: parseFloat(bbox[1]),
            west: parseFloat(bbox[2]),
            east: parseFloat(bbox[3])
        }
    } catch (error) {
        console.log('geoService.getBoundingBox', error)
        throw error
    }

}

module.exports = { getBoundingBox }