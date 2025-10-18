import { useContext, useEffect, useRef, useState } from 'react'
import { PopupContext } from '../../../Contexts/PopupContext'
import { photoService } from '../../../services/photoService'
import LoadingMask from './LoadingMask'
import ThumbnailSelect from '../../ThumbnailSelect'
import Thumbnail from '../../Thumbnail'
import spinner from '../../../images/svgs/spinner.svg'
import './album.scss'

const PER_PAGE = 10 // TODO. somthing about that
const TOP_OF_LIST = 'TOL'

const Album = ({ album_id }) => {

    const { toggle } = useContext(PopupContext)

    const [page, setPage] = useState(0)
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)
    const [endOfList, setEndOfList] = useState(false)
    const [lastInAlbum, setLastInAlbum] = useState(null)
    const [select, setSelect] = useState(false)
    const [selected, setSelected] = useState({})
    const [actionLoading, setActionLoading] = useState(false)
    // const [showPrev, setShowPrev] = useState('')

    const scrollerRef = useRef(null)
    const listRef = useRef(null)
    
    useEffect(() => {
        if (page >= 0) {
            getAlbumPhotos()
        }
    }, [page])

    const getAlbumPhotos = (init) => {

        setLoading(true)
        photoService.getAlbumPhotos({ album_id, page, perPage: PER_PAGE })
            .then((res) => {
                setLastInAlbum(res.data.lastInAlbum)
                if (!res.data.results.length) {                    
                    setEndOfList(true)
                } else {
                    if (init) {
                        setList([...res.data.results])
                    } else {
                        setList((state) => ([...state, ...res.data.results]))
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => setLoading(false))
    }

    const getMore = () => {
        if (endOfList === false) {
            paginate(1)
        }
    }

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
        toggle({ popupType: 'AddPhotos', payload: { album_id, startAtOrder: lastInAlbum /* = default */ } })
    }

    const hitSelect = () => {
        setSelected({})
        setSelect((state) => !state)
    }

    const onSelectItem = ({ currentTarget }) => {
        const { dataset: { albumphotoid } } = currentTarget        

        if (!albumphotoid) return
        
        if (!selected[albumphotoid]) setSelected((state) => ({ ...state, [albumphotoid]: true }))
        else setSelected((state) => ({ ...state, [albumphotoid]: false }))
    }



    const handleDragOver = (e) => {
        
        e.preventDefault()
        findClosest(e.clientX, e.clientY)

    }

    const handleDrop = (e) => {
        e.preventDefault()


        console.log('selected', selected);
        console.log('closest id:', closestPhotoId);

        const photos = []
        for (const id in selected) {
            if (selected[id]) {
                photos.push(Number(id))
            }
        }


        toggle({
            popupType: 'Confirm',
            payload: {
                title: 'cahnge order?',
                okText: 'yes',
                cancelText: 'no',
                okCallback: () => changeOrder(photos),
                cancelCallback: () => console.log('no')
            }
        })

        setClosestPhotoId(null)
        
    }


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
            console.log('change-photo-order', res.data);
            getAlbumPhotos()
            // setLoading(false), etc
            hitSelect()
        })
        .catch((error) => {
            // toggle({ popupType: 'error' })
            console.log('errorororo', error)
        })
        .finally(() => setActionLoading(false))
    }



    const mapThumbnailPositions = () => {

        let positions = []

        let items = document.getElementsByClassName('thumbnail-select-wrapper')
        
        Array.from(items).forEach((el, idx) => {
            const rect = el.getBoundingClientRect()
            positions.push({
                album_photo_id: el.dataset.albumphotoid,
                top: rect.top,
                bottom: rect.bottom,
                right: rect.right,
                left: rect.left,
                firstInPage: idx === 0
            })
        });

        // console.log('positions', positions);
        

        return positions
    }

    const findClosest = (dropX, dropY) => {

        // V1:

        // let closestPhoto = null;
        // let minDistance = Infinity;
      
        // positions.forEach((photo) => {
        //     const centerX = (photo.left + photo.right) / 2;
        //     const centerY = (photo.top + photo.bottom) / 2;
        //     let distance = Math.sqrt(
        //         Math.pow(centerX - dropX, 2) + Math.pow(centerY - dropY, 2)
        //     );
    
            
        //     if (distance < minDistance) {
        //         minDistance = distance;
        //         closestPhoto = photo.album_photo_id;
        //     }

        //     if (photo.firstInPage) {
        //         let distanceLeft = Math.sqrt(
        //             Math.pow(photo.left - dropX, 2) + Math.pow(centerY - dropY, 2)
        //         );

        //         if (distanceLeft < minDistance) {
        //             minDistance = distanceLeft
        //             closestPhoto = TOP_OF_LIST
        //         }
        //     }
        // });
      
        
        // setClosestPhotoId(closestPhoto)





        // V2:

        let closestPhoto = null;
        let minDistance = Infinity;
      

        console.log('itemms in vview', itemsInView);
        
        Object.keys(itemsInView).forEach((id) => {
            const centerX = (itemsInView[id].left + itemsInView[id].right) / 2;
            const centerY = (itemsInView[id].top + itemsInView[id].bottom) / 2;
            let distance = Math.sqrt(
                Math.pow(centerX - dropX, 2) + Math.pow(centerY - dropY, 2)
            );            
    
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPhoto = id
            }


            // FIX!!!!!
            // if (itemsInView[id].firstInPage) {
            //     let distanceLeft = Math.sqrt(
            //         Math.pow(itemsInView[id].left - dropX, 2) + Math.pow(centerY - dropY, 2)
            //     );

            //     if (distanceLeft < minDistance) {
            //         minDistance = distanceLeft
            //         closestPhoto = TOP_OF_LIST
            //     }
            // }
        });
      
        
        setClosestPhotoId(closestPhoto)







    }

    const [positions, setPositions] = useState([])

    const [closestPhotoId, setClosestPhotoId] = useState(null)



    const observerRef = useRef(null)
    useEffect(() => {
        let positions = mapThumbnailPositions()

        setPositions(positions)

        


        // check logic for disconnecting
        if (select) {
            observerRef.current = mapOnlyThoseInView()
        } else {
            observerRef?.current?.disconnect?.()
        }


        return () => observerRef?.current?.disconnect?.()
        
    }, [list, select])








    const getMoreRef = useRef(getMore)

    useEffect(() => {
        getMoreRef.current = getMore
    }, [getMore])



    const debounceRef = useRef(null)

    useEffect(() => {
        const scroller = scrollerRef.current
        
        const handleScroll = () => {
            console.log('scrrrrroooolllll');
            
            clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
                setPositions(mapThumbnailPositions())
               



            }, 150)


            if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 100) {
                

                // ---- check ----
                setTimeout(getMoreRef.current, 0)
            }

        }



        // const handleWheel = (e) => {
        //     if (e.deltaY > 0) {
        //         console.log('wheel down');
                
        //     }
        // }



        // const handleScrollEnd = () => {
        //     console.log('SCROLL END');
        //     // observer = mapOnlyThoseInView()
        //     // setPositions()
        // }




        scroller.addEventListener('scroll', handleScroll)
        // scroller.addEventListener('wheel', handleWheel)
        // scroller.addEventListener('scrollend', handleScrollEnd)

        return () => {
            scroller.removeEventListener('scroll', handleScroll)
            // scroller.removeEventListener('wheel', handleWheel)
            // scroller.removeEventListener('scrollend', handleScrollEnd)
        }
    }, [])




   


    const isListOverflowed = () => {
        const listContainer = listRef.current
        let rect = listContainer.getBoundingClientRect()

        if (rect.bottom < window.innerHeight - 20) {
            console.log('getting more');
            
            getMore()
        }
        
    }

    useEffect(() => {
        setTimeout(isListOverflowed, 500)
    }, [list.length])








    // optimizaion attempt:

    const [itemsInView, setItemsInView] = useState({})

    const mapOnlyThoseInView = () => {
        
        console.log('mapOnlyThoseInView');
        
        const observerCallback = (entries) => {
            entries.forEach((en) => {

                setItemsInView((prev) => {

                    if (en.isIntersecting) {


                        /// where eaz the scroll thing?

                        // obsolete. observer only shouts intersecting/not intersecting but does not necessarily follows location changes accurately. so the gpt says.
                        // getBoundingClientRect should be taken continiously on scroll.
                        // find a way to do it only for those in view
                        // one possible way: when scrooling scan all items (getElementsByClassName) but calculate distances only for those with albumphotoid in view
                        // another: give them all unique dom ids corresponding to their albumphotoid (e.g: id=thumbnail_id_58)
                        // then only scan for those ids (getElementById(`thumbnail_id_${albumphotoid}`))


                        prev[en.target.dataset.albumphotoid] = true // en.target.getBoundingClientRect()
                    } else {
                        delete prev[en.target.dataset.albumphotoid]
                    }

                    return prev
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






    const tempContent = {
        album_seePlayList: 'go to playlist',
        album_addPhotos: 'add photos',
        album_select: 'select'
    }

    return (
        <>
            <div className='album-wrapper' onDrop={handleDrop} onDragOver={handleDragOver} >



                {actionLoading ? <LoadingMask /> : ''}


                <div className='album-top-row'>
                    <button onClick={togglePlayListPopup}>{tempContent.album_seePlayList}</button>

                    {/* should not be available before lastInAlbum is recieved */}
                    <button onClick={toggleAddPhotoPopup}>{tempContent.album_addPhotos}</button>
                    <button onClick={hitSelect}>{tempContent.album_select}</button>
                    {window.innerWidth < 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page + 1}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''}
                </div>

               
                <div className='album-photo-list-overflow' ref={scrollerRef}>

                        <div className='album-photo-list' ref={listRef}>

                        
                            {closestPhotoId == TOP_OF_LIST ? (
                                <div style={{ height: 'auto', border: 'solid black 1px' }}></div>
                            ) : ''}
                        {select ?
                            list.map((item, idx) => (
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
                            )) :
                            list.map((item, idx) => <Thumbnail params={{ item }} key={idx.toString()} />)}

                            {loading ? <img src={spinner} /> : ''}

                            {endOfList ? 'no more photos' : ''}
                    </div>
                </div>
                
                {window.innerWidth >= 600 ?
                        <div>
                            <button onClick={() => paginate(0)}>{"<"}</button>
                            <span>{page + 1}</span>
                            <button onClick={() => paginate(1)}>{">"}</button>
                        </div> : ''}

                {!list.length ? 'album_id: ' + album_id : ''}
                {/* {showPrev ? <PhotoPrev closeCb={() => setShowPrev('')} url={`${showPrev.name}.jpg`} /> : ''} */}
            </div>
            {/* <button onClick={getAlbumPhotos}>test</button>*/}
            <button onClick={getMore}>{"+"}</button>
        </>
    )
}

export default Album