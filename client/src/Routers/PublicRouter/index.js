import { Navigate, Route, Routes } from "react-router-dom"
import Welcome from "../../components/Welcome"
import UserAuth from "../../components/Auth/UserAuth"

const PublicRouter = () => {
    return (
        <Routes>
            <Route path="/" Component={Welcome} />
            <Route path='/user-auth' Component={UserAuth} />
            <Route path="*" element={<Navigate to="/user-auth" replace />} />
        </Routes>
    )
}

export default PublicRouter