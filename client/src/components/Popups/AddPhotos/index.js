import { useContext } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import './add-photos.scss'

const AddPhotosPopup = () => {

    const { toggle, payload } = useContext(PopupContext)

    const toggleUploadPopup = () => {
        toggle({ popupType: 'Upload', payload })
    }

    const goTo = () => {
        console.log('going');
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
                    onClick={goTo}
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