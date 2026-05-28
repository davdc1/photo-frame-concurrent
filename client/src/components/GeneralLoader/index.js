import { useContext } from 'react'
import { LoaderContext } from '../../Contexts/LoaderContext'
import Spinner from '../Spinner'
import './general-loader.scss'

const GeneralLoader = () => {
    const { show } = useContext(LoaderContext)

    return show ? (
        <div className='general-loader-wrapper'>
            <Spinner className='spinner' />
        </div>
    ) : ''
}

export default GeneralLoader