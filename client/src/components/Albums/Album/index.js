import { useContext, useEffect, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { photoService } from '../../../services/photoService'
// import PhotoPrev from '../PhotoPrev'
import './album.scss'

const PER_PAGE = 10 // TODO. somthing about that

const Album = ({ album_id, initial }) => {

    const { toggle } = useContext(PopupContext)

    const [page, setPage] = useState(1)
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)
    const [endOfList, setEndOfList] = useState(false)
    const [lastInAlbum, setLastInAlbum] = useState(null)
    // const [showPrev, setShowPrev] = useState('')

    useEffect(() => {
        init()
    }, [album_id])

    useEffect(() => {
        if (page > 0) {
            getAlbumPhotos()
        }
    }, [page])

    const getAlbumPhotos = (init) => {
        console.log('getAlbumPhotos. in  album')
        setLoading(() => { 
            photoService.getAlbumPhotos({ album_id, page, perPage: PER_PAGE })
            .then((res) => {
                console.log('in album', res.data);
                setLastInAlbum(res.data.lastInAlbum)
                if (!res.data.results.length) {
                    setEndOfList(true)
                } else {
                    // if (init) {
                    //     setList([...res.data.results])
                    // } else {
                    //     setList((state) => ([...state, ...res.data.results]))
                    // }

                    setList([...res.data.results])

                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => setLoading(false))

            return true
        })
    }

    const init = () => {
        getAlbumPhotos(true)
    }

    const getMore = () => {
        if (!endOfList) {
            setPage(page + 1)
        }
    }

    const paginate = (up) => {
        if (up && page < lastInAlbum / PER_PAGE) {
            setPage((state) => state + 1)
        } else if (!up && page > 1) {
            setPage((state) => state - 1)
        }
    }

    const togglePrevPopup = (payload) => {
        console.log('toggglwe', payload);
        toggle({ popupType: 'PhotoPrev', payload })
    }

    const togglePlayListPopup = () => {
        toggle({ popupType: 'PlayList', payload: { album_id } })
    }

    const toggleAddPhotoPopup = () => {
        toggle({ popupType: 'AddPhotos', payload: { album_id, startAtOrder: lastInAlbum /* = default */ } })
    }


    // const tempPhotos = [
    //     { name: 'name1', ext: 'jpg', id: 1 },
    //     { name: 'name2', ext: 'jpg', id: 2 }
    // ]

    const tempContent = {
        album_seePlayList: 'go to playlist',
        album_addPhotos: 'add photos'
    }

    return (
        <>
            <div className='album-wrapper'>
                <div className='album-top-row'>
                    <button onClick={togglePlayListPopup}>{tempContent.album_seePlayList}</button>

                    {/* should not be available before lastInAlbum is recieved */}
                    <button onClick={toggleAddPhotoPopup}>{tempContent.album_addPhotos}</button>
                    {window.innerWidth < 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''}
                </div>
                <div className='album-photo-list'>

                    {list.map((item, idx) => {
                        // console.log('tieitietm', item);
                        console.log('itemnmmmmm', item);
                        return (
                            <div
                            className='photo-thumbnail-wrapper'
                            // onClick={() => setShowPrev(item)}
                            onClick={() => togglePrevPopup(item)}
                            key={idx.toString()}
                            draggable
                            
                            >

                                {/* <img className='photo-thumbnail-img' src={`${process.env.REACT_APP_API_URL}/images/${item.name}.${item.ext}`} /> */}
                                {/* <img className='photo-thumbnail-img' src={`/images/${item.name}.${item.ext}`} /> */}
                                <img className='photo-thumbnail-img' src={item.url} />

                                <span className='photo-thumbnail-text'>
                                    {`id: ${item.id}. name: ${item.name_user}. order: ${item.order}`}
                                </span>
                                
                            </div>
                        )
                    })}
                </div>
                {window.innerWidth >= 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''}

                {!list.length ? 'album_id: ' + album_id : ''}
                {/* {showPrev ? <PhotoPrev closeCb={() => setShowPrev('')} url={`${showPrev.name}.jpg`} /> : ''} */}
            </div>
            {/* <button onClick={getAlbumPhotos}>test</button>
            <button onClick={getMore}>{"+"}</button> */}
        </>
    )
}

export default Album