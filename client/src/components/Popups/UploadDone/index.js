import { useContext } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { TextContext } from '../../../Contexts/TextContext'
import './upload-done.scss'

const UploadDone = () => {

    const { payload, toggle } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['UploadDone'] || '{}')

    const closePopup = () => {
        payload?.whenFinished?.()
        toggle()
    }

    const backToUpload = () => {
        toggle({ popupType: 'Upload', payload })
    }

    return (
        <div className='upload-done-wrapper'>

            <span className='upload-done-title'>{compTexts.UploadDone_title}</span>
            <span className='upload-done-line'>{compTexts.UploadDone_line}</span>

            <div className='upload-done-button-container'>
                <button className='upload-done-button again' onClick={backToUpload}>{compTexts.UploadDone_buttonAgain}</button>
                <button className='upload-done-button finish' onClick={closePopup}>{compTexts.UploadDone_buttonClose}</button>
            </div>
        </div>
    )
}

export default UploadDone