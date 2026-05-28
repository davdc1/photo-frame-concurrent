const axios = require('axios')

// On Fly, the Python worker is a separate app — localhost is wrong unless you use a sidecar.
// Internal DNS: https://fly.io/docs/networking/app-services/
const defaultEmbeddingUrl =
    process.env.FLY_MACHINE_ID || process.env.FLY_REGION
        ? 'http://photo-frame-worker.internal:8000'
        : 'http://localhost:8000'

const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || defaultEmbeddingUrl

const getTextEmbedding = async (text) => {
    console.log(`[Embedding] Calling: ${EMBEDDING_API_URL}/embed-text`);
    const res = await axios.post(`${EMBEDDING_API_URL}/embed-text`, { text })
    return res.data.embedding
}

module.exports = { getTextEmbedding }
