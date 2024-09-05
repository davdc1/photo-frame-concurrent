import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import setAxiosDefaults from "../utils/serviceDefaults";

export const AuthContext = createContext({
    userInfo: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        accessToken: ''
    },
    setUserInfo: () => {}
 })


export const AuthContextProvider = ({ children }) => {

    const [userInfo, setUserInfo] = useState(() => {
        let storedInfo = JSON.parse(localStorage.getItem('frame_app_store' || '{}'))
        if (storedInfo?.id) return storedInfo
        else return (
            {
                id: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                accessToken: ''
            }
        )
    })

    useEffect(() => {
        let { accessToken, ...data } = JSON.parse(localStorage.getItem('frame_app_store') || '{}')
        if (accessToken) {
            console.log('HI', { accessToken, ...data });
            setUserInfo((state) => ({ accessToken, ...data }))
            setAxiosDefaults(accessToken)
        }
    }, [])

    const login = async ({ email, password }) => {

        return authService.login({ email, password })
        .then((res) => {
            console.log('res.data1111', res.data);
            const { accessToken, refreshToken, accessExpiration } = res.data
            localStorage.setItem('frame_app_store', JSON.stringify({ accessToken, refreshToken, accessExpiration, ...res.data }))
            setUserInfo((state) => ({ ...state, ...res.data }))
            setAxiosDefaults(res.data?.accessToken)
        })
        .catch((error) => {
            console.log('login error11111', error);
        })
    }

    const refreshAccessToken = () => {
        const { refreshToken } = JSON.parse(localStorage.getItem('frame_app_store') || '{}')
        authService.refreshAccessToken({ refreshToken, userId: userInfo.id })
        .then((res) => {
            const { accessToken, refreshToken, accessExpiration } = res.data
            localStorage.setItem('frame_app_store', JSON.stringify({ accessToken, refreshToken, accessExpiration }))
            setUserInfo((state) => ({ ...state, ...res.data.accessToken }))
            setAxiosDefaults(accessToken)
        })
        .catch((error) => {

        })
    }

    const value = {
        userInfo,
        // setUserInfo, // ???

        login,
        refreshAccessToken
    }

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    )
 }
