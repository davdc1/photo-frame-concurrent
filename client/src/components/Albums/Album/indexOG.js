import { useContext, useEffect, useRef, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { photoService } from '../../../services/photoService'
import LoadingMask from './LoadingMask'
import ThumbnailSelect from '../../ThumbnailSelect'
import Thumbnail from '../../Thumbnail'
import spinner from '../../../images/svgs/spinner.svg'
import './album.scss'

const PER_PAGE = 20 // TODO. somthing about that
const TOP_OF_LIST = 'TOL'

const Album = ({ album_id, album, removeDeletedAlbum }) => {

    const { toggle } = useContext(PopupContext)

    const [page, setPage] = useState(0)
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)
    const [endOfList, setEndOfList] = useState(false)
    const [lastInAlbum, setLastInAlbum] = useState(null)
    const [select, setSelect] = useState(false)
    const [selected, setSelected] = useState({})
    const [actionLoading, setActionLoading] = useState(false)
    const [positionsInView, setPositionsInView] = useState([])
    const [closestPhotoId, setClosestPhotoId] = useState(null)
    const [itemsInView, setItemsInView] = useState({})

    const observerRef = useRef(null)
    const positionDebounceRef = useRef(null)
    const loadMoreDebounceRef = useRef(null)
    const scrollerRef = useRef(null)
    const listRef = useRef(null)

    useEffect(() => {
        if (page >= 0) {
            getAlbumPhotos()
        }
    }, [page, album_id])

    useEffect(() => {

        const isListOverflowed = () => {
            const listContainer = listRef.current
            let rect = listContainer.getBoundingClientRect()
    
            if (rect.bottom < window.innerHeight - 20) {
                getMoreRef.current?.()
            }
            
        }

        let time = setTimeout(isListOverflowed, 500)

        return () => clearTimeout(time)

    }, [list.length])

    useEffect(() => {
        // check logic for disconnecting
        if (select) {
            observerRef.current = observe()
        } else {
            observerRef?.current?.disconnect?.()
        }

        return () => observerRef?.current?.disconnect?.()
        
    }, [list, select])

    useEffect(() => {
        const scroller = scrollerRef.current
        let prevScrollTop = 0
        
        const handleScroll = () => {
            if (select) {
                clearTimeout(positionDebounceRef.current)
                positionDebounceRef.current = setTimeout(() => {
                   getPositionsOfThoseInView()
                }, 150)
            }

            const { scrollTop, scrollHeight, clientHeight } = scroller
            const scrollingDown = scrollTop > prevScrollTop
            prevScrollTop = scrollTop

            if (scrollingDown && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 100) {
                clearTimeout(loadMoreDebounceRef.current)                
                loadMoreDebounceRef.current = setTimeout(getMoreRef.current, 500)
            }

        }

        scroller.addEventListener('scroll', handleScroll)

        return () => {
            scroller.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        if (select) {
            getPositionsOfThoseInView()
        }
    }, [itemsInView, select])

    const getAlbumPhotos = (replacePageContent) => {

        console.log('getting album photos');
        
        let thePage = page
        if (replacePageContent) {
            thePage--
        }

        setLoading(true)
        photoService.getAlbumPhotos({ album_id, page: thePage, perPage: PER_PAGE })
            .then((res) => {
                console.log('here???');
                
                setLastInAlbum(res.data.lastInAlbum)
                if (!res.data.results.length) {     
                    setEndOfList(true)
                } else if (replacePageContent) {
                    setList(res.data.results)
                } else {
                    setList((state) => ([...state, ...res.data.results]))
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => setLoading(false))
    }

    const onUploadDone = () => {
        if (endOfList) {
            getAlbumPhotos(true)
        }
    }

    const getMore = () => {
        if (endOfList === false) {
            paginate(1)
        }
    }
    const getMoreRef = useRef(getMore)

    useEffect(() => {
        getMoreRef.current = getMore
    }, [getMore])


    const paginate = (up) => {        
        if (up && page <= Number(lastInAlbum) / PER_PAGE) {
            setPage((state) => state + 1)
        } else if (!up && page > 0) {
            setPage((state) => state - 1)
        }
    }

    const togglePlayListPopup = () => {
        toggle({ popupType: 'PlayList', payload: { album_id } })
    }

    const toggleAddPhotoPopup = () => {        
        toggle({ popupType: 'AddPhotos', payload: { album_id, album, startAtOrder: lastInAlbum /* = default */, onUploadDone } })
    }

    const hitSelect = () => {
        setSelected({})
        setSelect((state) => !state)
    }

    const onSelectItem = ({ currentTarget }) => {
        const { dataset: { albumphotoid, order } } = currentTarget        

        if (!albumphotoid) return
        
        // if (!selected[albumphotoid]) setSelected((state) => ({ ...state, [albumphotoid]: true }))
        // else setSelected((state) => ({ ...state, [albumphotoid]: false }))



        if (!(!!selected[albumphotoid])) setSelected((state) => ({ ...state, [albumphotoid]: [order] }))
        else setSelected((state) => ({ ...state, [albumphotoid]: false }))
        


    }

    const handleDragOver = (e) => {
        e.preventDefault()
        findClosest(e.clientX, e.clientY)
    }

    const handleDrop = (e) => {
        e.preventDefault()




        let arr = Object.entries(selected)
            .filter((e) => !!e[1])
            .sort((a, b) => Number(a[1][0]) - Number(b[1][0]))
            .map((e) => Number(e[0]))


            console.log('ARRRR', arr);
            







        const photos = []
        for (const id in selected) {
            if (selected[id]) {
                photos.push(Number(id))
            }
        }

        toggle({
            popupType: 'Confirm',
            payload: {
                title: 'change order?',
                okText: 'yes',
                cancelText: 'no',
                okCallback: () => changeOrder(arr)
            }
        })

        setClosestPhotoId(null)
        
    }









    //////  TEMP


    useEffect(() => {
        console.log('selected', selected);
        
    }, [selected])












    const changeOrder = (photos) => {

        let bottomLimit
        let isTopOfList = false
        if (closestPhotoId === TOP_OF_LIST) {
            isTopOfList = true
            bottomLimit = list[0].album_photo_id
        } else {
            bottomLimit = closestPhotoId
        }
        
        toggle()
        setActionLoading(true)
        // setLoading, opacity, disabled, etc
        photoService.changeAlbumPhotoOrder({ photos, bottomLimit, album_id, isActuallyTopLimit: isTopOfList })
        .then((res) => {
            getAlbumPhotos(endOfList ? true : false)
            // setLoading(false), etc
            hitSelect()
            reorderListAfterChange(closestPhotoId === TOP_OF_LIST ? TOP_OF_LIST : bottomLimit)
        })
        .catch((error) => {
            // toggle({ popupType: 'error' })
            console.log('error', error)
        })
        .finally(() => setActionLoading(false))
    }

    const getPositionsOfThoseInView = () => {
        
        let positionsInView = []

        let tol = document.getElementById(TOP_OF_LIST)
        let tolRect = tol.getBoundingClientRect()

        positionsInView.push({
            albumPhotoId: TOP_OF_LIST,
            top: tolRect.top,
            bottom: tolRect.bottom,
            right: tolRect.right,
            left: tolRect.left,
        })

        for (const albumphotoid in itemsInView) {

            if (itemsInView[albumphotoid]) {
                let node = document.getElementById(`thumbnail_id_${albumphotoid}`)
                if (node) {
                    let rect = node.getBoundingClientRect()
                    positionsInView.push({
                        albumPhotoId: node.dataset.albumphotoid,
                        top: rect.top,
                        bottom: rect.bottom,
                        right: rect.right,
                        left: rect.left,
                        // firstInPage: idx === 0
                    })
                }
            }
            
        }

        setPositionsInView(positionsInView)
    }

    const findClosest = (clientX, clientY) => {

        let closestPhoto = null;
        let minDistance = Infinity;
      
        for (const obj of JSON.parse(JSON.stringify(positionsInView))) {
            const centerX = (obj.left + obj.right) / 2;
            const centerY = (obj.top + obj.bottom) / 2;
            let distance = Math.sqrt(
                Math.pow(centerX - clientX, 2) + Math.pow(centerY - clientY, 2)
            );            

            if (distance < minDistance) {
                minDistance = distance;
                closestPhoto = obj.albumPhotoId
            }
        }

        setClosestPhotoId(closestPhoto)

    }

    const observe = () => {
        
        const observerCallback = (entries) => {
            entries.forEach((en) => {

                setItemsInView((prev) => {

                    let modified = { ...prev }
                    if (en.isIntersecting) {
                        modified[en.target.dataset.albumphotoid] = true
                    } else {
                        delete modified[en.target.dataset.albumphotoid]
                    }

                    return modified
                })
            })
        }

        const options = {
            threshold: 0.2,
            root: scrollerRef.current
        }

        const observer = new IntersectionObserver(observerCallback, options)
        const items = document.getElementsByClassName('thumbnail-select-wrapper')

        Array.from(items).forEach((item) => {
            observer.observe(item)
        })

        return observer
    }

    const reorderListAfterChange = (startAtId) => {

        let move = []
        let startAtOrder
        
        list.forEach((photo) => {
            if (!!selected[photo.album_photo_id]) {
                move.push(photo)
            }
            if (photo.album_photo_id == startAtId) {
                startAtOrder = photo.order
            }
        })

        if (startAtId === TOP_OF_LIST) startAtOrder = 0

        let head = []
        list.forEach((photo) => {
            if (!(!!selected[photo.album_photo_id])) {
                if (photo.order <= Number(startAtOrder)) {
                    head.push(photo)
                } else {
                    move.push(photo)
                }
            }
        })
        
        let third = head.concat(move)        
        setList(third)

    }

    const deleteAlbum = async () => {
        try {
            setActionLoading(true)
            let res = await photoService.deleteAlbum({ album_id })

            removeDeletedAlbum?.(album_id)
            toggle()
            
        } catch (error) {
            console.log('deleteAlbum', error);
            onError()
        }
        setActionLoading(false)
    }

    const removePhotos = async () => {
        try {

            setActionLoading(true)
            const ids = Object.keys(selected).filter((id) => !!selected[id]).map((id) => Number(id))
            await photoService.removeAlbumPhotos({ album_id, ids })

            removePhotosFromList(selected)

            toggle()
        } catch (error) {
            console.log('removeAlbumPhotos', error);
            onError()
        }

        setActionLoading(false)
        
    }

    const removePhotosFromList = (selectedIds) => {        
        setList((state) => {
            let newList = state.filter(({ album_photo_id }) => !selectedIds[album_photo_id])
            return newList
        })
    }

    const confirmDelete = () => {
        toggle({
            popupType: 'Confirm',
            payload: {
                okText: tempContent.Album_yes,
                cancelText: tempContent.Album_no,
                title: tempContent.Album_deletePrompt,
                okCallback: deleteAlbum,
                cancelCallback: toggle
            }
        })
    }

    const confirmRemovePhotos = () => {
        toggle({
            popupType: 'Confirm',
            payload: {
                okText: tempContent.Album_yes,
                cancelText: tempContent.Album_no,
                title: tempContent.Album_deletePhotosPrompt,
                okCallback: removePhotos,
                cancelCallback: toggle
            }
        })
    }

    const onError = () => {
        toggle({
            popupType: 'Confirm',
            payload: {
                title: tempContent.Album_deleteErrorTitle,
                okText: tempContent.Album_deleteErrorClose,
                okCallback: toggle
            }
        })
    }

    const photosSelected = Object.values(selected).filter((bool) => (!!bool)).length

    const tempContent = {
        Album_seePlayList: 'go to playlist',
        Album_addPhotos: 'add photos',
        Album_select: 'select',
        Album_deleteAlbum: 'delete album',
        Album_deletePrompt: 'delete album?',
        Album_yes: 'yes',
        Album_no: 'no',
        Album_deleteErrorTitle: 'an error occurred',
        Album_deleteErrorClose: 'close',
        Album_deletePhotos: 'delete photos',
        Album_deletePhotosPrompt: 'remove photos from album?',
        Album_cancel: 'cancel'
    }

    return (
        <>
            <div className='album-wrapper' onDrop={handleDrop} onDragOver={handleDragOver} >

                {actionLoading ? <LoadingMask /> : ''}

                <div className='album-top-row'>
                    <button onClick={togglePlayListPopup}>{tempContent.Album_seePlayList}</button>

                    {/* should not be available before lastInAlbum is recieved */}
                    <button onClick={toggleAddPhotoPopup}>{tempContent.Album_addPhotos}</button>
                    <button onClick={hitSelect}>{!select ? tempContent.Album_select : tempContent.Album_cancel}</button>
                    <button onClick={confirmDelete}>{tempContent.Album_deleteAlbum}</button>
                    <button onClick={confirmRemovePhotos} disabled={!photosSelected}>{tempContent.Album_deletePhotos}</button>
                    {/* {window.innerWidth < 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page + 1}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''} */}
                </div>
               
                <div className='album-photo-list-overflow' ref={scrollerRef}>

                        <div className='album-photo-list' ref={listRef}>

                            {closestPhotoId == TOP_OF_LIST ? (
                                <div style={{ height: 'auto', border: 'solid black 1px' }}></div>
                            ) : ''}
                        {select ?

                            <>
                                <div id={TOP_OF_LIST} ></div>
                                {list.map((item, idx) => (
                                    <>
                                        <ThumbnailSelect
                                            params={{
                                                item,
                                                onSelectItem,
                                                selected,
                                                disable: actionLoading,
                                                inAlbum: true
                                            }}
                                            key={idx.toString()}
                                            />
                                        {item.album_photo_id == closestPhotoId ? (
                                            <div style={{ height: 'auto', border: 'solid black 1px' }}></div>
                                        ) : ''}
                                    </>
                                ))}
                            </> :
                            list.map((item, idx) => <Thumbnail params={{ item }} key={idx.toString()} />)}

                            {loading ? <img src={spinner} /> : ''}

                            {endOfList ? 'no more photos' : ''}
                    </div>
                </div>
                
                {/* {window.innerWidth >= 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page + 1}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''} */}

                {/* {!list.length ? 'album_id: ' + album_id : ''} */}

                {!list.length ? 'no photos' : ''}
            </div>
            {/* <button onClick={getMore}>{"+"}</button> */}
        </>
    )
}

export default Album