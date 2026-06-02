import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { AuthContext } from '../../Contexts/AuthContext'
import { TextContext } from '../../Contexts/TextContext'
import useTogglePassword from '../../Hooks/toggleShowPassword'
import { authService } from '../../services/authService'
import InputField from '../InputField'
import Spinner from '../Spinner'
import './register.scss'

const Register = () => {

    const { signUser } = useContext(AuthContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Register'] || '{}')
    const [inputs, setInputs] = useState({ first_name: '', last_name: '', email: '', password: '' })
    const [valid, setValid] = useState({ first_name: false, last_name: false, email: false, password: false })
    const [errors, setErrors] = useState({ EMAIL_EXISTS: false })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [passwordMode, togglePasswordMode] = useTogglePassword()

    const firstNameFocus = useFocusable()
    const lastNameFocus = useFocusable()
    const emailFocus = useFocusable()
    const passwordFocus = useFocusable()
    const submitFocus = useFocusable()

    const handleInputs = ({ target }) => {
        const field = target.id.split?.('-')?.[1]
        let value = target.value

        validate(field, value)
        setInputs((state) => ({ ...state, [field]: value }))

    }

    const validate = (field, value) => {
        let test
        if (field === 'email') {
            test = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value)
        } else if (['first_name', 'last_name'].includes(field)) {
            test = value.length > 0
        } else if (field === 'password') {
            test = value.length >= 3
        } else {
            return
        }
        setValid((state) => ({ ...state, [field]: test }))
    }

    const onRegister = async () => {

        try {

            if (!allValid) return

            removeErrors()
            setLoading(true)

            let res = await authService.register(inputs)

            signUser(res)

            navigate('/auth/photos')

        } catch (error) {
            console.log('register', error);
            if (error.status === 409) { // email already exists
                setErrors((state) => ({ ...state, [error.response.data]: true })) // error.response.data = EMAIL_EXISTS
            }

        } finally {
            setLoading(false)
        }
    }

    const removeErrors = () => {
        setErrors((state) => {
            let obj = {}
            Object.keys(state).forEach((key) => obj[key] = false)
            return obj
        })
    }

    const allValid = Object.values(valid).filter((bool) => !bool).length === 0

    return (
        <div className='register-wrapper'>
            <span className='register-title'>{compTexts.Register_title}</span>
            <div className='register-fields'>
                <InputField label={compTexts.Register_firstName}>
                    <input id={'register-first_name'} value={inputs.first_name} onChange={handleInputs} ref={firstNameFocus.ref} />
                </InputField>
                <InputField label={compTexts.Register_lastName}>
                    <input id={'register-last_name'} value={inputs.last_name} onChange={handleInputs} ref={lastNameFocus.ref} />
                </InputField>
                <InputField label={compTexts.Register_email}>
                    <input id='register-email' type='email' value={inputs.email} onChange={handleInputs} ref={emailFocus.ref} />
                </InputField>
                <InputField label={compTexts.Register_password} type={passwordMode} togglePassword={togglePasswordMode}>
                    <input id={'register-password'} type={passwordMode} value={inputs.password} onChange={handleInputs} ref={passwordFocus.ref} />
                </InputField>
            </div>


            <div className='register-bottom'>
                <div className='register-error-container'>
                    {errors.EMAIL_EXISTS ? <span>{compTexts.Register_emailExists}</span> : ''}
                </div>

                <div className="register-send-container">

                    <button
                        onClick={onRegister}
                        disabled={!allValid}
                        className='register-send'
                        ref={submitFocus.ref}
                    >
                        {compTexts.Register_submit}
                    </button>
                    {loading ? <Spinner className='spinner' /> : ''}
                </div>

            </div>
        </div>
    )
}

export default Register