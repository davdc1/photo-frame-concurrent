
import { useContext, useState } from 'react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { PopupContext } from '../../Contexts/PopupContext'
import Icon from '../Icon'
import expandIcon from '../../images/svgs/expand.svg'
import './thumbnail-select.scss'

const ThumbnailSelect = ({ params: { item, onSelectItem, selected, disable, inAlbum, startDrag, select, markReorder, skeleton = true } }) => {
    // const ThumbnailSelect = ({ item, onSelectItem, selected, disable, inAlbum, startDrag, select }) => {

    const [loaded, setLoaded] = useState(false)
    const { toggle } = useContext(PopupContext)

    const thumbnailFocus = useFocusable()
    // const checkFocus = useFocusable()

    const prevPopup = () => {
        toggle({ popupType: 'PhotoPrev', payload: { id: item.id } })
    }

    const handleSelect = (e) => {
        if (e.target.classList.contains('thumbnail-open')) return
        onSelectItem(e)
    }

    // TODO. TEST
    const handleLoad = () => {
        setLoaded(true)
    }

    return (
        <div
            className={`thumbnail-select-wrapper ${disable ? 'disabled' : ''} ${markReorder ? 'drag' : ''}`}
            id={`thumbnail_id_${item.album_photo_id}`}
            data-photoid={item.id}
            data-albumphotoid={item.album_photo_id}
            data-order={item.order}
            onClick={disable || !select ? undefined : handleSelect}
            onMouseDown={!select ? undefined : startDrag}
            onTouchStart={!select ? undefined : startDrag}
            ref={thumbnailFocus.ref}
        >
            {select ?
                <>
                    <div className='thumbnail-overlay' data-albumphotoid={item.album_photo_id}></div>
                    <button className='thumbnail-open' onClick={prevPopup}>
                        <img src={expandIcon} />
                    </button>
                    <div className={`thumbnail-select-check ${selected[item.id] || (inAlbum && selected[item.album_photo_id]) ? 'selected' : ''}`}>
                        <Icon type='check' className='check-icon' />
                    </div>
                </> : ''}

            <img
                className='thumbnail-select-img'
                src={item.url}
                alt=''
                draggable={false}
                onClick={!select ? prevPopup : undefined}
                onLoad={handleLoad}
            />


            {!loaded && skeleton ?
                <div className='thumbnail-skeleton'>
                    <Icon type={'spinner'} />
                </div> : ''}
        </div>
    )
}

export default ThumbnailSelect