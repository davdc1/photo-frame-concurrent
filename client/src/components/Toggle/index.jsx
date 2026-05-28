import './toggle.scss'

const Toggle = ({ label, value, modes, onChange, className }) => {

    const toggleValue = () => {
        onChange?.()
    }

    return (
        <div className={`toggle-wrapper ${className || ''}`} onClick={toggleValue}>
            <div className={`toggle-butons`}>
                {modes.map((mode) => {
                    return <div key={mode} className={`toggle-button ${mode === value ? 'active' : ''}`}>{mode}</div>
                })}
            </div>
            {label ? <span className='toggle-label'>{label}</span> : ''}
        </div>
    )
}

export default Toggle