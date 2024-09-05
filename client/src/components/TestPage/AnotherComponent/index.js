import { memo } from "react";
import img from "../../../images/DSC_0150.jpg"
import img2 from "../../../images/DSC_0213.jpg"
import img3 from "../../../images/DSC_0225.jpg"



const AnotherComponent = memo( ({ title, handler }) => {
    console.log('i render!');

    for (let i = 0; i < 5000000; i++) {
        if ((i * (Math.random() + i)) % 500 === 0) {
            console.log('HIHIHIHIHIHIH');
        }
    }

    return (
        <div className="">
            <span>{title}:</span>

            {/* <img src={img} />
            <img src={img2} />
            <img src={img3} /> */}

            <button style={{ position: 'fixed', top: '100px', left: '100px' }} onClick={handler}>submit</button>
        </div>
    )
}, (oldProps, newProps) => {
    if (oldProps.title === newProps.title) {
        return true
    } 
    return false
})

export default AnotherComponent