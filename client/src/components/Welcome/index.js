import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './welcome.scss'

const Welcome = () => {

    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
            // if logged:
            // navigate('/main-menu')

            // else
            navigate('/login')
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