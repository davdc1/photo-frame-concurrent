import { useEffect, useState, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from '../Icon'
import './bottom-nav.scss'

const BottomNav = ({ links }) => {

    const [show, setShow] = useState(false)
    const visibleTimer = useRef(null)
    const location = useLocation()

    const bottomNavLinks = links().filter(link => link.bottomNav)

    useEffect(() => {

        const makeVisibleWrapper = (e) => {
            makeVisible({ event: e, time: 5000 })
        }

        if (location.pathname === '/auth/frame') {
            setShow(false)
        } else if (!bottomNavLinks.find(link => link.path === location.pathname)) {
            setShow(false)
        } else {
            setShow(true)
        }

        return () => {
            window.removeEventListener('mousemove', makeVisibleWrapper)
            window.removeEventListener('touchstart', makeVisibleWrapper)
            clearTimeout(visibleTimer.current)
        }
    }, [location.pathname])

    const makeVisible = ({ event, time }) => {
        if (visibleTimer.current) clearTimeout(visibleTimer.current)
        setShow(true)
        visibleTimer.current = setTimeout(() => {
            setShow(false)
        }, time)
    }

    return show ? (
        <div className="bottom-nav-wrapper">
            <ul className="bottom-nav-list">
                {bottomNavLinks.map(({ text, heb_text, path, iconType }, idx) => (
                    <div className='bottom-nav-link' key={text + idx}>
                        <NavLink to={path} className='nav-link'>
                            <Icon type={iconType} className='bottom-nav-icon' />
                            <span className=''>{heb_text || text}</span>
                        </NavLink>

                    </div>
                ))}
            </ul>
        </div>
    ) : ''
}

export default BottomNav