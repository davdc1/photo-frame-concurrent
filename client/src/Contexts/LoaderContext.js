import { createContext, useMemo, useState } from "react";

export const LoaderContext = createContext()

export const LoaderContextProvider = ({ children }) => {
    const [show, setShow] = useState(false)

    const setLoader = (val) => {
        setShow(!!val)
    }

    const value = useMemo(() => ({
        show,
        setLoader
    }), [show])

    return (
        <LoaderContext.Provider value={value}>
            {children}
        </LoaderContext.Provider>
    )
}



