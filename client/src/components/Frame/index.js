
import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { photoService } from '../../services/photoService'
import spinner from '../../images/svgs/spinner.svg'
import './frame.scss'



// import testImg from '../../images/DSC_1978.JPG'  // src/images/DSC_1978.JPG


const AS_URL = true
const SLIDE_SHOW_INTERVAL = 8000 // should be set by user


// these should be saved on localStorage:
// const temp_playlist = {
//     1: 1,
//     2: 2,
//     3: 3
// }

// let temp_current_playlist_album = 1
// let temp_play_next_album = 2


// ///////////////
// localStorage.setItem('playListData', JSON.stringify({ playlist: temp_playlist }))
// ///////////////





const Frame = () => {

    const [sessionId, setSessionId] = useState(null)
    const [intervalId, setIntervalId] = useState()
    const [images, setImages] = useState([])
    const [imageUrls, setImageUrls] = useState([])
    const [imgClass, setImgClass] = useState({ first: '', second: '' })
    const [go, setGo] = useState(true)
    const [showKeys, setShowKeys] = useState(true)
    const [loading, setLoading] = useState(false)
    const [circling, setCircling] = useState(false)
    
    const { userInfo } = useContext(AuthContext)
    const imageUrlsRef = useRef(imageUrls)
    const intervalRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    
    useEffect(() => {
        init()
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (sessionId) {
            getFive()
            // fillQue()
            // startCycle()
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
        if (AS_URL) {
            if (imageUrls.length < 5)  fillQue()
        } else {
            if (images.length < 5)  fillQue()
        }
    }, [imageUrls.length, images.length])

    const init = () => {
        const { playlist } = JSON.parse(localStorage.getItem('playListData') || '{}')
        const session_id = localStorage.getItem('photoSessionId')
        const sessionType = location.state?.sessionType
        
        if (sessionType === 'all_photos') {
            newSession()
        } else if (sessionType === 'playlist') {
            console.log('plylist');
            newSession({ album_id: Object.values(playlist)[0] })
        } else if (session_id) {
            console.log('saved session:', session_id);
            photoService.retrieveSession({ session_id, user_id: userInfo.id })
            .then((res) => {
                if (res.status === 200) {
                    setSessionId(res.data.id)
                } else if (res.status === 201) {
                    navigate('/auth/start-show')
                }
            })
        } else {
            navigate('/auth/start-show')
        }
    }

    const getFive = () => {
        return getAPhoto(true)
        .then(() => getAPhoto(true))
        .then(() => getAPhoto(true))
        .then(() => getAPhoto(true))
        .then(() => getAPhoto(true))
        .then(() => startCycle())
    }

    const startCycle = async () => {
        const interval = SLIDE_SHOW_INTERVAL // should be dynamic.
        // if (!intervalId) {
        //     console.log('startCycle. sessionId:', sessionId);
        //     setIntervalId(setInterval(makeTheShift, interval))
        // }

        if (!intervalRef.current) {
            console.log('startCycle. sessionId:', sessionId);
            intervalRef.current = setInterval(makeTheShift, interval)
        }
    }

    const stopCycle = () => {
        // clearInterval(intervalId)
        // setIntervalId(null)
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const newSession = async (obj) => {

        console.log('newSession');
        return photoService.newSession({ user_id: userInfo.id, album_id: obj?.album_id })
        .then((res) => {
            console.log('newSession res', res.data.id);
            setSessionId(res.data.id)
            localStorage.setItem('photoSessionId', res.data.id)
            if (location.state?.sessionType) {
                console.log('REPLACING STATE');
                navigate(location.pathname, { replace: true, state: {} })
            }
        })

    }

    const getPlayListData = () => {
        return JSON.parse(localStorage.getItem('playListData') || "{}")
    }

    const updatePlayListData = ({ key, value }) => {
        let obj = JSON.parse(localStorage.getItem('playListData') || "{}")
        obj[key] = value
        localStorage.setItem('playListData', JSON.stringify(obj))
    }

    const onLastInAlbum = () => {
        
        let playListData = getPlayListData()

        if (!playListData.playlist) return

        let orderKeys = Object.keys(playListData.playlist || "{}").sort((a, b) => a - b)
        let play_next_album = orderKeys.find((num) => num > playListData.current_playlist_album)

        if (!play_next_album) {
            play_next_album = orderKeys[0]
        }

        updatePlayListData({ key: 'play_next_album', value: play_next_album || "" })
    }

    const getAPhoto = async (loadingFive) => {
        
        let album_id
        let playListData = getPlayListData()

        // sketch:
        if (!playListData.all_photos && playListData?.play_next_album) {
            album_id = playListData.playlist[playListData.play_next_album]
            updatePlayListData({ key: 'current_playlist_album', value: playListData.play_next_album })
            updatePlayListData({ key: 'play_next_album', value: null })
        }
        
        return photoService.getSessionPhoto({ session_id: sessionId, user_id: userInfo.id, album_id })

        .then((res) => {

            if (res.data.last_in_album) {
                onLastInAlbum()
            }

            if (!AS_URL) {
                console.log('resss', res);
    
                // const { meta, image } = res.data
                
                const base64 = btoa(
                    new Uint8Array(res.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                    )
                );
                const imageUrl = `data:image/jpeg;base64,${base64}`;
                const image = new Image()
                image.src = imageUrl
                // setOneImage(imageUrl)
                setImages((state) => {
                    
                    // if(state.length > 5) {
                    //     console.log('shift 1');
                    //     state.shift()
                    // }
                    // return state.push(imageUrl)
                    // return [...state, imageUrl]
                    return [...state, image]
    
                });
            } else {
                console.log('photo data', res.data);
                setImageUrls((state) => ([...state, res.data.url]))
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

        console.log('shift');
        // getAPhoto()

        if (imageUrlsRef.current.length > 1) {
            setLoading(false)
            
            setImgClass({ first: 'fade-out', second: 'fade-in' })
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
            }, 3700)
        } else if (manualShift) {
            console.log('que is empty');
            fillQue()
            setLoading(true)
        }
        
    }

    const fillQue = () => {

        console.log('FILLL_QUE');
    
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
                    } ,retryInterval)

                    if (retryInterval < 60000) retryInterval *= 1.5
                    else retryInterval += 60000

                })
            } else {
                setCircling(false)
            }
        }

        if (sessionId && !circling) getAPhotoCircle()

    }

    



    // interval 2.0:

    // get five.
    // get-one: only gets one and pushs it array
    // interval- makes the shift every [interval] seconds
    // .then --> get-one

    // only shift if array has more to go,
    // deal with connection errors: keep trying on increasing/constant interval

    // what else ?


    

    return (
        <div className='frame-wrapper'>

            {/* image files: */}
            {/* {images[0] && <img src={images[0].src} alt='' className={`frame-image`} />} */}

            <div className='container' >

                {/* as file: */}
                {!AS_URL ? (
                    images.slice(0, 2).map((image, idx) => (
                    <div className={`image-wrapper-type-3 ${idx === 0 ? imgClass.first + ' first' : imgClass.second + ' second'}`} key={idx.toString()}>
                        
                       <img className={`image-type-3`} src={image.src} alt='' />
                    </div>
                ))
                ) : (
                    imageUrls.slice(0, 2).map((url, idx) => (
                    <div className={`image-wrapper-type-3 ${idx === 0 ? imgClass.first + ' first' : imgClass.second + ' second'}`} key={idx.toString()}>
                        
                       {/* <img className={`image-type-3`} src={`${process.env.REACT_APP_API_URL}/${url}`} /> */}
                       <img className={`image-type-3`} src={`${url}`} />

                    </div>
                )))}
            </div>

            {loading ? <img src={spinner} className='empty-que-spinner' /> : ''}

            
            {showKeys ?
                <div className='frame-key-container'>
                    <button className='go-button' onClick={toggleGo}>{go ? 'stop' : 'go'}</button>
                    <button onClick={() => makeTheShift(true)}>shift</button>
                </div> : ''}

        
        </div>
    )
}

export default Frame