import { useContext } from "react"
import { AuthContext } from "../../Contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"


const ProtectedRoute = ({ children }) => {

    const auth = useContext(AuthContext)
    const location = useLocation()

    return auth.userInfo.id ? (
        children
    ) : (
        <Navigate to='/user-auth' state={{ from: location }} />
    )
}

export default ProtectedRoute