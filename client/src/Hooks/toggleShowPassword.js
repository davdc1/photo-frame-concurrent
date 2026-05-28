import { useState } from "react"

const MODES = { SHOW: 'text', HIDE: 'password' }

const useTogglePassword = () => {
    const [passwordMode, setPasswordMode] = useState(MODES.HIDE)

    const togglePasswordMode = () => {
        if (passwordMode === MODES.HIDE) {
            setPasswordMode(MODES.SHOW)
        } else {
            setPasswordMode(MODES.HIDE)
        }
    }

    return [passwordMode, togglePasswordMode]
}

export default useTogglePassword