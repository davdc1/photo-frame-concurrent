import Spinner from '../../../Spinner'
import './loading-mask.scss'

const LoadingMask = () => {
    return (
        <div className='loading-mask'>
            <Spinner className='loading-mask-spinner' />
        </div>
    )
}

export default LoadingMask