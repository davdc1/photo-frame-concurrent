
import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { photoService } from '../../services/photoService'
import { TextContext } from '../../Contexts/TextContext'
import { intervalUnits, localStorageKeys, playListDataKeys, sessionOrderTypes, transitionClasses, transitionTypes, unitToSeconds } from '../../utils/consts'
import exitFullScreen from '../../images/svgs/exit-full-screen.svg'
import enterFullScreen from '../../images/svgs/full-screen.svg'
import Spinner from '../Spinner'
import './frame.scss'

const AS_URL = true

const Frame = () => {

    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Frame'] || '{}')

    const [noPhotos, setNoPhotos] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const [images, setImages] = useState([])
    const [imageUrls, setImageUrls] = useState([])
    const [imgClass, setImgClass] = useState({ first: '', second: '' })
    const [go, setGo] = useState(true)
    const [showKeys, setShowKeys] = useState(false)
    const [loading, setLoading] = useState(false)
    const [circling, setCircling] = useState(false)
    const [transitionType, setTransitionType] = useState()
    const [fullScreen, setFullScreen] = useState(false)
    const [canFullscreen, setCanFullscreen] = useState(false)

    const imageUrlsRef = useRef(imageUrls)
    const intervalRef = useRef(null)
    const showKeysTimerRef = useRef(null)
    const queIdCounter = useRef(0)
    const isFetchingInitial = useRef(false) // true while getFive() is running; suppresses fillQue

    const location = useLocation()
    const navigate = useNavigate()

    const noPhotosFocus = useFocusable()
    const goStopFocus = useFocusable()
    const fullscreenFocus = useFocusable()

    useEffect(() => {
        init()

        setCanFullscreen(
            document.fullscreenEnabled &&
            typeof document.documentElement.requestFullscreen === "function"
        )

        window.addEventListener('mousedown', keepKeys)
        window.addEventListener('touchstart', keepKeys)

        return async () => {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            }

            window.removeEventListener('mousedown', keepKeys)
            window.removeEventListener('touchstart', keepKeys)

            stopCycle()
        }

    }, [])

    useEffect(() => {
        if (sessionId) {
            getFive()
        }
    }, [sessionId])

    useEffect(() => {
        if (AS_URL) {
            imageUrlsRef.current = imageUrls
        } else {
            imageUrlsRef.current = images
        }
    }, [imageUrls, images])

    useEffect(() => {
        if (isFetchingInitial.current) return // getFive() is running; don't race it
        if (AS_URL) {
            if (imageUrls.length < 5) fillQue()
        } else {
            if (images.length < 5) fillQue()
        }
    }, [imageUrls.length, images.length])

    const toggleFullscreen = () => {
        if (fullScreen) {
            document.exitFullscreen()
            setFullScreen(false)
        } else {
            document.documentElement.requestFullscreen()
                .then(() => {
                    setFullScreen(true)
                })
                .catch((error) => {
                    console.log('error', error);
                })
        }
    }

    const keepKeys = () => {
        if (showKeysTimerRef.current) clearTimeout(showKeysTimerRef.current)

        setShowKeys(true)
        showKeysTimerRef.current = setTimeout(() => {
            setShowKeys(false)
        }, 6000)
    }

    const init = async () => {
        const { playlist } = getPlayListData()
        const session_id = localStorage.getItem(localStorageKeys.PHOTO_SESSION_ID)
        const sessionType = location.state?.sessionType
        const transitionType = localStorage.getItem(localStorageKeys.TRANSITION_TYPE)

        let count = await getUserPhotoCount()
        if (count === 0) {
            setNoPhotos(true)
            return
        }

        setTransitionType(transitionType)

        if (sessionType === 'all_photos') {
            newSession()
        } else if (sessionType === 'playlist') {
            newSession({ album_id: Object.values(playlist)[0] })
        } else if (session_id) {
            photoService.retrieveSession({ session_id })
                .then((res) => {
                    if (res.status === 200) {
                        setSessionId(res.data.id)
                    } else if (res.status === 201) { // session not found
                        navigate('/auth/start-show')
                    }
                })
        } else {
            navigate('/auth/start-show')
        }
    }

    const getUserPhotoCount = async () => {
        try {
            const res = await photoService.getUserPhotoCount()

            return res.data.count
        } catch (error) {
            console.log(error)
        }
    }

    const getFive = () => {
        isFetchingInitial.current = true
        // Sequential fetches to prevent concurrent server session cursor races
        return getAPhoto()
            .then(() => getAPhoto())
            .then(() => getAPhoto())
            .then(() => getAPhoto())
            .then(() => getAPhoto())
            .then(() => {
                isFetchingInitial.current = false
                return startCycle()
            })
            .catch((err) => {
                isFetchingInitial.current = false
                return Promise.reject(err)
            })
    }

    const getSlideShowInterval = () => {
        let interval = localStorage.getItem(localStorageKeys.SLIDE_SHOW_INTERVAL) || 30
        interval = 1000 * interval * unitToSeconds[localStorage.getItem(localStorageKeys.INTERVAL_UNIT) || intervalUnits.SECONDS]
        return interval
    }

    const startCycle = async () => {
        const interval = getSlideShowInterval()

        if (!intervalRef.current) {
            intervalRef.current = setInterval(makeTheShift, interval)
        }
    }

    const stopCycle = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const newSession = async (obj) => {
        return photoService.newSession({ album_id: obj?.album_id })
            .then((res) => {
                setSessionId(res.data.id)
                localStorage.setItem(localStorageKeys.PHOTO_SESSION_ID, res.data.id)
                if (location.state?.sessionType) {
                    navigate(location.pathname, { replace: true, state: {} })
                }
            })
    }

    const getPlayListData = () => {
        return JSON.parse(localStorage.getItem(localStorageKeys.PLAY_LIST_DATA) || "{}")
    }

    const updatePlayListData = ({ key, value }) => {
        let obj = getPlayListData()
        obj[key] = value
        localStorage.setItem(localStorageKeys.PLAY_LIST_DATA, JSON.stringify(obj))
    }

    const onLastInAlbum = () => {

        let playListData = getPlayListData()

        if (!playListData.playlist) return

        let orderKeys = Object.keys(playListData.playlist || {}).sort((a, b) => a - b)
        let play_next_album = orderKeys.find((num) => num > playListData.current_playlist_album)

        if (!play_next_album) {
            play_next_album = orderKeys[0]
        }

        updatePlayListData({ key: playListDataKeys.PLAY_NEXT_ALBUM, value: play_next_album || "" })
    }

    const getAPhoto = async () => {

        let album_id
        let playListData = getPlayListData()

        if (!playListData?.all_photos && playListData?.play_next_album) {
            album_id = playListData.playlist[playListData.play_next_album]
            updatePlayListData({ key: playListDataKeys.CURRENT_PLAYLIST_ALBUM, value: playListData.play_next_album })
            updatePlayListData({ key: playListDataKeys.PLAY_NEXT_ALBUM, value: null })
        }

        let random = localStorage.getItem(localStorageKeys.SESSION_ORDER) === sessionOrderTypes.RANDOM ? 'random' : null

        return photoService.getSessionPhoto({ session_id: sessionId, album_id, random })

            .then((res) => {

                if (res.data.last_in_album) {
                    onLastInAlbum()
                }

                if (!AS_URL) {

                    const base64 = btoa(
                        new Uint8Array(res.data).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    );
                    const imageUrl = `data:image/jpeg;base64,${base64}`;
                    const image = new Image()
                    image.src = imageUrl
                    setImages((state) => {
                        return [...state, image]
                    });
                } else {
                    setImageUrls((state) => ([...state, { url: res.data.url, id: queIdCounter.current++ }]))
                }
            })
            .catch((error) => {
                console.log('error', error);
                return Promise.reject(error)
            })

    }

    const toggleGo = () => {
        if (go) stopCycle()
        else {
            startCycle()
        }
        setGo((state) => !state)
    }

    const makeTheShift = (manualShift) => {

        if (imageUrlsRef.current.length > 1) {
            const { transitionIn, transitionOut, transitionDelay } = transitionTimes

            setLoading(false)

            setImgClass({ first: transitionClasses[transitionType].OUT, second: transitionClasses[transitionType].IN })
            setTimeout(() => {
                if (AS_URL) {
                    let urls = [...imageUrlsRef.current]
                    urls.shift()
                    setImageUrls(urls)
                } else {
                    let images = [...imageUrlsRef.current]
                    images.shift()
                    setImages(images)
                }
                setImgClass({ first: '', second: '' })
            }, transitionIn + transitionOut + transitionDelay)
        } else if (manualShift) {
            fillQue()
            setLoading(true)
        }

    }

    const fillQue = () => {

        let retryInterval = 2000
        let retryTimeoutId
        const getAPhotoCircle = () => {

            if (imageUrlsRef.current.length < 5) {
                setCircling(true)
                getAPhoto()
                    .then(() => {
                        clearTimeout(retryTimeoutId)
                        return getAPhotoCircle()
                    })
                    .catch(() => {

                        retryTimeoutId = setTimeout(() => {
                            getAPhotoCircle()
                        }, retryInterval)

                        if (retryInterval < 60000) retryInterval *= 1.5
                        else if (retryInterval < 60000 * 60) retryInterval += 60000

                    })
            } else {
                setCircling(false)
            }
        }

        if (sessionId && !circling) getAPhotoCircle()

    }

    const getTransitionTimes = () => {

        let transitionIn
        let transitionOut
        let transitionDelay

        if (transitionType === transitionTypes.FADE) {
            transitionIn = 2200
            transitionOut = 2000
            transitionDelay = 1900
        } else if (window.matchMedia('(max-width: 768px)').matches) {
            transitionIn = 1000
            transitionOut = 1000
            transitionDelay = 999
        } else if (window.matchMedia('(max-width: 1200px)').matches) {
            transitionIn = 1500
            transitionOut = 1500
            transitionDelay = 1499
        } else if (window.matchMedia('(max-width: 1900px)').matches) {
            transitionIn = 2000
            transitionOut = 2000
            transitionDelay = 1999
        } else {
            transitionIn = 2500
            transitionOut = 2500
            transitionDelay = 2499
        }

        return { transitionIn, transitionOut, transitionDelay }
    }

    let transitionTimes = getTransitionTimes()


    return (
        <div className='frame-wrapper'
            style={{
                '--transition-delay': `${transitionTimes.transitionDelay}ms`,
                '--transition-time-in': `${transitionTimes.transitionIn}ms`,
                '--transition-time-out': `${transitionTimes.transitionOut}ms`
            }}
        >

            <div className={`container ${noPhotos ? 'no-photos' : ''}`} >

                {noPhotos ? <div className='no-photos-box'>
                    <h3>{compTexts.Frame_noPhotosLine1}</h3>
                    <NavLink to='/auth/photos' state={{ openUploadModal: true }} ref={noPhotosFocus.ref}>{compTexts.Frame_noPhotosLine2}</NavLink>
                </div> : ''}

                {/* as file: */}
                {!AS_URL ? (
                    images.slice(0, 2).map((image, idx) => (
                        <div className={`image-wrapper-type-3 ${idx === 0 ? imgClass.first + ' first' : imgClass.second + ' second'}`} key={image.src + idx}>
                            <img className={`image-type-3`} src={image.src} alt='' />
                        </div>
                    ))
                ) : (
                    imageUrls.slice(0, 2).map((item, idx) => (
                        <div className={`image-wrapper-type-3 ${idx === 0 ? imgClass.first + ' first' : imgClass.second + ' second'}`} key={item.id}>
                            <img className={`image-type-3`} src={item.url} />
                        </div>
                    )))}
            </div>

            {loading ? <Spinner className='empty-que-spinner' /> : ''}


            {showKeys && !noPhotos ?
                <div className='frame-key-container'>
                    <button className='go-button' onClick={toggleGo} ref={goStopFocus.ref}>{go ? compTexts.Frame_stop : compTexts.Frame_go}</button>
                    {/* <button onClick={() => makeTheShift(true)}>shift</button> */}
                    {canFullscreen ?
                        <button className='frame-full-screen-btn' onClick={toggleFullscreen} ref={fullscreenFocus.ref}>
                            <img src={fullScreen ? exitFullScreen : enterFullScreen} alt='' />
                        </button> : ''}
                </div> : ''}




        </div>
    )
}

export default Frame    