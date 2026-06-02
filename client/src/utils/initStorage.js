import { localStorageKeys, intervalUnits, transitionTypes, lngCodes } from './consts'

const defaults = {
    [localStorageKeys.SLIDE_SHOW_INTERVAL]: '30',
    [localStorageKeys.TRANSITION_TYPE]: transitionTypes.SLIDE,
    [localStorageKeys.INTERVAL_UNIT]: intervalUnits.SECONDS,
    [localStorageKeys.FRAME_APP_STORE]: '{}',
    [localStorageKeys.PLAY_LIST_DATA]: '{}',
    [localStorageKeys.LANGUAGE]: lngCodes.ENGLISH,
}

// Sets default localStorage values for keys that don't exist yet.
// Should be called once on app startup.
export const initStorage = () => {
    Object.entries(defaults).forEach(([key, value]) => {
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, value)
        }
    })
}
