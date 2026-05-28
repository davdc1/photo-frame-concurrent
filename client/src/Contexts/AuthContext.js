import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { setAxiosDefaults } from "../utils/serviceDefaults";
import { useNavigate } from "react-router-dom";
import { localStorageKeys } from "../utils/consts";

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
        let storedInfo = JSON.parse(localStorage.getItem(localStorageKeys.FRAME_APP_STORE) || '{}')
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

    const navigate = useNavigate()

    useEffect(() => {
        let { accessToken, ...data } = JSON.parse(localStorage.getItem(localStorageKeys.FRAME_APP_STORE) || '{}')
        if (accessToken) {
            setUserInfo(() => ({ accessToken, ...data }))
            setAxiosDefaults(accessToken)
        }
    }, [])

    const login = async ({ email, password }) => {

        return authService.login({ email, password })
        .then((res) => {
            signUser(res)
        })
        .catch((error) => {
            console.log('login error11111', error);
        })
    }

    const signUser = (res) => {
        localStorage.setItem(localStorageKeys.FRAME_APP_STORE, JSON.stringify({ ...res.data }))
        setUserInfo((state) => ({ ...state, ...res.data }))
        setAxiosDefaults(res.data?.accessToken)

        let playListData = JSON.parse(localStorage.getItem(localStorageKeys.PLAY_LIST_DATA) || '{}')
        if (res.data.id != playListData.userId) {
            // init playListData
            const obj = {
                userId: res.data.id,
                current_playlist_album: '',
                play_next_album: '',
                playlist: {}
            }
        
            localStorage.setItem(localStorageKeys.PLAY_LIST_DATA, JSON.stringify(obj))
        }
    }

    const logout = async () => {
        console.log('logout');

        // api logout (revoke token)
        
        try {
            authService.logout()
        } catch (error) {
            
        }
        
        localStorage.setItem(localStorageKeys.FRAME_APP_STORE, '{}')
        setUserInfo({})

        navigate('/user-auth')        
        
        
    }

    const value = {
        userInfo,
        // setUserInfo,
        signUser,
        login,
        logout,
        // refreshAccessToken
    }

    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    )
 }
