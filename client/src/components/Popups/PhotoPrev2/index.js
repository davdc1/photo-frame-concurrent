import { useContext, useEffect, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import spinner from '../../../images/svgs/spinner.svg'
import './photo-prev.scss'
import { photoService } from '../../../services/photoService'
import { AuthContext } from '../../../Contexts/AuthContext'

const IMAGE_STATUS = { LOADING: 'LOADING', READY: 'READY', FAILED: 'FAILED' }

const PhotoPrev = () => { 

    const { payload } = useContext(PopupContext)
    const { userInfo } = useContext(AuthContext)

    const [loading, setLoading] = useState(IMAGE_STATUS.LOADING) // loading | ready | failed
    const [url, setUrl] = useState(null)

    console.log('payload', payload);


    useEffect(() => {
        getUrl()
    }, [])

    const getUrl = () => {
        
        photoService.getPhotopPrev({ photo_id: payload.id, user_id: userInfo.id })
            .then((res) => {
                console.log('res prev', res.data);
                // setLoading(false)

                setUrl(res.data.url)
            })
            
    }
    
    const onLoad = () => {
        console.log('LOADDDD');
        setLoading(IMAGE_STATUS.READY)
    }

    return (
        <div className='photo-prev-container' >
            {loading !== IMAGE_STATUS.READY ? <img className='photo-prev-spinner' src={spinner} /> : ''}
            <img className={`photo-prev-photo ${loading === IMAGE_STATUS.READY ? 'ready' : ''}`} onLoad={onLoad} src={url} alt='' />
        </div>
        
    )
}

export default PhotoPrev