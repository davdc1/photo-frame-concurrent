import { useCallback, useEffect, useRef, useState } from 'react'
import './test-page.scss'
import AnotherComponent from './AnotherComponent'

const TestPage = () => {

    const [text, setText] = useState('OLD VALUE')

    const handleInput = ({ target: { value } }) => {
        setText(value)
    }

    const clickHandler = () => {
       ref.current()
    }

    const ref = useRef()

    useEffect(() => {
        ref.current = () => {
            console.log('send to server', text);
        }
    }, [text])




    const [currentImage, setCurrentImage] = useState(0)

    const imageNames = [
        'DSC_0150.jpg',
        'DSC_0213.jpg',
        'DSC_0225.jpg',
        'DSC_1978.JPG'
    ]

    const nextImage = () => {
        setCurrentImage((idx) => {
            if (idx < imageNames.length - 1) {
                return idx + 1
            } else {
                return 0
            }
        })
    }


    return (
        <div className='test-page-wrapper'>
            <div className='test-box'>
                
                <input value={text} onChange={handleInput} />
                {/* <AnotherComponent title={"title"} handler={clickHandler} /> */}

                <img style={{ width: '300px' }} src={`${process.env.REACT_APP_API_URL}/images/${imageNames[currentImage]}`} />
                <br />
                <button onClick={nextImage}>{'next image'}</button>

                <div style={{ display: 'flex', flexWrap: 'wrap', width: '370px' }}>
                    {[...imageNames, ...imageNames, ...imageNames].map((name, idx) => (
                        <img style={{ width: '100px', margin: '10px' }} src={`${process.env.REACT_APP_API_URL}/images/${name}`} key={idx.toString()} />
                    ))}

                </div>
            </div>
        </div>
    )
}

export default TestPage