import { createContext, useMemo, useState } from "react";

export const PopupContext = createContext({
    popupType: '',
    payload: '',
    toggle: () => {}
})

export const PopupContextProvider = ({ children }) => {
    const [popupType, setPopupType] = useState('')
    const [payload, setPayload] = useState('')

    const toggle = (data) => {
        if (!data?.popupType) {
            setPopupType('')
            setPayload('')
        } else {
            setPopupType(data.popupType)
            setPayload(data.payload || '')
        }
    }

    const value = useMemo(() => ({
        popupType,
        payload,
        toggle
    }), [popupType, payload])

    return (
        <PopupContext.Provider value={value}>
            {children}
        </PopupContext.Provider>
    )
}
