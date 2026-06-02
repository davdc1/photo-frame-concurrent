import { useContext, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { TextContext } from '../../../Contexts/TextContext'
import { photoService } from '../../../services/photoService'
import Spinner from '../../Spinner'
import './add-to-album.scss'

const AddToAlbum = () => {

    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [loading, setLoading] = useState(false)

    const { toggle, payload } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['AddToAlbum'] || '{}')

    const onSelect = (album) => {
        setSelectedAlbum(album.id === selectedAlbum ? null : album.id)
    }

    const addToAlbum = async () => {

        let ids = []
        Object.keys(payload.selected).forEach((id) => {
            if (payload.selected[id]) ids.push(id)
        })

        try {
            setLoading(true)
            await photoService.addPhotosToAlbum({ ids, album_id: selectedAlbum })
            payload.hitSelect()
            toggle()
        } catch (error) {
            console.log('error at addToAlbum', error);
        }

    }

    // Skip first entry (the "Add photos to album" header option from Select)
    // const albums = (payload.albums || []).filter((a) => a.id)


    return (
        <div className="add-to-album-wrapper">

            <h3 className='add-to-album-title'>{compTexts.AddToAlbum_title}</h3>

            <div className='add-to-album-list'>
                {payload.albums.map((album) => (
                    <div
                        className={`add-to-album-item ${selectedAlbum === album.id ? 'selected' : ''}`}
                        key={album.id}
                        onClick={() => onSelect(album)}
                    >
                        <div className='add-to-album-cover'>
                            {album.has_photos ? (
                                <img src={album.cover} alt={album.text} />
                            ) : (
                                <div className='add-to-album-cover-placeholder' />
                            )}
                        </div>
                        <span className='add-to-album-name'>{album.text}</span>
                    </div>
                ))}
            </div>

            <div className='add-to-album-buttons'>
                <button className='cancel' onClick={toggle}>{compTexts.AddToAlbum_cancel}</button>
                <button className='ok' disabled={!selectedAlbum} onClick={addToAlbum}>{compTexts.AddToAlbum_ok}</button>
            </div>
            <div className='spinner-container'>
                {loading ? <Spinner className='spinner' /> : ''}
            </div>

        </div>
    )
}

export default AddToAlbum