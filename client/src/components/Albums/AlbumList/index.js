
import AlbumItem from '../AlbumItem'
import './album-list.scss'

const AlbumList = ({ albums, clickHandler, selectedAlbum }) => {
    return (
        <div className='album-list-wrapper'>
            {albums.map(({ name, id }) => (
                <AlbumItem key={`album-${id}`} data={{ name, id, clickHandler, selectedAlbum }} />
            ))}
        </div>
    )
}

export default AlbumList