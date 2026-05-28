import { useContext, useState } from 'react'
import { intervalUnits, localStorageKeys, sessionOrderTypes, transitionTypes } from '../../utils/consts'
import InputField from '../InputField'
import Select from '../Select'
import Toggle from '../Toggle'
import ThemeContext from '../../Contexts/ThemeContext'
import './settings.scss'

const Settings = () => {

    const { theme, toggleTheme } = useContext(ThemeContext)

    const [slideShowInterval, setSlideShowInterval] = useState(localStorage.getItem(localStorageKeys.SLIDE_SHOW_INTERVAL) || 30)
    const [transitionType, setTransitionType] = useState(localStorage.getItem(localStorageKeys.TRANSITION_TYPE) || 'slide')
    const [intervalUnit, setIntervalUnit] = useState(localStorage.getItem(localStorageKeys.INTERVAL_UNIT) || intervalUnits.SECONDS)
    const [sessionOrder, setSessionOrder] = useState(localStorage.getItem(localStorageKeys.SESSION_ORDER) || sessionOrderTypes.SEQUENTIAL)
    const [changed, setChanged] = useState({ slideShowInterval: false, transitionType: false, intervalUnit: false, sessionOrder: false })


    const handleInput = (e) => {
        let { value } = e.target
        value = value.replace(/[^0-9]/g, '')
        if (intervalUnit !== intervalUnits.HOURS && Number(value) > 59) {
            value = 59
        }

        setSlideShowInterval(value)
        setChanged((state) => ({ ...state, slideShowInterval: true }))
    }

    const handleBlur = (e) => {
        let { value } = e.target
        if (!value || Number(value) === 0) {
            value = intervalUnit === intervalUnits.SECONDS ? '8' : '1'
        } else if (intervalUnit === intervalUnits.SECONDS && Number(value) < 8) {
            value = '8'
        }
        setSlideShowInterval(value)
        setChanged((state) => ({ ...state, slideShowInterval: true }))
    }

    const handleTransitionType = (option) => {
        setTransitionType(option.value)
        setChanged((state) => ({ ...state, transitionType: true }))
    }

    const handleIntervalUnit = (option) => {
        setIntervalUnit(option.value)
        setChanged((state) => ({ ...state, intervalUnit: true }))
    }

    const handleSessionOrder = (option) => {
        setSessionOrder(option.value)
        setChanged((state) => ({ ...state, sessionOrder: true }))
    }

    const handleThemeToggle = () => {
        toggleTheme()
    }

    const saveSettings = () => {
        localStorage.setItem(localStorageKeys.SLIDE_SHOW_INTERVAL, slideShowInterval)
        localStorage.setItem(localStorageKeys.TRANSITION_TYPE, transitionType)
        localStorage.setItem(localStorageKeys.INTERVAL_UNIT, intervalUnit)
        localStorage.setItem(localStorageKeys.SESSION_ORDER, sessionOrder)

        setChanged((state) => {
            const newState = { ...state }
            Object.keys(newState).forEach((key) => {
                newState[key] = false
            })
            return newState
        })
    }

    const tempContent = {
        Settings_title: 'Settings',
        Settings_slideShowInterval: 'Slide Show Interval',
        Settings_transitionType: 'Transition Type',
        Settings_intervalUnit: 'Interval Unit',
        Settings_sessionOrder: 'Slideshow Order',
        Settings_randomRemark: '(does not apply to playlists/albums)',
        Settings_themeToggle: 'Theme',
        Settings_saveButton: 'Save'
    }

    return (
        <div className='settings-wrapper'>

            <div className='settings-box'>
                <h1>{tempContent.Settings_title}</h1>

                <div className='slide-show-interval'>

                    <InputField label={tempContent.Settings_slideShowInterval}>
                        <div className='slide-show-interval-inner'>
                            <input inputMode='numeric' id='slideShowInterval' value={slideShowInterval} onChange={handleInput} onBlur={handleBlur} />
                            <Select
                                options={Object.keys(intervalUnits).map((unit) => ({
                                    value: intervalUnits[unit],
                                    text: unit.toLowerCase()
                                }))}
                                value={intervalUnit}
                                callback={handleIntervalUnit}
                                noDefault={true}
                            />
                        </div>
                    </InputField>

                </div>

                <div className='transition-type'>

                    <InputField label={tempContent.Settings_transitionType}>
                        <Select
                            options={Object.keys(transitionTypes).map((type) => ({
                                value: transitionTypes[type],
                                text: type.toLowerCase()
                            }))}
                            value={transitionType}
                            callback={handleTransitionType}
                            noDefault={true}
                        />
                    </InputField>
                </div>

                <div className='session-order'>
                    <InputField label={tempContent.Settings_sessionOrder}>
                        <Select
                            options={Object.keys(sessionOrderTypes).map((type) => ({
                                value: sessionOrderTypes[type],
                                text: `${type.toLowerCase()} ${type === sessionOrderTypes.RANDOM ? tempContent.Settings_randomRemark : ''}`
                            }))}
                            value={sessionOrder}
                            callback={handleSessionOrder}
                            noDefault={true}
                        />
                    </InputField>
                </div>

                <div className='theme-toggle'>
                    <Toggle label={tempContent.Settings_themeToggle} value={theme} modes={['light', 'dark']} onChange={handleThemeToggle} />
                </div>

                <button className='save-button' disabled={Object.values(changed).every((value) => !value)} onClick={saveSettings}>{tempContent.Settings_saveButton}</button>
            </div>
        </div>
    )
}

export default Settings
