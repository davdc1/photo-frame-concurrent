import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { photoService } from '../../services/photoService'
import { PopupContext } from '../../Contexts/PopupContext'
import { TextContext } from '../../Contexts/TextContext'
import Album from './Album'
import AlbumList from './AlbumList'
import Spinner from '../Spinner'
import Icon from '../Icon'
import './albums.scss'

const Albums2 = () => {

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)
    const { texts } = useContext(TextContext)

    const [loadingAlbums, setLoadingAlbums] = useState(false)

    const [albums, setAlbums] = useState(null)
    const [selectedAlbum, setSelectedAlbum] = useState(null)

    const location = useLocation()
    const navigate = useNavigate()

    const compTexts = JSON.parse(texts['Albums'] || '{}')

    useEffect(() => {
        getAlbums()

        if (location.state?.openCreateAlbum) {
            toggleNewAlbum()
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [])

    useEffect(() => {
        if (albums?.length && location.state?.album_id) {
            if (albums.find(({ id }) => id == location.state.album_id)) {
                setSelectedAlbum(location.state.album_id)
                navigate(location.pathname, { replace: true, state: {} })
            }
        }
    }, [albums])

    const getAlbums = () => {

        setLoadingAlbums(true)

        photoService.getUserAlbums({ userId: userInfo.id })
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

    const deleteAlbum = async (album_id) => {
        try {
            await photoService.deleteAlbum({ album_id })
            removeDeletedAlbum(album_id)
        } catch (error) {
            console.log('deleteAlbum error', error);
        }
    }

    const tempScrolRef = useRef(null)

    useEffect(() => {
        // console.log('tempScrolRef.current', tempScrolRef.current.id);
        tempScrolRef.current.addEventListener('scroll', (e) => {
            console.log('e', e.target.id);
        })
    }, [tempScrolRef])

    return (
        <div className='albums-wrapper' ref={tempScrolRef} id='TEMP-album-wrapper'>

            {selectedAlbum ? (
                <>
                    <Album
                        key={selectedAlbum}
                        album_id={selectedAlbum}
                        album={albums.find(({ id }) => id == selectedAlbum)}
                        removeDeletedAlbum={removeDeletedAlbum}
                        goBack={() => setSelectedAlbum(null)}
                    />
                </>
            ) : (
                <>
                    <div className='albums-controls'>
                        <button className='album-con-btn' onClick={toggleNewAlbum}>
                            <Icon type='plus' className='btn-icon' />{compTexts.Albums_newAlbum}
                        </button>
                    </div>

                    {loadingAlbums ? <Spinner /> :


                        <AlbumList
                            clickHandler={onAlbumClick}
                            albums={albums}
                            selectedAlbum={selectedAlbum}
                            deleteAlbum={deleteAlbum}
                            selectAlbumOnly={location.state?.fromLibrary}
                            getAlbums={getAlbums}
                        />}

                </>
            )}

        </div>
    )
}

export default Albums2