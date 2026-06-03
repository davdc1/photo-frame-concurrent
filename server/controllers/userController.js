
const User = require('../models/User')
const AuthSession = require('../models/AuthSession')
const jwt = require('jsonwebtoken')
const argon2 = require('argon2')
const crypto = require('crypto');
const { emailTransporter } = require('../services/emailer');

// const TEMP_SECRET_KEY = 'TEMP_SECRET_KEY'

const generateJwtToken = (userPayload) => {
    return jwt.sign({ ...userPayload }, process.env.SECRET_KEY, { expiresIn: '10m' })
}

const generateRefreshToken = (sessionId) => {
    return `${sessionId}.${crypto.randomBytes(64).toString('hex')}`
}

const generateEmailVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

const sendVerificationEmail = async ({ email, emailVerificationRawToken }) => {
    await emailTransporter.sendMail({
        // from: '"frame-app" <noreply@photo-frame-app.com>',
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to frame-app',
        html: `<p>Click the link to verify your email: <a href="${process.env.CORS_ORIGIN}/user/verify-email?token=${emailVerificationRawToken}">verify email</a></p>`
    });
}

const register = async ({ req, res }) => {
    try {

        const {
            first_name,
            last_name,
            email,
            // phone,
            password
        } = req.body

        let emailExists = await User.query()
            .where({ email })
            .first()

        if (emailExists) {
            return res.status(409).send('EMAIL_EXISTS')
        }

        // email verification token
        const emailVerificationRawToken = generateEmailVerificationToken();
        const verification_token_hash = hashToken(emailVerificationRawToken);
        const verification_token_expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        // hash password
        const hash = await argon2.hash(password, { type: argon2.argon2id })

        let user = await User.query().insert({
            first_name,
            last_name,
            email,
            // phone,
            password: hash,
            verification_token_hash,
            verification_token_expires
        })

        let { response, userPayload, accessToken } = await signUser({ user, res })

        // send email with verification link with emailVerificationRawToken

        // await emailTransporter.sendMail({
        //     from: '"frame-app" <noreply@photo-frame-app.com>',
        //     to: email,
        //     subject: 'Welcome to frame-app',
        //     html: `<p>Click the link to verify your email: <a href="${process.env.CORS_ORIGIN}/user/verify-email?token=${emailVerificationRawToken}">verify email</a></p>`
        // });

        await sendVerificationEmail({ email, emailVerificationRawToken })


        response.status(200).send({ ...userPayload, accessToken })

    } catch (error) {
        console.log('error:register', error);
        res.status(500).send('')
    }
}

const verifyEmail = async ({ req, res }) => {
    try {
        const { token } = req.query

        console.log('VERIFY EMAIL token received: ', token);

        if (!token) return res.status(400).send('Missing token');

        const tokenHash = hashToken(token);
        const user = await User.query()
            .where({ verification_token_hash: tokenHash })
            .first()

        if (!user) {
            return res.status(400).send('Invalid verification token')
        }

        if (new Date(user.verification_token_expires) < new Date()) {
            const emailVerificationRawToken = generateEmailVerificationToken();
            const verification_token_hash = hashToken(emailVerificationRawToken);
            const verification_token_expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
            await User.query()
                .where({ id: user.id })
                .patch({ verification_token_hash, verification_token_expires })
            await sendVerificationEmail({ email, emailVerificationRawToken })
            return res.status(400).send('Token expired, new email sent');
        }

        await User.query()
            .where({ id: user.id })
            .patch({ verified: true, verification_token_hash: null, verification_token_expires: null })

        return res.status(200).send('Email verified successfully')
    } catch (error) {
        console.log('error:verifyEmail', error);
        res.status(500).send('')
    }
}

const login = async ({ req, res }) => {
    try {

        const { email, password } = req.body

        let user = await User.query().where({ email }).first()

        // check password

        if (user) {

            // if (user.password.length > 10) { // for development. to allow non-hashed passwords               
            let passwordOk = await argon2.verify(user.password, password)
            if (!passwordOk) {
                return res.status(401).send('Invalid credentials')
            }
            // }



            const { response, userPayload, accessToken } = await signUser({ req, res, user })

            response.status(200).send({ ...userPayload, accessToken })
        } else {
            res.status(400).send('nonono')
        }

    } catch (error) {
        console.log('error:login', error);
        res.status(500).send('')
    }
}

const signUser = async ({ user, req, res }) => {
    // old version

    // const { id, first_name, last_name, email, phone } = user
    // const userPayload = { id, first_name, last_name, email, phone }
    // const accessToken = jwt.sign({ ...userPayload }, process.env.SECRET_KEY, { expiresIn: '20s' }) // TODO: was 10m
    // const refreshToken = jwt.sign({ ...userPayload }, process.env.SECRET_KEY, { expiresIn: '30d' })

    // try {
    //     await User.query()
    //         .patch({ token: refreshToken })
    //         .where({ email })

    // } catch (error) {
    //     throw error
    // }


    // new version, auth_sessions table

    const { id, first_name, last_name, email, phone } = user
    const userPayload = { id, first_name, last_name, email, phone }
    const sessionId = crypto.randomUUID()
    const refreshToken = generateRefreshToken(sessionId)
    const refresh_token_hash = hashToken(refreshToken)
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    const accessToken = generateJwtToken(userPayload)

    try {
        let newAuthSession = await AuthSession.query().insert({
            id: sessionId,
            user_id: user.id,
            refresh_token_hash,
            expires_at,
            user_agent: req.headers['user-agent']
        });
        console.log('newAuthSession: ', newAuthSession);
    } catch (error) {
        console.log('error:newAuthSession', error);
        throw error
    }


    // to connect from iphone: TODO: dev only?

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // https?
        // sameSite: "lax",
        // sameSite: "None",

        path: '/',
        expires: expires_at
    })


    // res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: false, // https?
    //     sameSite: "lax",

    //     path: '/',
    // })

    return { response: res, userPayload, accessToken }

}

const logout = async ({ req, res }) => {
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.status(401).send('no-refresh-token')

        const sessionId = refreshToken.split('.')[0]
        const refreshTokenHash = hashToken(refreshToken)

        const deletedAuthSession = await AuthSession.query()
            .where({ id: sessionId, refresh_token_hash: refreshTokenHash })
            .delete()

        if (!deletedAuthSession) return res.status(401).send('no-auth-session')

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).send('ok')

    } catch (error) {
        console.log('error:logout', error);
        res.status(500).send('error')
    }
}

const logoutOG = async ({ req, res }) => {
    try {
        // console.log('logout', req.user);

        const refreshToken = req.cookies.refreshToken



        // if (req.user?.id) {
        //     let userPatched = await User.query()
        //         .where('id', req.user.id)
        //         .patch({ token: '' })

        //         console.log('userPatched', userPatched);

        // }

        if (refreshToken) {
            let tokenCleared = await User.query()
                .where('token', refreshToken)
                .patch({ token: '' })

            console.log('tokenCleared', tokenCleared);

        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,  // https ???
            sameSite: "lax",
            path: "/",
        });


        res.status(200).send('ok')
    } catch (error) {
        console.log('error:logout', error);
        res.status(500).send('')
    }
}


const refreshAuth = async ({ req, res }) => {



    console.log('REFRESH AUTH!!!');

    try {
        const refreshToken = req.cookies.refreshToken
        const [sessionId] = refreshToken.split('.')
        const refreshTokenHash = hashToken(refreshToken)

        const authSession = await AuthSession.query().where({ id: sessionId, refresh_token_hash: refreshTokenHash }).first()
        if (!authSession) throw 'auth session not found'
        // if (authSession.refresh_token_hash !== refreshTokenHash) throw 'refresh token invalid'
        if (authSession.expires_at < new Date()) throw 'refresh token expired'

        const user = await User.query().where({ id: authSession.user_id }).first()
        if (!user) throw 'user not found'

        const userPayload = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone
        }
        const accessToken = generateJwtToken(userPayload)

        const newRefreshToken = generateRefreshToken(sessionId)
        const newRefreshTokenHash = hashToken(newRefreshToken)
        const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

        let updatedAuthSession = await AuthSession.query()
            .where({ id: sessionId })
            .patch({
                refresh_token_hash: newRefreshTokenHash,
                expires_at: newExpiresAt
            })

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,  // https ???
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        });

        return res.status(200).send({ ...userPayload, accessToken })

    } catch (error) {
        console.log('error: refreshAuth', error);
        res.status(500).send('error')
    }
}

const refreshAuthOG = async ({ req, res }) => {
    console.log('######################   REFRESH AUTH   #####################');

    try {

        const refreshToken = req.cookies.refreshToken

        let decoded
        try {
            decoded = jwt.verify(refreshToken, process.env.SECRET_KEY)
            let userTokenOk = await User.query()
                .where({ token: refreshToken })
                .andWhere({ id: decoded.id }) // redundent? 
                .first()

            if (!userTokenOk) {
                throw 'user-token not found'
            }

        } catch (error) {
            console.log('refreshAuth', error);
            return res.status(403).send('invalid-refresh-token')
        }

        const { id, first_name, last_name, email, phone } = decoded
        const accessToken = jwt.sign({ id, first_name, last_name, email, phone }, process.env.SECRET_KEY, { expiresIn: '20s' }) // TODO: was 10m
        const newRefreshToken = jwt.sign({ id, first_name, last_name, email, phone }, process.env.SECRET_KEY, { expiresIn: '30d' })

        try {
            await User.query()
                .patch({ token: newRefreshToken })
                .where({ email })
        } catch (error) {
            throw error
        }

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false, // https?
            sameSite: "lax",
            path: '/'
        })

        return res.status(200).send({ accessToken })

    } catch (error) {
        console.log('error:refreshAuth', error);
        res.status(500).send('error')
    }
}

const getUserInfo = async ({ req, res }) => {
    try {
        console.log('getUserInfo');

        // const { id } = req.body // query
        // console.log('id', id);

        let user = await User.query().where({ id: req.user.id }).first()

        console.log('user found', user);

        res.status(200).send(user)
    } catch (error) {
        console.log('error:getUserInfo', error);
        res.status(500).send('')
    }
}

module.exports = {
    register,
    login,
    logout,
    refreshAuth,
    getUserInfo,
    verifyEmail
}