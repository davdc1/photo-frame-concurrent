import { createContext, useEffect, useMemo, useState } from "react"
import { localStorageKeys } from "../utils/consts"

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
}

export const ThemeContext = createContext({
    theme: THEMES.LIGHT,
    toggleTheme: () => { }
})

export const ThemeContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(THEMES.LIGHT)

    useEffect(() => {
        const saved = localStorage.getItem(localStorageKeys.THEME)
        if (saved) {
            setTheme(saved)
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme(THEMES.DARK)
        } else {
            setTheme(THEMES.LIGHT)
        }
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem(localStorageKeys.THEME, theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT)
    }

    const value = useMemo(() => ({
        theme,
        toggleTheme
    }), [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

