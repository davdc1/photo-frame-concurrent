import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PopupContext } from '../../../Contexts/PopupContext'
import { TextContext } from '../../../Contexts/TextContext'
import './add-photos.scss'

const AddPhotosPopup = () => {

    const { toggle, payload } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['AddPhotos'] || '{}')
    const navigate = useNavigate()

    const toggleUploadPopup = () => {
        console.log('PAYLOADDDD', payload);

        toggle({ popupType: 'Upload', payload })
    }

    // const toggleAddFromLibrary = () => {
    //     toggle({ popupType: 'AddFromLibrary', payload })
    // }

    const goToLibrary = () => {
        const { album } = payload
        toggle()
        navigate('/auth/photos', { state: { fromAlbum: true, album_id: album.id, albumName: album.name } })
    }

    return (
        <div className='add-photos-wrapper'>
            <span className='add-photos-title'>
                {compTexts.AddPhotos_title}
            </span>

            <div className='add-photos-buttons'>
                <button
                    // onClick={toggleAddFromLibrary}
                    onClick={goToLibrary}
                    className='add-photos-button'
                >
                    {compTexts.AddPhotos_add}
                </button>
                <button
                    onClick={toggleUploadPopup}
                    className='add-photos-button'
                >
                    {compTexts.AddPhotos_upload}
                </button>
            </div>
        </div>
    )
}

export default AddPhotosPopup