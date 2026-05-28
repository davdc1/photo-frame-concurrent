import { useContext, useEffect, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { AuthContext } from '../../../Contexts/AuthContext'
import { photoService } from '../../../services/photoService'
import Spinner from '../../Spinner'
import './photo-prev.scss'

const IMAGE_STATUS = { LOADING: 'LOADING', READY: 'READY', FAILED: 'FAILED' }

const PhotoPrev = () => { 

    const { payload } = useContext(PopupContext)
    const { userInfo } = useContext(AuthContext)

    const [loading, setLoading] = useState(IMAGE_STATUS.LOADING) // loading | ready | failed
    const [url, setUrl] = useState(null)

    useEffect(() => {
        getUrl()
    }, [])

    const getUrl = () => {
        
        photoService.getPhotopPrev({ photo_id: payload.id, user_id: userInfo.id })
            .then((res) => {
                // setLoading(false)
                setUrl(res.data.url)
            })
            
    }
    
    const onLoad = () => {
        setLoading(IMAGE_STATUS.READY)
    }

    return (
        <div className='photo-prev-container' >
            {loading !== IMAGE_STATUS.READY ? <Spinner className='photo-prev-spinner' /> : ''}
            <img className={`photo-prev-photo ${loading === IMAGE_STATUS.READY ? 'ready' : ''}`} onLoad={onLoad} src={url} alt='' />
        </div>
        
    )
}

export default PhotoPrev