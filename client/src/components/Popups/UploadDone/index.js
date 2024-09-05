import { useContext } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import './upload-done.scss'

const UploadDone = () => {

    const { payload, toggle } = useContext(PopupContext)

    const closePopup = () => {
        toggle()
    }

    const backToUpload = () => {
        toggle({ popupType: 'Upload', payload })
    }

    const tempContent = {
        uploadDone_title: 'upload completed',
        uploadDone_line: 'would yoy like to',
        uploadDone_buttonAgain: 'upload more',
        uploadDone_buttonClose: 'finish'
    }

    return (
        <div className='upload-done-wrapper'>

            <span className='upload-done-title'>{tempContent.uploadDone_title}</span>
            <span className='upload-done-line'>{tempContent.uploadDone_line}</span>

            <div className='upload-done-button-container'>
                <button className='upload-done-again' onClick={backToUpload}>{tempContent.uploadDone_buttonAgain}</button>
                <button className='upload-done-finish' onClick={closePopup}>{tempContent.uploadDone_buttonClose}</button>
            </div>
        </div>
    )
}

export default UploadDone