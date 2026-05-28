import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PopupContext } from '../../../Contexts/PopupContext'
import './add-photos.scss'

const AddPhotosPopup = () => {

    const { toggle, payload } = useContext(PopupContext)
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

    const tempContent = {
        addPhotos_title: 'would you like to',
        addPhotos_add: 'add from library',
        addPhotos_upload: 'upload new'
    }
    return (
        <div className='add-photos-wrapper'>
            <span className='add-photos-title'>
                {tempContent.addPhotos_title}
            </span>

            <div className='add-photos-buttons'>
                <button
                    // onClick={toggleAddFromLibrary}
                    onClick={goToLibrary}
                    className='add-photos-button'
                >
                    {tempContent.addPhotos_add}
                </button>
                <button
                    onClick={toggleUploadPopup}
                    className='add-photos-button'
                >
                    {tempContent.addPhotos_upload}
                </button>
            </div>
        </div>
    )
}

export default AddPhotosPopup