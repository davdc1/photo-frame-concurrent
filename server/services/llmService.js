const OpenAI = require('openai')

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function complete({ systemPrompt, userPrompt, text = null, model = 'gpt-4o-mini' }) {
    const res = await client.responses.create({
        model,
        input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        text,
    })

    return JSON.parse(res.output?.[0]?.content?.[0]?.text)
}

module.exports = { complete }
