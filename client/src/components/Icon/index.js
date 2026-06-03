import { useContext } from 'react'
import { ThemeContext, THEMES } from '../../Contexts/ThemeContext'

import photosLight from '../../images/svgs/photos-light.svg'
import photosDark from '../../images/svgs/photos-dark.svg'
import albumsLight from '../../images/svgs/albums-light.svg'
import albumsDark from '../../images/svgs/albums-dark.svg'
import settingsLight from '../../images/svgs/settings-light.svg'
import settingsDark from '../../images/svgs/settings-dark.svg'
import slideShowLight from '../../images/svgs/slide-show-light.svg'
import slideShowDark from '../../images/svgs/slide-show-dark.svg'
import spinnerLight from '../../images/svgs/spinner-light.svg'
import spinnerDark from '../../images/svgs/spinner-dark.svg'
import hollowArrowLight from '../../images/svgs/hollow-arrow-light.svg'
import hollowArrowDark from '../../images/svgs/hollow-arrow-dark.svg'
import fullScreen from '../../images/svgs/full-screen.svg'
import exitFullScreen from '../../images/svgs/exit-full-screen.svg'
import checkmark from '../../images/svgs/checkmark.svg'
import fail from '../../images/svgs/fail.svg'
import pending from '../../images/svgs/pending.svg'
import expand from '../../images/svgs/expand.svg'
import plusLight from '../../images/svgs/plus-light.svg'
import plusDark from '../../images/svgs/plus-dark.svg'
import hideEyeLight from '../../images/svgs/hide-eye-light.svg'
import hideEyeDark from '../../images/svgs/hide-eye-dark.svg'
import showEyeLight from '../../images/svgs/show-eye-light.svg'
import showEyeDark from '../../images/svgs/show-eye-dark.svg'
import selectLight from '../../images/svgs/select-light.svg'
import selectDark from '../../images/svgs/select-dark.svg'
import checkLight from '../../images/svgs/check-light.svg'
import checkDark from '../../images/svgs/check-dark.svg'
import logoutLight from '../../images/svgs/logout-light.svg'
import logoutDark from '../../images/svgs/logout-dark.svg'
import chooseLight from '../../images/svgs/choose-light.svg'
import chooseDark from '../../images/svgs/choose-dark.svg'
import trashLight from '../../images/svgs/trash-light.svg'
import trashDark from '../../images/svgs/trash-dark.svg'

const icons = {
    'photos': { light: photosLight, dark: photosDark },
    'albums': { light: albumsLight, dark: albumsDark },
    'settings': { light: settingsLight, dark: settingsDark },
    'slide-show': { light: slideShowLight, dark: slideShowDark },
    'spinner': { light: spinnerLight, dark: spinnerDark },
    'hollow-arrow': { light: hollowArrowLight, dark: hollowArrowDark },
    'full-screen': { general: fullScreen },
    'exit-full-screen': { general: exitFullScreen },
    'checkmark': { general: checkmark },
    'fail': { general: fail },
    'pending': { general: pending },
    'expand': { general: expand },
    'plus': { light: plusLight, dark: plusDark },
    'hide-eye': { light: hideEyeLight, dark: hideEyeDark },
    'show-eye': { light: showEyeLight, dark: showEyeDark },
    'select': { light: selectLight, dark: selectDark },
    'check': { light: checkLight, dark: checkDark },
    'logout': { light: logoutLight, dark: logoutDark },
    'choose': { light: chooseLight, dark: chooseDark },
    'trash': { light: trashLight, dark: trashDark }
}

const Icon = ({ type, className = '' }) => {

    const { theme } = useContext(ThemeContext)
    const mode = theme === THEMES.DARK ? 'dark' : 'light'
    const src = icons[type]?.[mode] || icons[type]?.general || icons[type]?.light || icons[type]?.dark

    if (!src) return null

    return <img src={src} alt={type} className={className} />
}

export default Icon
