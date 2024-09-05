
import { useContext } from 'react'
import { PopupContext } from '../../Contexts/PopupContext'
import './thumbnail-select.scss'

const ThumbnailSelect = ({ params: { item, onSelectItem, selected, deleteLoading } }) => {

    const { toggle } = useContext(PopupContext)

    const prevPopup = () => {
        toggle({ popupType: 'PhotoPrev', payload: { id: item.id } })
    }

    return (
        <div
            className={`thumbnail-select-wrapper ${deleteLoading ? 'disabled' : ''}`}
            data-photoid={item.id}
            onClick={deleteLoading ? null : onSelectItem}
        >
            <button onClick={prevPopup}>{"OPEN"}</button>
            <div className='thumbnail-select-img-container'>
                <img className='thumbnail-select-img' src={item.url} alt='' />
            </div>
            <span className='thumbnail-select-text' >{item.name_user}</span>
            <div className={`thumbnail-select-check ${selected[item.id] ? 'selected' : ''}`}></div>
        </div>
    )
}

export default ThumbnailSelect