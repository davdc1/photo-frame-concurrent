import { useState } from 'react'
import Spinner from '../../Spinner'
import './photo-prev.scss'

const MODAL_ID = 'photo-prev-wrapper'

const PhotoPrev = ({ url, data, id, closeCb }) => { // see about that...

    const [loading, setLoading] = useState(true)

    const closeModal = ({ target }) => {
        if (target.id === MODAL_ID) closeCb()
    }

    const onLoad = () => {
        setLoading(false)
    }

    return (
        <div className='photo-prev-wrapper' id={MODAL_ID} onClick={closeModal}>
            <div className='photo-prev-container'>
                {loading ? <Spinner className='photo-prev-spinner' /> : ''}

                <img className='photo-prev-photo' onLoad={onLoad} src={`${process.env.REACT_APP_API_URL}/images/${url}`} alt='' />
            </div>
        </div>
    )
}

export default PhotoPrev