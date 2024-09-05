
import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import InputField from '../InputField'
import './login.scss'

const Login = () => {

    const { userInfo, /*setUserInfo,*/ login } = useContext(AuthContext)
    const [inputs, setInputs] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleInputs = (e) => {
        let { id, value } = e.target
        id = id.replace('login-', '')
        setInputs((state) => ({ ...state, [id]: value }))
    }

    const valid = inputs.email && inputs.password

    const navigate = useNavigate()
    const location = useLocation()

    const onLogin = () => {
        setLoading(() => {
            const { email, password } = inputs
            login({ email, password })
            .then(() => {
                if (location.state?.from) {
                    navigate(location.state.from)
                } else {
                    navigate('/auth/main-menu')
                }
            })
            .catch((error) => {
                console.log('error login', error);
            })
            .finally(() => setLoading(false))

            return true
        })
    }

    const content = {
        loginTitle: 'login...',
        loginSubmit: 'go',
        loading: 'loading'
    }

    return (
        <div className='login-wrapper'>
            <div className='login-box'>
                <div className='login-top'>
                    <span className='login-title'>{content.loginTitle}</span>
                </div>
                <div className='login-middle'>
                    <InputField label={'email/phone'}>
                        <input id='login-email' value={inputs.email} onChange={handleInputs} />
                    </InputField>
                    <InputField label={'password'}>
                        <input id={'login-password'} value={inputs.password} onChange={handleInputs} />
                    </InputField>
                </div>
                <div className='login-bottom'>
                    <button
                        onClick={onLogin}
                        disabled={!valid}
                        className='login-button'
                    >
                        {content.loginSubmit}
                    </button>
                    {loading ? <span>{content.loading}</span> : ''}
                </div>
            </div>
        </div>
    )
}

export default Login