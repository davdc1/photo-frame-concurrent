import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../Contexts/AuthContext'
import { PopupContext } from '../../../Contexts/PopupContext'
import { photoService } from '../../../services/photoService'
import './playlist-popup.scss'

const PlayListPopup = () => {

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)

    const [albums, setAlbums] = useState([])
    const [listOpened, setListOpened] = useState(false)
    const [selected, setSelected] = useState([])

    const navigate = useNavigate()


    useEffect(() => {

        init()

    }, [])

    const init = async () => {

        try {
            let res = await photoService.getUserAlbums({ userId: userInfo.id })
            
            setAlbums(res.data)
            
            let { playlist } = JSON.parse(localStorage.getItem('playListData') || '{}')
            let array = []
            for (let item in playlist) {
                let album = res.data.find((el) => el.id === playlist[item])
                array.push(album)
            }
            setSelected(array)
            
        } catch (error) {
            
        }

    }

    // const getAlbums = async () => {
    //     return photoService.getUserAlbums({ userId: userInfo.id })
    //     .then((res) => {
    //         console.log('get albums:', res.data);
    //         setAlbums(res.data)
    //     })
    //     .catch(() => {})
    // }

    const toggleSelect = () => {
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

        let storage = JSON.parse(localStorage.getItem('playListData') || '{}')
        storage.playlist = obj
        localStorage.setItem('playListData', JSON.stringify(storage))

        toggle()
        navigate('/auth/frame', { state: { sessionType: 'playlist' } })

    }

    const tempContent = {
        playlistPopup_title: 'New playlist',
        playlistPopup_select: 'select album',
        playlistPopup_add: 'add'
    }

    return (
        <div className='playlist-popup-wrapper'>
            <span className='playlist-popup-title'>
                {tempContent.playlistPopup_title}
            </span>

            <div className='playlist-popup-list'>
                {selected.map((album, idx) => (
                    <div className='playlist-popup-list-item' key={idx.toString()}>
                        <span>{album.name}</span>
                        <span onClick={() => removeItem(idx)} className='playlist-popup-remove-btn'>{"-"}</span>
                    </div>
                ))}
            </div>

            <div className='playlist-popup-select'>
                <div className='playlist-popup-select-top' onClick={toggleSelect}>
                    <span>
                        {tempContent.playlistPopup_select}
                    </span>
                    <span>{"+"}</span>
                </div>
                <div className={`playlist-popup-select-bottom ${listOpened ? 'opened' : ''}`}>
                    {albums.map((album, idx) => {
                        return (
                            <div className='playlist-popup-select-item' key={idx.toString()}>
                                <span>{album.name}</span>
                                <span className='playlist-popup-select-add-btn' onClick={() => addToPlaylist(album)}>{tempContent.playlistPopup_add}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <button onClick={confirm}>{"OKOKO"}</button>
        </div>
    )
}

export default PlayListPopup