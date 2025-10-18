import { useContext } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import './confirm-popup.scss'

const ConfirmPopup = () => {

    const { payload, toggle } = useContext(PopupContext)

    const { title, okText, cancelText, okCallback, cancelCallback } = payload

    const onCancel = () => {
        cancelCallback?.()
        toggle()
    }

    return (
        <div className="confirm-popup-wrapper">

            <span className="confirm-title">{title}</span>

            <div className="confirm-button-block">
                <button className="confirm-button ok" onClick={() => okCallback?.()}>{okText}</button>
                <button className="confirm-button cancel" onClick={onCancel}>{cancelText}</button>
            </div>

        </div>
    )
}

export default ConfirmPopup