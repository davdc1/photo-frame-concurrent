
import { useContext } from 'react'
import { PopupContext } from '../../Contexts/PopupContext'
import './thumbnail.scss'

const Thumbnail = ({ params: { item } }) => {

    const { toggle } = useContext(PopupContext)

    const prevPopup = () => {
        toggle({ popupType: 'PhotoPrev', payload: { id: item.id } })
    }

    return (
        <div className='thumbnail-wrapper' onClick={prevPopup}>
            <div className='thumbnail-img-container'>
                <img className='thumbnail-img' src={item.url} alt='' />
            </div>
            <span className='thumbnail-text' >{item.name_user}</span>
        </div>
    )
}

export default Thumbnail