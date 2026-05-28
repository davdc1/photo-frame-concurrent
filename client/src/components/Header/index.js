import { useLocation } from 'react-router-dom'
import Nav from '../Nav'
import { navLinks } from '../../utils/navLinks'
import './header.scss'

const Header = ({ title }) => {
    const { pathname } = useLocation()
    const currentLink = navLinks().find(link => link.path === pathname)
    const pageTitle = currentLink?.heb_text || currentLink?.text || title

    return (
        <header className={`app-header ${pathname === '/auth/frame' ? 'hidden' : ''}`}>
            <Nav links={navLinks} componentClass={"Header"} />
            <h1 className="app-header-title">{pageTitle}</h1>
        </header>
    )
}

export default Header
