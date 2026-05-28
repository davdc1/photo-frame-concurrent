import { useEffect, useState } from 'react'
import './select.scss'
import { use } from 'react'
import HollowArrow from '../HollowArrow'

const Select = ({ options, noSelect, callback, value, noDefault, className }) => {

    const [opened, setOpened] = useState(false)
    const [selected, setSelected] = useState(null)


    // for a controlled input, when value is provided. 
    useEffect(() => {
        if (value) {
            setSelected(options.find((o) => o.value === value))
        }
    }, [value])

    const onSelect = (option) => {
        if (value) {
            callback?.(option)
        }
        else if (option.optionCallback) option.optionCallback()
        else if (noSelect) callback?.(option)
        else setSelected(option)
        toggle()
    }

    const toggle = () => {
        setOpened((state) => !state)
    }

    const tempContent = {
        Select_defaultDefault: 'options'
    }

    return (
        <div className={`select-wrapper ${opened ? 'opened' : ''} ${className || ''}`}>
            <div className='select-top' onClick={toggle}>
                {selected ?
                    <span className='select-selected-option'>{selected.text}</span> :
                    <span className='select-default-text'>{options[0]?.text || tempContent.Select_defaultDefault}</span>}
                <HollowArrow className={`select-arrow ${opened ? 'opened' : ''}`} />
            </div>
            <div className={`select-bottom ${opened ? 'opened' : ''}`}>
                {options.map((option, idx) => {
                    if (!noDefault && idx === 0) return ''
                    return (
                        <div className='select-item' onClick={() => onSelect(option)} key={idx.toString()}>
                            <span>{option.text}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Select