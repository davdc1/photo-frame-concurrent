import { Route, Routes } from "react-router-dom"
import AuthRouter from "../AuthRouter"
import PublicRouter from "../PublicRouter"
// import Login from "../../components/Login"
import ProtectedRoute from "../../components/ProtectedRoute"
import TestPage from "../../components/TestPage"
import ArchyPopup from "../../components/Popups"

const MainRouter = () => {
    console.log('main router');
    return (
        <>
            <ArchyPopup />
            <Routes>
                <Route path="/auth/*" element={<ProtectedRoute><AuthRouter /></ProtectedRoute>} />
                <Route path="/test" Component={TestPage} />
                <Route path="/*" Component={PublicRouter}/>
                {/* <Route path="/ddd" Component={Login} /> */}
            </Routes>
        </>
    )
}

export default MainRouter