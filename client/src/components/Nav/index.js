import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
// import { TextContext } from '../../Contexts/TextContext'
import './nav.scss'

const NAV_OVERLAY_ID = 'navOverlayId'

const SideNav = ({ links }) => {

    const { userInfo } = useContext(AuthContext)
    // const { texts } = useContext(TextContext)
    const [opened, setOpened] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const [visible, setVisible] = useState(true)
    const visibleTimer = useRef(null)
    const location = useLocation()

    useEffect(() => {
        
        if (location.pathname === '/auth/frame') { // hide by condition/domain...
            setVisible(false)
            window.addEventListener('mousemove', makeVisible)
            window.addEventListener('touchstart', makeVisible)
        } else {
            setVisible(true)
        }

        return () => {
            window.removeEventListener('mousemove', makeVisible)
            window.removeEventListener('touchstart', makeVisible)
            clearTimeout(visibleTimer.current)
        }
    }, [location.pathname])

    const makeVisible = () => {
        if (visibleTimer.current) clearTimeout(visibleTimer.current)

        setVisible(true)
        visibleTimer.current = setTimeout(() => {
            setVisible(false)
            closeNav()
        }, 5000)
    }

    const closeNav = () => {
        setOpened(false)
        setTimeout(() => setShowOverlay(false), 400)
    }

    const clickOutside = ({ target }) => {
        if (target.id === NAV_OVERLAY_ID) {
            closeNav()
        }
    }

    const toggle = () => {
        if (opened) {
            closeNav()
        } else {
            setOpened(true)
            setShowOverlay(true)
        }
    }


    const texts = {}

    return (

        <>
            {!opened ?
                <div onClick={toggle} className={`navburger ${visible ? 'visible' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div> : ''}

                <div className={`side-nav-overlay ${showOverlay ? 'show' : 'unshow'}`} id={NAV_OVERLAY_ID} onClick={clickOutside}>

                    <div className={`side-nav-list ${opened ? 'opened' : 'closed'}`}>
                        <button onClick={toggle} className='side-nav-close'>+</button>
                        {links(texts?.Nav || {}).map(({ text, heb_text, path, admin }, idx) => {
                            
                            if (admin && userInfo.role !== 'ADMIN') return '' 
                            
                            return (
                                <div onClick={toggle} className='nav-link' key={text + idx}>
                                    <NavLink to={path}>{heb_text || text}</NavLink>
                                </div>
                            )
                        }
                    )}
                    </div>
                </div>

    
        </>
    )
}

export default SideNav