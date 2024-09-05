import { Route, Routes } from "react-router-dom"
import Login from "../../components/Login"
import Welcome from "../../components/Welcome"
import TestPage from "../../components/TestPage"

const PublicRouter = () => {
    return (
        <Routes>
            <Route path="/" Component={Welcome} />
            <Route path="/login" Component={Login} />
            <Route path ="/test" element={<TestPage />} />
        </Routes>
    )
}

export default PublicRouter