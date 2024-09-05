import { Route, Routes } from "react-router-dom"
import Albums from "../../components/Albums"
import AllPhotos from "../../components/AllPhotos"
import Frame from "../../components/Frame"
import MainMenu from "../../components/MainMenu"
import StartSlideShow from "../../components/StartSlideShow"

const AuthRouter = () => {
    console.log('auth router');
    return (
        <Routes>
            <Route path="/main-menu" Component={MainMenu} />
            <Route path="/start-show" Component={StartSlideShow} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/photos" Component={AllPhotos} />
            <Route path="/frame" Component={Frame} />
        </Routes>
    )
}

export default AuthRouter