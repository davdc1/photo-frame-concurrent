
import { useContext } from 'react'
import AlbumItem from '../AlbumItem'
import AlbumItem2 from '../AlbumItem2'
import { TextContext } from '../../../Contexts/TextContext'
import './album-list.scss'

const AlbumList = ({ albums, clickHandler, selectedAlbum, deleteAlbum, getAlbums }) => {

    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Albums'] || '{}')

    return (
        <div className='album-list-wrapper'>

            {albums?.length ?
                albums.map(({ name, id, cover, photo_count }) => (
                    <AlbumItem2 key={`album-${id}`} data={{ name, id, cover, clickHandler, selectedAlbum, photo_count }} deleteAlbum={deleteAlbum} getAlbums={getAlbums} />
                )) : <div className='no-albums'>{compTexts.Albums_noAlbums}</div>}
        </div>
    )
}

export default AlbumList