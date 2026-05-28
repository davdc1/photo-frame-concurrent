
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
            <img className='thumbnail-img' src={item.url} alt='' />
        </div>
    )
}

export default Thumbnail