import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Welcome from "../../components/Welcome"
import UserAuth from "../../components/Auth/UserAuth"

const PublicRouter = () => {
    const location = useLocation()
    return (
        <Routes>
            {/* <Route path="/" Component={Welcome} /> */}
            <Route path='/user-auth' Component={UserAuth} />
            <Route path="*" element={<Navigate to="/auth/photos" replace />} />
        </Routes>
    )
}

export default PublicRouter