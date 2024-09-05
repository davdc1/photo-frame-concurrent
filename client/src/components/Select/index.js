import { useState } from 'react'
import './select.scss'

const Select = ({ options, noSelect, callback }) => {

    const [opened, setOpened] = useState(false)
    const [selected, setSelected] = useState(null)

    const onSelect = (option) => {
        if (option.optionCallback) option.optionCallback()
        else if (noSelect) callback?.()
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
        <div className='select-wrapper'>
                <div className='select-top' onClick={toggle}>
                    {selected ?
                    <span className='select-selected-option'>{selected.text}</span> :
                    <span className='select-default-text'>{options[0].text || tempContent.Select_defaultDefault}</span>}
                </div>
                <div className={`select-bottom ${opened ? 'opened' : ''}`}>
                    {options.map((option, idx) => {
                        if (idx === 0 ) return ''
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