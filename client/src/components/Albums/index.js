import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { photoService } from '../../services/photoService'
import { PopupContext } from '../../Contexts/PopupContext'
import { TextContext } from '../../Contexts/TextContext'
import Album from './Album'
import AlbumList from './AlbumList'
import './albums.scss'

const Albums = () => {

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['Albums'] || '{}')

    const [loadingAlbums, setLoadingAlbums] = useState(false)
    const [loadingAlbumPhotos, setLoadingAlbumPhotos] = useState(false)

    const [albums, setAlbums] = useState(null)
    const [selectedAlbum, setSelectedAlbum] = useState(null)

    const location = useLocation()


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
    delete album

    edit album:
    change photo-order
    remove photos
    change name and description
    */

    useEffect(() => {
        getAlbums()
    }, [])

    useEffect(() => {
        if (albums?.length && location.state?.album_id) {
            if (albums.find(({ id }) => id == location.state.album_id)) {
                setSelectedAlbum(location.state.album_id)
            }
        }
    }, [albums])

    const getAlbums = () => {

        setLoadingAlbums(true)




        photoService.getUserAlbums({ userId: userInfo.id })

            // !!!!!    REMOVE    !!!!!
            // photoService.getUserAlbums({ userId: 3 })

            .then((res) => {
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

    const toggleNewAlbum = () => {
        toggle({ popupType: 'NewAlbum', payload: { addNewlyCreatedAlbum } })
    }

    const addNewlyCreatedAlbum = (album) => {
        setAlbums((prev) => [...prev, album])
        setSelectedAlbum(album.id)
    }

    const removeDeletedAlbum = (album_id) => {
        setAlbums((prev) => {
            return prev.filter(({ id }) => id != album_id)
        })
        setSelectedAlbum(null)
    }



    return (
        <div className='albums-wrapper'>

            <div className='albums-controls'>
                <button className='album-con-btn' onClick={toggleNewAlbum}>
                    {compTexts.Albums_newAlbum}
                </button>
            </div>

            {albums ?
                <AlbumList clickHandler={onAlbumClick} albums={albums} selectedAlbum={selectedAlbum} /> : ''}

            {selectedAlbum ?
                <Album key={selectedAlbum} album_id={selectedAlbum} album={albums.find(({ id }) => id == selectedAlbum)} removeDeletedAlbum={removeDeletedAlbum} /> : ''}

        </div>
    )
}

export default Albums