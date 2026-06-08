import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { TextContext } from '../../Contexts/TextContext'
import Login2 from '../Login2/Login2'
import Register from '../Register/Register'
import './user-auth.scss'

const MODES = { LOGIN: 'LOGIN', REGISTER: 'REGISTER' }

const UserAuth = () => {

    const { userInfo } = useContext(AuthContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['UserAuth'] || '{}')
    const [mode, setMode] = useState(MODES.LOGIN)
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from || '/auth/photos'

    useEffect(() => {
        if (userInfo.id) {
            navigate(from, { replace: true })
        }
    }, [])

    const toggleMode = () => {
        if (mode === MODES.LOGIN) {
            setMode(MODES.REGISTER)
        } else {
            setMode(MODES.LOGIN)
        }
    }

    return (
        <div className={`user-auth-wrapper ${mode}`}>
            <div className='user-auth-box'>
                {mode === MODES.LOGIN ? <Login2 /> : ''}
                {mode === MODES.REGISTER ? <Register /> : ''}

                <button onClick={toggleMode} className='user-auth-toggle'>
                    {mode === MODES.LOGIN ? compTexts.UserAuth_createAccount : ''}
                    {mode === MODES.REGISTER ? compTexts.UserAuth_haveAccount : ''}
                </button>

            </div>
        </div>
    )
}

export default UserAuth