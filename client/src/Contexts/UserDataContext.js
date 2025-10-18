import { createContext, useMemo, useState } from "react"
import { photoService } from "../services/photoService"

export const UserDataContext = createContext({
    userAlbums: null,
    getUserAlbums: () => {}
})

export const UserDataContextProvider = ({ children }) => {

    const [userAlbums, setUserAlbums] = useState(null)

    const getUserAlbums = (user_id) => {
        // api call
        // .then
        // setUserAlbums

        photoService.getUserAlbums({ user_id })
        .then((res) => {
            console.log('user albumds context', res.data);
            // setUserAlbums(res.data)
        })

    }

    const value = useMemo(() => ({
        userAlbums,
        getUserAlbums
    }), [userAlbums])

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    )
}