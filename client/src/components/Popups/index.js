import { useContext } from 'react'
import { PopupContext } from '../../Contexts/PopupContext'
import popupTypes from './popupTypes'
import './archy-popup.scss'

const POPUP_ID = 'archy-popup-wrapper-ID'

const ArchyPopup = () => {

    const { popupType, toggle } = useContext(PopupContext)

    const closePopup = ({ target }) => {
        if (target.id === POPUP_ID) {
            toggle()
        }
    }

    return popupType in popupTypes ? (
        <div onClick={closePopup} id={POPUP_ID} className={`archy-popup-wrapper ${popupType}`}>
            <div className='popup-box'>
                {popupTypes[popupType]}
            </div>
        </div>
    ) : ''
}

export default ArchyPopup