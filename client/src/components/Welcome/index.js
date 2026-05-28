import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import './welcome.scss'

const Welcome = () => {

    const { userInfo } = useContext(AuthContext)
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

    const content = {
        welcomeTitle: "you're here"
    }
    return (
        <div className='welcome-wrapper'>
            <div className='welcome-box'>
                <div className='welcome-title-container'>
                    <span className='welcome-title'>{content.welcomeTitle}</span>
                </div>
            </div>
        </div>
    )
}

export default Welcome