import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Contexts/AuthContext'
import './albums.scss'
import { photoService } from '../../services/photoService'
import AlbumList from './AlbumList'
import Album from './Album'

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
        setLoadingAlbums(() => {

            photoService.getUserAlbums({ userId: userInfo.id })
            .then((res) => {
                console.log('res getUserAlbums', res. data);
                setAlbums(res.data)
            })
            .catch((error) => {
                console.log('getUserAlbums', error);
            })
            .finally(() => setLoadingAlbums(false))

            return true
        })
    }


    // where should that be?
    const getAlbumPhotos = () => {
        setLoadingAlbumPhotos(() => {
            
            photoService.getAlbumPhotos({ album_id: 1, page: 1, perPage: 10 }) // ...
            .then((res) => {
                console.log('getAlbumPhotos', res.data);
            })
            .catch((error) => {

            })
            .finally(() => setLoadingAlbumPhotos(false))
            return true
        })
    }

    const onAlbumClick = (id) => {
        if (selectedAlbum == id) {
            setSelectedAlbum(null)
        } else {
            setSelectedAlbum(id)

            // load (initial? album data)
            // setSelectedAlbumData
        }


        // if (selectedAlbum) setSelectedAlbum(null)
        // else setSelectedAlbum(id)
    }

    console.log('albumssss');

    return(
        <div className='albums-wrapper'>

            {/* <div style={{ display: 'flex' }}>
                <button
                    onClick={getAlbums}
                >
                    {"get albums"}
                </button>

                <button
                    onClick={getAlbumPhotos}
                >
                    {"getAlbumPhotos"}
                </button>
            </div> */}

            {albums ?
                <AlbumList clickHandler={onAlbumClick} albums={albums} /> : ''}

            {/* {selectedAlbum ?
                <span>{selectedAlbum}</span> : ''} */}

            {selectedAlbum ? 
                <Album album_id={selectedAlbum}/> : ''}

        </div>
    )
}

export default Albums