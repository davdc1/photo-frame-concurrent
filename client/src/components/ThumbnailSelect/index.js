
import { useContext } from 'react'
import { PopupContext } from '../../Contexts/PopupContext'
import './thumbnail-select.scss'

const OPEN_BUTTON_ID = 'thumbnailSelectOpen'

const ThumbnailSelect = ({ params: { item, onSelectItem, selected, disable, inAlbum } }) => {

    const { toggle } = useContext(PopupContext)

    const prevPopup = () => {
        toggle({ popupType: 'PhotoPrev', payload: { id: item.id } })
    }

    const handleSelect = (e) => {        
        if (e?.target?.id == OPEN_BUTTON_ID) return
        else onSelectItem(e)
    }

    return 1 ? (
        <div
            className={`thumbnail-select-wrapper ${disable ? 'disabled' : ''}`}
            data-photoid={item.id}
            data-albumphotoid={item.album_photo_id}
            onClick={disable ? null : handleSelect}
            draggable={inAlbum && selected[item.album_photo_id]}
        >
            <button id={OPEN_BUTTON_ID} onClick={prevPopup}>{"OPEN"}</button>
            <div className='thumbnail-select-img-container'>
                <img className='thumbnail-select-img' src={item.url} alt='' draggable={false} />
            </div>
            <span className='thumbnail-select-text' >{item.name_user}</span>
            ---<span>{item.album_photo_id}</span>
            <div className={`thumbnail-select-check ${selected[item.id] || inAlbum && selected[item.album_photo_id] ? 'selected' : ''}`}></div>
        </div>
    ) : (''
        // <div className='thumbnail-wrapper' onClick={prevPopup}>
        //     <div className='thumbnail-img-container'>
        //         <img className='thumbnail-img' src={item.url} alt='' />
        //     </div>
        //     <span className='thumbnail-text' >{item.name_user}</span>
        // </div>


        // <div
        //     className={`thumbnail-select-wrapper ${disable ? 'disabled' : ''}`}
        //     data-photoid={item.id}
        //     onClick={disable ? null : onSelectItem}
        // >
        //     {1 ? <button onClick={prevPopup}>{"OPEN"}</button> : '' }
        //     <div className='thumbnail-select-img-container'>
        //         <img className='thumbnail-select-img' src={item.url} alt='' />
        //     </div>
        //     <span className='thumbnail-select-text' >{item.name_user}</span>
        //     {1 ?  <div className={`thumbnail-select-check ${selected[item.id] ? 'selected' : ''}`}></div> : ''}
        // </div>
    )
}

export default ThumbnailSelect