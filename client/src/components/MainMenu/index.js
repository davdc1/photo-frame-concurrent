import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import './main-menu.scss'
import { useContext } from 'react'
import { AuthContext } from '../../Contexts/AuthContext'

const MainMenu = () => {
    
    const navigate = useNavigate()
    const { userInfo: { id } } = useContext(AuthContext)
    
    const menuLinks = [
        {
            name: 'Frame',
            path: '/auth/frame',
            text: 'slide-show'
        },
        {
            name: 'Test',
            callback: () => {
                console.log('hi');
                
                authService.getUserInfo({ id })
                .then((res) => {
                    console.log('eded', res.data);
                })
                .catch((error) => {
                    console.log('errorrr', error);
                })
                
            },
            text: 'test'
        },
        {
            name: 'start-show',
            path: '/auth/start-show',
            text: 'Start a show'
        },
        {
            name: 'albums',
            path: '/auth/albums',
            text: 'Albums'
        },
        {
            name: 'all-photos',
            path: '/auth/photos',
            text: 'All-Photos'
        }
    ]

    return(
        <div className='main-menu-wrapper'>
            <div className='main-menu-squares'>
                {menuLinks.map(({ path, callback, text }, idx) => (
                    <div
                        key={idx.toString()}
                        onClick={() => callback ? callback() : navigate(path)}
                        className='main-menu-square'
                    >
                        <span>{text}</span>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default MainMenu