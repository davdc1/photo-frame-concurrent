import Icon from '../Icon'
import './input-field.scss'

const InputField = ({ children, label, type, togglePassword, className }) => {

    return (
        <div className={`input-field-wrapper ${className || ''}`}>
            <span className='input-field-label'>
                {label}
            </span>

            <div className='input-field-container'>
                {children}

                    {togglePassword ? 
                        <span onClick={() => togglePassword?.()} className='toggle-password'>
                            <Icon type={type === 'text' ? 'hide-eye' : 'show-eye'} className='toggle-password-icon' />
                        </span>
                        : 
                        ''}
            </div>
            
        </div>
    )
}

export default InputField