// validate format: "YYYY-MM-DD HH:mm:ss"
const isValidDatetime = (str) => {
    if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return false
    return !isNaN(new Date(str.replace(' ', 'T')).getTime())
}

const sanitizeString = (str, length = 200, defaultStr = 'Untitled') => {
    if (typeof str !== 'string') return defaultStr
    return str.replace(/<[^>]*>/g, '').trim().slice(0, length) || defaultStr
}

module.exports = {
    isValidDatetime,
    sanitizeString
}