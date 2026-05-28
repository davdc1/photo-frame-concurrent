import { Route, Routes } from "react-router-dom"
import AuthRouter from "../AuthRouter"
import ArchyPopup from "../../components/Popups"
import ProtectedRoute from "../../components/ProtectedRoute"
import PublicRouter from "../PublicRouter"

const MainRouter = () => {
    console.log('main router');
    return (
        <>
            <ArchyPopup />
            <Routes>
                <Route path="/auth/*" element={<ProtectedRoute><AuthRouter /></ProtectedRoute>} />
                <Route path="/*" Component={PublicRouter} />
            </Routes>
        </>
    )
}

export default MainRouter