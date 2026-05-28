var jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit');

const authMiddleware = (req, res, next) => {

    try {

        const token = req.header('Authorization')?.replace?.('Bearer ', '')
        if (!token) return res.status(403).send('No token')
        else {
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            req.user = decoded
            next()
        }

    } catch (error) {
        console.log('exeption: authMiddleware', error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).send("access_token_expired");
        }
        return res.status(403).send("invalid_token");
    }

}

const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,              // max 5 requests per window per user/IP

    standardHeaders: true, // adds RateLimit-* headers
    legacyHeaders: false,

    message: {
        error: "Too many requests. Please try again later."
    },

    keyGenerator: (req) => {
        if (req.user?.id) {
            return req.user.id; // best case
        }

        // fallback: use safe IP handling
        return rateLimit.ipKeyGenerator(req);
    }
})

module.exports = {
    authMiddleware,
    rateLimiter
}
