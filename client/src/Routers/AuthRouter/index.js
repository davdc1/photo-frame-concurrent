import { Route, Routes, Navigate } from "react-router-dom"
import Albums from "../../components/Albums2"
import AllPhotos from "../../components/AllPhotos"
import Frame from "../../components/Frame"
import Settings from "../../components/Settings"
import StartSlideShow from "../../components/StartSlideShow"

const AuthRouter = () => {
    return (
        <Routes>
            <Route path="/start-show" Component={StartSlideShow} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/photos" Component={AllPhotos} />
            <Route path="/frame" Component={Frame} />
            <Route path="/settings" Component={Settings} />
            <Route path="*" element={<Navigate to="/auth/photos" replace />} />
        </Routes>
    )
}

export default AuthRouter