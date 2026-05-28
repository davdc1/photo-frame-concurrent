import { useContext } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import './upload-done.scss'

const UploadDone = () => {

    const { payload, toggle } = useContext(PopupContext)

    const closePopup = () => {
        payload?.whenFinished?.()
        toggle()
    }

    const backToUpload = () => {
        toggle({ popupType: 'Upload', payload })
    }

    const tempContent = {
        uploadDone_title: 'upload completed',
        uploadDone_line: 'would you like to',
        uploadDone_buttonAgain: 'upload more',
        uploadDone_buttonClose: 'finish'
    }

    return (
        <div className='upload-done-wrapper'>

            <span className='upload-done-title'>{tempContent.uploadDone_title}</span>
            <span className='upload-done-line'>{tempContent.uploadDone_line}</span>

            <div className='upload-done-button-container'>
                <button className='upload-done-button again' onClick={backToUpload}>{tempContent.uploadDone_buttonAgain}</button>
                <button className='upload-done-button finish' onClick={closePopup}>{tempContent.uploadDone_buttonClose}</button>
            </div>
        </div>
    )
}

export default UploadDone