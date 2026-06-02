import { useContext, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { PopupContext } from '../../../Contexts/PopupContext'
import { TextContext } from '../../../Contexts/TextContext'
import { photoService } from '../../../services/photoService'
import { localStorageKeys } from '../../../utils/consts'
import './playlist-popup.scss'

const PlayListPopup = () => {

    const { toggle } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['PlaylistPopup'] || '{}')

    const [albums, setAlbums] = useState([])
    const [listOpened, setListOpened] = useState(false)
    const [selected, setSelected] = useState([])

    const navigate = useNavigate()


    useEffect(() => {
        init()
    }, [])

    const init = async () => {

        try {
            let res = await photoService.getUserAlbums()

            setAlbums(res.data)

            let { playlist } = JSON.parse(localStorage.getItem(localStorageKeys.PLAY_LIST_DATA) || '{}')

            let array = []
            for (let item in playlist) {
                let album = res.data.find((el) => el.id === playlist[item])
                array.push(album)
            }
            setSelected(array)

        } catch (error) {
            console.log('Error at playlist', error);

        }

    }

    const toggleSelect = () => {
        if (albums.length === 0) {
            return
        }
        setListOpened((state) => !state)
    }

    const addToPlaylist = (album) => {
        setSelected((state) => ([...state, album]))
    }

    const removeItem = (idx) => {
        setSelected((state) => {

            return state.filter((e, i) => i !== idx)
        })
    }

    const confirm = () => {
        let obj = {}

        selected.forEach((e, i) => {
            obj[i + 1] = e.id
        })

        let storage = JSON.parse(localStorage.getItem(localStorageKeys.PLAY_LIST_DATA) || '{}')
        storage.playlist = obj
        localStorage.setItem(localStorageKeys.PLAY_LIST_DATA, JSON.stringify(storage))

        toggle()
        navigate('/auth/frame', { state: { sessionType: 'playlist' } })

    }


    return (
        <div className='playlist-popup-wrapper'>
            <span className='playlist-popup-title'>
                {compTexts.PlaylistPopup_title}
            </span>

            <div className='playlist-popup-list'>
                {selected.map((album, idx) => (
                    <div className='playlist-popup-list-item' key={idx.toString()}>
                        <span className='playlist-item-number'>{idx + 1}</span>
                        <span className='playlist-item-name'>{album?.name}</span>
                        <span onClick={() => removeItem(idx)} className='playlist-popup-remove-btn'>{"-"}</span>
                    </div>
                ))}

                {selected.length === 0 ? <p className='playlist-popup-list-empty'>{compTexts.PlaylistPopup_empty}</p> : ''}
            </div>

            <div className='playlist-popup-select'>
                <div className='playlist-popup-select-top' onClick={toggleSelect}>
                    {/* <span>
                        {albums.length === 0 ? compTexts.PlaylistPopup_noAlbumsLine1 : compTexts.PlaylistPopup_select}
                    </span> */}


                    {albums.length === 0 ?
                        <div className='playlist-popup-no-albums'>
                            <span>
                                {compTexts.PlaylistPopup_noAlbumsLine1}
                            </span>

                            <NavLink className="" to="/auth/albums" state={{ openCreateAlbum: true }}>{compTexts.PlaylistPopup_noAlbumsLine2}</NavLink>
                        </div> :
                        <span>{compTexts.PlaylistPopup_select}</span>}



                    {albums.length > 0 ? <span>{"+"}</span> : ''}
                </div>
                <div className={`playlist-popup-select-bottom ${listOpened ? 'opened' : ''}`}>
                    {albums.map((album, idx) => {
                        return (
                            <div className='playlist-popup-select-item' key={idx.toString()}>
                                <span>{album.name}</span>
                                {album.has_photos ?
                                    <span className='playlist-popup-select-add-btn' onClick={() => addToPlaylist(album)}>{compTexts.PlaylistPopup_add}</span> :
                                    <span>{compTexts.PlaylistPopup_albumEmpty}</span>
                                }
                            </div>
                        )
                    })}
                </div>
            </div>

            <button onClick={confirm}>{compTexts.PlaylistPopup_confirm}</button>
        </div>
    )
}

export default PlayListPopup