import { NavLink } from "react-router-dom"
import Icon from "../../Icon"
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation"

const SideNavLink = ({ text, iconType, heb_text, path, toggleNav }) => {

    const { ref } = useFocusable()

    return (
        <div onClick={toggleNav} className='side-nav-link'>
            <NavLink className='nav-link' to={path} ref={ref}>
                <Icon type={iconType} className='side-nav-icon' />
                <span>{heb_text || text}</span>
            </NavLink>
        </div>
    )
}

export default SideNavLink