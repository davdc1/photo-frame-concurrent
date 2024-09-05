import { useEffect, useState } from 'react'
import spinner from '../../../images/svgs/spinner.svg'
import './photo-prev.scss'

const MODAL_ID = 'photo-prev-wrapper'

const PhotoPrev = ({ url, data, id, closeCb }) => { // see about that...

    const [loading, setLoading] = useState(true)

    console.log('URURUR?????', `${process.env.REACT_APP_API_URL}/images/${url}`);

   
    
    const closeModal = ({ target }) => {
        if (target.id === MODAL_ID) closeCb()
    }

    const onLoad = () => {
        console.log('LOADDDD');
        setLoading(false)
    }

    return (
        <div className='photo-prev-wrapper' id={MODAL_ID} onClick={closeModal}>
            <div className='photo-prev-container'>
                {loading ? <img className='photo-prev-spinner' src={spinner} /> : ''}
                <img className='photo-prev-photo' onLoad={onLoad} src={`${process.env.REACT_APP_API_URL}/images/${url}`} alt='' />
            </div>
        </div>
    )
}

export default PhotoPrev