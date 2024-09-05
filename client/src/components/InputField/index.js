import './input-field.scss'

const InputField = ({ children, label, className }) => {
    return (
        <div className={`input-field-wrapper ${className || ''}`}>
            <span className='input-field-label'>
                {label}
            </span>

            <div className='input-field-container'>
                {children}
            </div>
            
        </div>
    )
}

export default InputField