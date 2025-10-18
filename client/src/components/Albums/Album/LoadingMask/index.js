import spinner from '../../../../images/svgs/spinner.svg'
import './loading-mask.scss'

const LoadingMask = () => {
    return (
        <div className='loading-mask'>
            <img className='loading-mask-spinner' src={spinner} />
        </div>
    )
}

export default LoadingMask