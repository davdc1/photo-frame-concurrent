import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { TextContext } from '../../Contexts/TextContext'
import './welcome.scss'

const Welcome = () => {

    const { userInfo } = useContext(AuthContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Welcome'] || '{}')
    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
            if (userInfo.id) {
                navigate('/auth/photos')
            } else {
                navigate('/user-auth')
            }
        }, 4000)
    }, [])

    return (
        <div className='welcome-wrapper'>
            <div className='welcome-box'>
                <div className='welcome-title-container'>
                    <span className='welcome-title'>{compTexts.welcomeTitle}</span>
                </div>
            </div>
        </div>
    )
}

export default Welcome