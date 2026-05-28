import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Contexts/AuthContext'
import { PopupContext } from '../../Contexts/PopupContext'
import { useNavigate } from 'react-router-dom'
import { photoService } from '../../services/photoService'
import { localStorageKeys } from '../../utils/consts'
import Spinner from '../Spinner'
import './start-slide-show2.scss'

const PLAYING_ALBUM = 'PLAYING_ALBUM'
const PLAYING_ALL = 'PLAYING_ALL'
const NO_SESSION = 'NO_SESSION'

const StartSlideShow = () => {

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)

    const [state, setState] = useState(NO_SESSION)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        init()
    }, [])


    const init = () => {
        // get stored session_id
        // if none, set to v1, see below
        // else, validate (retrive session)
        // if ok: set v2
        // else set v1

        // v1: "currently playing all/playlists, would you like to:  (resume, all, playlist)"
        // v2: "would you like to play: (all, playlist)"


        let session_id = JSON.parse(localStorage.getItem(localStorageKeys.PHOTO_SESSION_ID) || "{}")

        if (!session_id) {
            setLoading(false)
            setState(NO_SESSION)
        } else {
            setLoading(() => {

                photoService.retrieveSession({ session_id, user_id: userInfo.id })
                    .then((res) => {
                        if (res.status === 200) {
                            if (res.data.album_id) {
                                setState(PLAYING_ALBUM)
                            } else {
                                setState(PLAYING_ALL)
                            }
                        } else if (res.status === 201) {
                            setState(NO_SESSION)
                        }
                    })
                    .catch(() => { })
                    .finally(() => setLoading(false))

                return true

            })
        }

    }

    const navToFrame = ({ target }) => {
        let { session } = target.dataset

        if (session === 'playlist') {
            toggle({ popupType: 'PlayList' })
        } else if (session === 'all_photos') {
            navigate('/auth/frame', { state: { sessionType: 'all_photos' } })
        } else { // resume
            navigate('/auth/frame')
        }
    }

    const tempContent = {
        StartSlideShow_Title: 'Start Slide Show',
        StartSlideShow_Currently: 'Currently playing',
        StartSlideShow_All: 'all photos',
        StartSlideShow_Playlist: 'playlist',
        StartSlideShow_PromptText: 'Would you like to:',
        StartSlideShow_Resume: 'Resume',
        StartSlideShow_PlayAll: 'Play all photos',
        StartSlideShow_PlayPlaylist: 'Set a playlist',
        StartSlideShow_Or: 'or'
    }

    return (
        <div className='start-show-wrapper'>

            <span className='start-show-title'>{tempContent.StartSlideShow_Title}</span>

            {loading ? (
                <Spinner className='start-show-spinner' />
            ) : (
                <div className='start-show-body'>
                    {[PLAYING_ALBUM, PLAYING_ALL].includes(state) ?
                        <>
                            <span className='start-show-text-1'>
                                {tempContent.StartSlideShow_Currently}
                            </span>
                            <span className='start-show-text-2'>
                                {state === PLAYING_ALBUM ? tempContent.StartSlideShow_Playlist : tempContent.StartSlideShow_All}
                            </span>
                        </> : ''}

                    <span className='start-show-prompt'>
                        {tempContent.StartSlideShow_PromptText}
                    </span>
                    <div className='start-show-buttons'>
                        {[PLAYING_ALBUM, PLAYING_ALL].includes(state) ?
                            <div className='start-show-button-top'>
                                <button
                                    data-session={'resume'}
                                    onClick={navToFrame}
                                    className='start-show-button resume'
                                >
                                    {tempContent.StartSlideShow_Resume}
                                </button>
                                <span className='start-show-or'>{tempContent.StartSlideShow_Or}</span>
                            </div> : ''}
                        <div className='start-show-button-bottom'>
                            <button
                                data-session={'all_photos'}
                                onClick={navToFrame}
                                className='start-show-button all_photos'
                            >
                                {tempContent.StartSlideShow_PlayAll}
                            </button>
                            <button
                                data-session={'playlist'}
                                onClick={navToFrame}
                                className='start-show-button playlist'
                            >
                                {tempContent.StartSlideShow_PlayPlaylist}
                            </button>
                        </div>
                    </div>

                </div>)}

        </div>
    )
}

export default StartSlideShow