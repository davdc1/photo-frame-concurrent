var jwt = require('jsonwebtoken')

module.exports = {
    authMiddleware: (req, res, next) => {
        
        try {

           console.log('authMiddleware');
           console.log('req.header(Authorization)', req.header('Authorization'));
            const token = req.header('Authorization')?.replace?.('Bearer ', '')
            if (!token) res.status(400).send('..unautorized..')
            else {
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded);
            
                // if good -->
                next()
            }
            
            
        } catch (error) {
            console.log('exeption: authMiddleware', error);
        }

    }
}