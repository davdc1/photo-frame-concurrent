import { useContext, useEffect, useRef, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { photoService } from '../../../services/photoService'
import LoadingMask from './LoadingMask'
import Spinner from '../../Spinner'
import ThumbnailSelect from '../../ThumbnailSelect'
import Thumbnail from '../../Thumbnail'
// import spinner from '../../../images/svgs/spinner.svg'
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

    const closestPhotoIdRef = useRef(null)
    const observerRef = useRef(null)
    const positionDebounceRef = useRef(null)
    const loadMoreDebounceRef = useRef(null)
    const scrollerRef = useRef(null)
    const listRef = useRef(null)
    const positionsInViewRef = useRef(null)

    const updateClosestPhotoId = (id) => {
        setClosestPhotoId(id)
        closestPhotoIdRef.current = id
    }

    const updatePositionsInView = (positions) => {
        setPositionsInView(positions)
        positionsInViewRef.current = positions
    }

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
            console.log('running on scroll');

            if (select) {
                clearTimeout(positionDebounceRef.current)
                positionDebounceRef.current = setTimeout(() => {
                    getPositionsOfThoseInView()
                }, 150)


                // getPositionsOfThoseInView()

            }

            const { scrollTop, scrollHeight, clientHeight } = scroller
            const scrollingDown = scrollTop > prevScrollTop
            prevScrollTop = scrollTop

            if (scrollingDown && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 100) {
                clearTimeout(loadMoreDebounceRef.current)
                loadMoreDebounceRef.current = setTimeout(getMoreRef.current, 500)
            }



            // if (isDraggingRef.current && lastPointRef.current) {
            //     const { x, y } = lastPointRef.current
            //     findClosest(x, y)
            //   }



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

        updateClosestPhotoId(null)

    }

    const changeOrder = (photos) => {

        let bottomLimit
        let isTopOfList = false
        if (closestPhotoIdRef.current === TOP_OF_LIST) {
            isTopOfList = true
            bottomLimit = list[0].album_photo_id
        } else {
            bottomLimit = closestPhotoIdRef.current
        }

        toggle()
        setActionLoading(true)
        // setLoading, opacity, disabled, etc
        photoService.changeAlbumPhotoOrder({ photos, bottomLimit, album_id, isActuallyTopLimit: isTopOfList })
            .then((res) => {
                getAlbumPhotos(endOfList ? true : false)
                // setLoading(false), etc
                hitSelect()
                reorderListAfterChange(closestPhotoIdRef.current === TOP_OF_LIST ? TOP_OF_LIST : bottomLimit)
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

        updatePositionsInView(positionsInView)
    }

    const findClosest = (clientX, clientY) => {

        let closestPhoto = null;
        let minDistance = Infinity;

        for (const obj of positionsInViewRef.current) {

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

        updateClosestPhotoId(closestPhoto)

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







    // TEST:



    // useEffect(() => {
    //     console.log('itemsInView', itemsInView);

    // }, [itemsInView])

    // useEffect(() => {
    //     console.log('positionInviewEFFFEE', positionsInView);

    // }, [positionsInView])




    const lastPointRef = useRef(null)
    const startPointRef = useRef(null)






    const isDraggingRef = useRef(false)

    const startDrag = (e) => {


        // console.log('selscetededed', selected);
        // console.log('e.target.dataset?.albumphotoid', e.target.dataset?.albumphotoid);




        // if (!selected[e.target.dataset?.albumphotoid]) return

        isDraggingRef.current = true

        e.preventDefault()

        // startPointRef.current = {
        //     x: e.touches?.[0]?.clientX,
        //     y: e.touches?.[0]?.clientY
        // }


        startPointRef.current = getPoint(e)

        scrollerRef.current?.classList?.add('dragging')

        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: false });

        // window.addEventListener("mouseup", endDrag);
        // window.addEventListener("touchend", endDrag);
    }


    const onMove = (e) => {

        e.preventDefault()

        if (!isDraggingRef.current) return



        // if distance > 8 --> hnadler logic: findClosest, scrollOndrag etc
        // else --> remove eventListeners, return

        const point = getPoint(e)
        const dx = Math.abs(point.x - startPointRef.current.x)
        const dy = Math.abs(point.y - startPointRef.current.y)

        if (dx + dy > 8) {
            findClosest(point.x, point.y)
            scrollOnDrag(point.y)

            window.addEventListener("mouseup", endDrag);
            window.addEventListener("touchend", endDrag);

        } else {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("mouseup", endDrag);
            window.removeEventListener("touchend", endDrag);
            return
        }






        // lastPointRef.current = point
        // findClosest(point.x, point.y)

        // scrollOnDrag(point.y)
    }

    const endDrag = (e) => {

        // if (e.changedTouches?.[0]) {
        //     console.log('e.changedTouches[0]', e.changedTouches[0]);
        //     console.log('STSTSTSTSRT', startPointRef.current); 


        //     const { clientX: endX, clientY: endY } = e.changedTouches[0]
        //     console.log('endX, endY', endX, endY);

        //     const dx = Math.abs(endX - startPointRef.current.x)
        //     const dy = Math.abs(endY - startPointRef.current.y)

        //     console.log('dx dy', dx, dy);


        //     if (dx + dy < 80) {

        //         console.log('BIGGGEEERRRERE');

        //         window.removeEventListener("mousemove", onMove);
        //         window.removeEventListener("touchmove", onMove);
        //         window.removeEventListener("mouseup", endDrag);
        //         window.removeEventListener("touchend", endDrag);

        //         return

        //     }

        // }


        console.log('endDRAG', selected);



        if (!isDraggingRef.current) return

        isDraggingRef.current = false
        scrollerRef.current?.classList?.remove('dragging')


        console.log('selected END', selected);
        console.log('closest END', closestPhotoIdRef.current);



        //////////////////
        // change order
        let arr = Object.entries(selected)
            .filter((e) => !!e[1])
            .sort((a, b) => Number(a[1][0]) - Number(b[1][0]))
            .map((e) => Number(e[0]))

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
                okCallback: () => {
                    changeOrder(arr, /*closestPhotoIdRef.current*/)
                    updateClosestPhotoId(null)
                },
                cancelCallback: () => updateClosestPhotoId(null)
            }
        })

        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("mouseup", endDrag);
        window.removeEventListener("touchend", endDrag);
    }

    const getPoint = (e) => {
        if (e.touches?.[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }


    const scrollOnDrag = (clientY) => {
        const SCROLL_MARGIN = 60
        const SCROLL_SPEED = 12

        const rect = scrollerRef.current.getBoundingClientRect()

        if (clientY < rect.top + SCROLL_MARGIN) {
            scrollerRef.current.scrollTop -= SCROLL_SPEED
            // getPositionsOfThoseInView()

            // const { x, y } = lastPointRef.current
            // findClosest(x, y)
        } else if (clientY > rect.bottom - SCROLL_MARGIN) {
            scrollerRef.current.scrollTop += SCROLL_SPEED
            // getPositionsOfThoseInView()

            // const { x, y } = lastPointRef.current
            // findClosest(x, y)
        }

    }


    // useEffect(() => {
    //     console.log('closesttttt', closestPhotoId);

    // }, [closestPhotoId])


    // rt@rt.rt



    return (
        <>
            {/* <div className='album-wrapper' onDrop={handleDrop} onDragOver={handleDragOver} > */}
            <div className='album-wrapper'  >


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
                                                inAlbum: true,
                                                startDrag
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

                        {/* {loading ? <img src={spinner} /> : ''} */}
                        {loading ? <Spinner className="album-loading" /> : ''}

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