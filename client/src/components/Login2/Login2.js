import { useContext, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "../../Contexts/AuthContext"
import useTogglePassword from "../../Hooks/toggleShowPassword"
import InputField from "../InputField"
import Spinner from '../Spinner'
import './login.scss'

const Login2 = () => {

    const { login } = useContext(AuthContext)
    const [inputs, setInputs] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [passwordMode, togglePasswordMode] = useTogglePassword()

    const handleInputs = (e) => {
        let { id, value } = e.target
        id = id.replace('login-', '')
        setInputs((state) => ({ ...state, [id]: value }))
    }

    const valid = inputs.email && inputs.password

    const onLogin = () => {
        setLoading(() => {
            const { email, password } = inputs

            login({ email, password })
                .then(() => {
                    if (location.state?.from) {
                        navigate(location.state.from)
                    } else {
                        navigate('/auth/photos')
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
        Login_title: 'Sign in',
        Login_submit: 'Log in',
        Login_loading: 'Logging in...',
        Login_email: 'Email Address',
        Login_password: 'Password',
    }
    return (
        <div className="login-wrapper">

            <span className='login-title'>{content.Login_title}</span>
            <div className='login-fields'>
                <InputField label={content.Login_email}>
                    <input id='login-email' type='email' value={inputs.email} onChange={handleInputs} />
                </InputField>
                <InputField label={content.Login_password} type={passwordMode} togglePassword={togglePasswordMode}>
                    <input id='login-password' type={passwordMode} value={inputs.password} onChange={handleInputs} />
                </InputField>
            </div>
            <div className='login-bottom'>
                <button
                    onClick={onLogin}
                    disabled={!valid}
                    className='login-send'
                >
                    {content.Login_submit}
                </button>
                {loading ? <Spinner className='spinner' /> : ''}

            </div>
        </div>
    )
}

export default Login2