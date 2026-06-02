import { useContext, useState } from 'react'
import { ThemeContext } from '../../Contexts/ThemeContext'
import { TextContext } from '../../Contexts/TextContext'
import Spinner from '../Spinner'
import InputField from '../InputField'
import Select from '../Select'
import Toggle from '../Toggle'
import { intervalUnits, localStorageKeys, sessionOrderTypes, transitionTypes, lngCodes } from '../../utils/consts'
import './settings.scss'

const Settings = () => {

    const { theme, toggleTheme } = useContext(ThemeContext)
    const { texts, lng, setLanguage, textLoading } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Settings'] || '{}')

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

    const handleLanguage = (option) => {
        setLanguage(option.value)
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

    return (
        <div className='settings-wrapper'>

            <div className='settings-box'>
                <h1>{compTexts.Settings_title}</h1>

                <div className='slide-show-interval'>

                    <InputField label={compTexts.Settings_slideShowInterval}>
                        <div className='slide-show-interval-inner'>
                            <input inputMode='numeric' id='slideShowInterval' value={slideShowInterval} onChange={handleInput} onBlur={handleBlur} />
                            <Select
                                options={Object.keys(intervalUnits).map((unit) => ({
                                    value: intervalUnits[unit],
                                    text: compTexts[`Settings_${unit.toLowerCase()}`] ?
                                        `${compTexts[`Settings_${unit.toLowerCase()}`]}` : `${unit.toLowerCase()}`
                                }))}
                                value={intervalUnit}
                                callback={handleIntervalUnit}
                                noDefault={true}
                            />
                        </div>
                    </InputField>

                </div>

                <div className='transition-type'>

                    <InputField label={compTexts.Settings_transitionType}>
                        <Select
                            options={Object.keys(transitionTypes).map((type) => ({
                                value: transitionTypes[type],
                                text: compTexts[`Settings_${type.toLowerCase()}`] ?
                                    `${compTexts[`Settings_${type.toLowerCase()}`]}` : `${type.toLowerCase()}`
                            }))}
                            value={transitionType}
                            callback={handleTransitionType}
                            noDefault={true}
                        />
                    </InputField>
                </div>

                <div className='session-order'>
                    <InputField label={compTexts.Settings_sessionOrder}>
                        <Select
                            options={Object.keys(sessionOrderTypes).map((type) => ({
                                value: sessionOrderTypes[type],
                                text: compTexts[`Settings_${type.toLowerCase()}`] ?
                                    `${compTexts[`Settings_${type.toLowerCase()}`]}${type === sessionOrderTypes.RANDOM ? ` ${compTexts.Settings_randomRemark}` : ''}` :
                                    `${type.toLowerCase()}`
                            }))}
                            value={sessionOrder}
                            callback={handleSessionOrder}
                            noDefault={true}
                        />
                    </InputField>
                </div>

                <div className='apps-language'>
                    <InputField
                        label={<span> {compTexts.Settings_appLanguage} {textLoading ? <Spinner className={'language-spinner'} name="spinner" /> : ''} </span>}
                    >
                        <Select
                            options={Object.keys(lngCodes).map((lng) => ({
                                value: lngCodes[lng],
                                text: compTexts[`Settings_${lng.toLowerCase()}`] ?
                                    `${compTexts[`Settings_${lng.toLowerCase()}`]}` : `${lng.toLowerCase()}`
                            }))}
                            value={lng}
                            callback={handleLanguage}
                            noDefault={true}
                        />
                    </InputField>
                </div>

                <div className='theme-toggle'>
                    <Toggle
                        label={compTexts.Settings_themeToggle}
                        value={theme}
                        modes={[{ value: 'light', text: compTexts.Settings_light }, { value: 'dark', text: compTexts.Settings_dark }]}
                        onChange={handleThemeToggle}
                    />
                </div>

                <button className='save-button' disabled={Object.values(changed).every((value) => !value)} onClick={saveSettings}>{compTexts.Settings_saveButton}</button>
            </div>
        </div>
    )
}

export default Settings
