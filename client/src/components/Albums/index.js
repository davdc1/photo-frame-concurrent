import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Contexts/AuthContext'
import AlbumList from './AlbumList'
import Album from './Album'
import { photoService } from '../../services/photoService'
import './albums.scss'

const Albums = () => {

    const { userInfo } = useContext(AuthContext)

    const [loadingAlbums, setLoadingAlbums] = useState(false)
    const [loadingAlbumPhotos, setLoadingAlbumPhotos] = useState(false)

    const [albums, setAlbums] = useState(null)

    const [selectedAlbum, setSelectedAlbum] = useState(null)




    /*
    get all (or some) album ids and titles
    display as grid
    album id might initialy be fetched with some photos/photo urls.
    click album item to see photo thumnails (how?)
    scrol to load more
    show total count


    add photos to album
    create new album
    edit album

    edit album:
    change photo-order
    remove photos
    change name and description
    */
    useEffect(() => {
        getAlbums()
    }, [])

    const getAlbums = () => {

        console.log('userInfo.id', userInfo.id);
        setLoadingAlbums(true)

        photoService.getUserAlbums({ userId: userInfo.id })
            .then((res) => {
                console.log('res getUserAlbums', res. data);
                setAlbums(res.data)
            })
            .catch((error) => {
                console.log('getUserAlbums', error);
            })
            .finally(() => setLoadingAlbums(false))
    }

    const onAlbumClick = (id) => {
        if (selectedAlbum == id) {
            setSelectedAlbum(null)
        } else {
            setSelectedAlbum(id)
        }
    }

    console.log('albumssss');

    return(
        <div className='albums-wrapper'>

            {albums ?
                <AlbumList clickHandler={onAlbumClick} albums={albums} /> : ''}

            {selectedAlbum ? 
                <Album album_id={selectedAlbum}/> : ''}

        </div>
    )
}

export default Albums