import { createContext } from "react";
import { textService } from "../services/textService";
import { useState } from "react";
import { useEffect } from "react";
import { localStorageKeys, lngCodes } from "../utils/consts";

export const TextContext = createContext({});

export const TextContextProvider = ({ children }) => {
    const [texts, setTexts] = useState({});
    const [lng, setLng] = useState(localStorage.getItem(localStorageKeys.LANGUAGE) || lngCodes.EN)
    const [textLoading, setTextLoading] = useState(true)

    useEffect(() => {
        getTexts()
        document.documentElement.setAttribute('data-lng', lng)
        localStorage.setItem(localStorageKeys.LANGUAGE, lng)
    }, [lng])

    const getTexts = async () => {
        try {
            setTextLoading(true)
            const res = await textService.getTextsByLng({ lng })
            const obj = {}

            res?.data?.forEach(({ component, content }) => {
                obj[component] = content
            });

            setTexts(obj);
        } catch (error) {
            console.log('texts', error)
        } finally {
            setTextLoading(false)
        }
    }

    const setLanguage = (lng) => {
        if (!lng || !Object.values(lngCodes).includes(lng)) return
        setLng(lng)
    }

    return (
        <TextContext.Provider value={{ texts, lng, setLanguage, textLoading }}>
            {children}
        </TextContext.Provider>
    );
}


