import './toggle.scss'

const Toggle = ({ label, value, modes, onChange, className }) => {

    const toggleValue = () => {
        onChange?.()
    }

    return (
        <div className={`toggle-wrapper ${className || ''}`} onClick={toggleValue}>
            <div className={`toggle-butons`}>
                {modes.map((mode) => {
                    return <div key={mode.value} className={`toggle-button ${mode.value === value ? 'active' : ''}`}>{mode.text}</div>
                })}
            </div>
            {label ? <span className='toggle-label'>{label}</span> : ''}
        </div>
    )
}

export default Toggle