
const User = require('../models/User')
const jwt = require('jsonwebtoken')

// const TEMP_SECRET_KEY = 'TEMP_SECRET_KEY'


const register = async ({ req, res }) => {
    try {

        console.log('body', req.body);

        const {
            first_name,
            last_name,
            email,
            phone,
            password
        } = req.body

        // check unique

        let user = await User.query().insert({
            first_name,
            last_name,
            email,
            phone,
            password
        })

        console.log('user', user);

        // generate token

        console.log('register');

        res.status(200).send('ok')
    } catch (error) {
        console.log('error:register', error);
        res.status(500).send('')
    }
}

const login = async ({ req, res }) => {
    try {
        // temp:
        // const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))
        // await delay(3000)

        console.log('login');
        console.log(req.body);

        const { email, password } = req.body

        let user = await User.query().where({ email }).first()

        if (user) {

            console.log('user', user);
            // if password...
            // generate token
            const accessToken = jwt.sign({ ...user }, process.env.SECRET_KEY, { expiresIn: '1h' })
            const refreshToken = jwt.sign({ ...user }, process.env.SECRET_KEY, /*{ expiresIn: '1h' }*/)
            console.log('token.....', accessToken);

            res.status(200).send({ ...user, accessToken, refreshToken })
        } else {
            res.status(400).send('nonono')
        }

        // get user by email
        // match email and password
        // if ok --> generate token, send token and user-info
        // else res.400 something


    } catch (error) {
        console.log('error:login', error);
        res.status(500).send('')
    }
}

const logout = async ({ req, res }) => {
    try {
        console.log('logout');
        res.status(200).send('ok')
    } catch (error) {
        console.log('error:logout', error);
        res.status(500).send('')
    }
}

const refreshAuth = async ({ req, res }) => {
    try {

        const { refreshToken, userId: id } = req.body()
        try {
            const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY)
        } catch (error) {
            
        }

        const user = await User.query().where({ id }).first()

        const accessExpiration = new Date().getTime() + 3600000
        const accessToken = jwt.sign({ ...user }, process.env.SECRET_KEY, { expiresIn: '1h' })
        const newRefreshToken = jwt.sign({ ...user }, process.env.SECRET_KEY, /*{ expiresIn: '1h' }*/)

        res.status(200).send({ refreshToken: newRefreshToken, accessToken, accessExpiration  })

        // if refreshToken ok --> generate new accesToken and refreshToken
        // send both as { refreshToken, accessToken, accessExpiration }
        // else ?

        // res.status(200).send()


    } catch (error) {
        console.log('error:refreshAuth', error);
        res.status(500).send('error')
    }
}

const getUserInfo = async ({ req, res }) => {
    try {
        console.log('getUserInfo');

        const { id } = req.body // query
        console.log('id', id);

        let user = await User.query().where({ id }).first()

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
    getUserInfo
}