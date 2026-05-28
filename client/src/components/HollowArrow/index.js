import { useContext } from 'react'
import { ThemeContext, THEMES } from '../../Contexts/ThemeContext'
import arrowLight from '../../images/svgs/hollow-arrow-light.svg'
import arrowDark from '../../images/svgs/hollow-arrow-dark.svg'

const HollowArrow = ({ className }) => {

    const { theme } = useContext(ThemeContext)
    const isDark = theme === THEMES.DARK

    return <img src={isDark ? arrowDark : arrowLight} className={className} alt="" />
}

export default HollowArrow
