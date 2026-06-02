import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { AuthContext } from '../../Contexts/AuthContext'
import { PopupContext } from '../../Contexts/PopupContext'
import { TextContext } from '../../Contexts/TextContext'
import Icon from '../Icon'
import SideNavLink from './SideNavLink'
// import { TextContext } from '../../Contexts/TextContext'
import './nav2.scss'

const NAV_OVERLAY_ID = 'navOverlayId'

const SideNav = ({ links, componentClass }) => {

    const { userInfo, logout } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)
    // const { texts } = useContext(TextContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Nav'] || '{}')
    const [opened, setOpened] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const [visible, setVisible] = useState(true)
    const visibleTimer = useRef(null)
    const location = useLocation()

    const { ref } = useFocusable()

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
            title: compTexts.Nav_confimLogout,
            okText: compTexts.Nav_logoutOk,
            cancelText: compTexts.Nav_logoutCancel,
            okCallback: logoutCb,
            cancelCallBack: toggle
        }

        toggle({ popupType: 'Confirm', payload })
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
                    {links(compTexts).map(({ text, defaultText, path, admin, iconType }, idx) => {

                        if (admin && userInfo.role !== 'ADMIN') return ''

                        const showText = text || defaultText

                        return (
                            <SideNavLink text={showText} path={path} toggleNav={toggleNav} iconType={iconType} key={showText + idx} />
                        )
                    }
                    )}

                    {userInfo.id ?
                        <div onClick={confirmLogout} className='side-nav-link logout' ref={ref}>
                            <Icon type={'logout'} className='side-nav-icon' />
                            <span>{compTexts.Nav_logout}</span>
                        </div> : ''}
                </div>
            </div>


        </>
    )
}

export default SideNav