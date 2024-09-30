
import { useContext } from 'react'
import { PopupContext } from '../../Contexts/PopupContext'
import './thumbnail-select.scss'

const ThumbnailSelect = ({ params: { item, onSelectItem, selected, deleteLoading } }) => {

    const { toggle } = useContext(PopupContext)

    const prevPopup = () => {
        toggle({ popupType: 'PhotoPrev', payload: { id: item.id } })
    }

    return 1 ? (
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
    ) : (
        // <div className='thumbnail-wrapper' onClick={prevPopup}>
        //     <div className='thumbnail-img-container'>
        //         <img className='thumbnail-img' src={item.url} alt='' />
        //     </div>
        //     <span className='thumbnail-text' >{item.name_user}</span>
        // </div>


        // <div
        //     className={`thumbnail-select-wrapper ${deleteLoading ? 'disabled' : ''}`}
        //     data-photoid={item.id}
        //     onClick={deleteLoading ? null : onSelectItem}
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