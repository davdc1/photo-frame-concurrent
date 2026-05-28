import { useContext } from 'react'
import { ThemeContext, THEMES } from '../../Contexts/ThemeContext'
import spinnerLight from '../../images/svgs/spinner-light.svg'
import spinnerDark from '../../images/svgs/spinner-dark.svg'



const Spinner = ({ className }) => {

    const { theme } = useContext(ThemeContext)
    const isDark = theme === THEMES.DARK

    return <img src={isDark ? spinnerDark : spinnerLight} className={className} alt="Spinner" />
}

export default Spinner
