import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { PopupContext } from '../../Contexts/PopupContext'
import Icon from '../Icon'
// import { TextContext } from '../../Contexts/TextContext'
import './nav2.scss'

const NAV_OVERLAY_ID = 'navOverlayId'

const SideNav = ({ links, componentClass }) => {

    const { userInfo, logout } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)
    // const { texts } = useContext(TextContext)
    const [opened, setOpened] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const [visible, setVisible] = useState(true)
    const visibleTimer = useRef(null)
    const location = useLocation()

    useEffect(() => {

        const makeVisibleWrapper = (e) => {
            console.log('hi makeVisibleWrapper');

            makeVisible({ event: e })
        }

        if (location.pathname === '/auth/frame') {
            setVisible(false)
            window.addEventListener('mousemove', makeVisibleWrapper)
            window.addEventListener('touchstart', makeVisibleWrapper)
        } else {
            setVisible(true)
        }

        return () => {
            window.removeEventListener('mousemove', makeVisibleWrapper)
            window.removeEventListener('touchstart', makeVisibleWrapper)
            clearTimeout(visibleTimer.current)
        }
    }, [location.pathname])

    useEffect(() => {
        if (location.pathname === '/auth/frame') {
            makeVisible({ navIsOpened: opened })
        }
    }, [opened])

    const makeVisible = ({ event, navIsOpened }) => {
        if (visibleTimer.current) clearTimeout(visibleTimer.current)

        let time = 5000
        if (navIsOpened) time = 60000


        setVisible(true)
        visibleTimer.current = setTimeout(() => {
            setVisible(false)
            closeNav()
        }, time)
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

    const toggleNav = () => {
        if (opened) {
            closeNav()
        } else {
            setOpened(true)
            setShowOverlay(true)
        }
    }

    const confirmLogout = () => {
        // title, okText, cancelText, okCallback, cancelCallback

        const logoutCb = () => {
            logout()
            toggle()
            toggleNav()
        }

        const payload = {
            title: tempTexts.Nav_confimLogout,
            okText: tempTexts.Nav_logoutOk,
            cancelText: tempTexts.Nav_logoutCancel,
            okCallback: logoutCb,
            cancelCallBack: toggle
        }

        toggle({ popupType: 'Confirm', payload })
    }

    const tempTexts = {
        Nav_logout: 'Logout',
        Nav_confimLogout: 'Logout?',
        Nav_logoutOk: 'Yes',
        Nav_logoutCancel: 'No'
    }

    return (

        <>
            {!opened ?
                <div onClick={toggleNav} className={`navburger ${visible ? 'visible' : ''} ${componentClass ? componentClass : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div> : ''}

            <div className={`side-nav-overlay ${showOverlay ? 'show' : 'unshow'}`} id={NAV_OVERLAY_ID} onClick={clickOutside}>

                <div className={`side-nav-list ${opened ? 'opened' : 'closed'}`}>
                    <button onClick={toggleNav} className='side-nav-close'>+</button>
                    {links(/*texts*/).map(({ text, heb_text, path, admin, iconType }, idx) => {

                        if (admin && userInfo.role !== 'ADMIN') return ''

                        return (
                            <div onClick={toggleNav} className='side-nav-link' key={text + idx}>
                                <NavLink className='nav-link' to={path}>
                                    <Icon type={iconType} className='side-nav-icon' />
                                    <span>{heb_text || text}</span>
                                </NavLink>
                            </div>
                        )
                    }
                    )}

                    {userInfo.id ?
                        <div onClick={confirmLogout} className='side-nav-link logout'>
                            <Icon type={'logout'} className='side-nav-icon' />
                            <span>{tempTexts.Nav_logout}</span>
                        </div> : ''}
                </div>
            </div>


        </>
    )
}

export default SideNav