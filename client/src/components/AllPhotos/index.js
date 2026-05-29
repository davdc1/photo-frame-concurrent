import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { LoaderContext } from '../../Contexts/LoaderContext'
import { PopupContext } from '../../Contexts/PopupContext'
import ThumbnailSelect from '../ThumbnailSelect'
import { photoService } from '../../services/photoService'
import Icon from '../Icon'
import Spinner from '../Spinner'
import './all-photos.scss'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

const FETCH_MODES = { SCROLL: 'SCROLL', PAGINATION: 'PAGINATION' }
const FETCH_MODE = FETCH_MODES.SCROLL
const PER_PAGE = 20

const AllPhotos = () => {

    const [pagination, setPagination] = useState({ page: 1, perPage: PER_PAGE, total: 0 })
    const [list, setList] = useState([])
    const [select, setSelect] = useState(false)
    const [selected, setSelected] = useState({})
    const [listLoading, setListLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [userAlbums, setUserAlbums] = useState({ albums: [], loading: true })
    const [noPhotos, setNoPhotos] = useState(false)
    const [endOfList, setEndOfList] = useState(false)

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)
    const { setLoader } = useContext(LoaderContext)

    const location = useLocation()
    const navigate = useNavigate()

    const listRef = useRef()
    const scrollerRef = useRef()
    const loadMoreDebounceRef = useRef()
    const paginateRef = useRef()

    const addButtonFocus = useFocusable()
    const selectButtonFocus = useFocusable()
    const deleteButtonFocus = useFocusable()
    const addToAlbumButtonFocus = useFocusable()
    const backButtonFocus = useFocusable()

    // load more on scroll
    useEffect(() => {

        if (FETCH_MODE !== FETCH_MODES.SCROLL) return

        const scroller = scrollerRef.current
        let prevScrollTop = 0

        const handleScroll = () => {

            const { scrollTop } = scroller
            const scrollingDown = scrollTop > prevScrollTop
            prevScrollTop = scrollTop

            if (!endOfList && scrollingDown && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 100) {
                clearTimeout(loadMoreDebounceRef.current)
                loadMoreDebounceRef.current = setTimeout(() => paginateRef.current(1), 500)
            }
        }

        scroller.addEventListener('scroll', handleScroll)

        return () => {
            scroller.removeEventListener('scroll', handleScroll)
        }

    }, [])

    // fills screen with photos
    useEffect(() => {

        if (FETCH_MODE !== FETCH_MODES.SCROLL) return

        let rect = listRef.current.getBoundingClientRect()
        if (rect.bottom < window.innerHeight + 100) {
            paginate(1)
        }

    }, [list])

    useEffect(() => {
        if (location.state?.fromAlbum) {
            setSelect(true)
        } else if (location.state?.openUploadModal) {
            uploadPopup()
            navigate(location.pathname, { replace: true })
        }
    }, [])

    useEffect(() => {
        if (userInfo.id) {
            getUserAlbums(userInfo.id)
        }
    }, [userInfo])

    useEffect(() => {
        if (pagination.page === 1) getPhotos(true)
        else getPhotos()
    }, [pagination.page])

    useEffect(() => {
        if (list.length === 0) {
            setNoPhotos(true)
            setEndOfList(false)
        } else {
            setNoPhotos(false)
        }
    }, [list])

    const getUserAlbums = async (userId) => {

        try {
            setUserAlbums((state) => ({ ...state, loading: true }))
            let res = await photoService.getUserAlbums({ userId })
            const albums = res.data.map(({ name, id, cover, has_photos }) => ({ text: name, id, cover, has_photos }))
            // albums.unshift({ text: tempContent.AllPhotos_addToAlbum })
            setUserAlbums((state) => ({ ...state, albums, loading: false }))
        } catch (error) {
            console.log('getUserAlbums Error', error);
        }

    }

    const getPhotos = async (resetList) => {

        setListLoading(true)

        try {
            const { page, perPage } = pagination
            let res = await photoService.getUserPhotos({ page, perPage })

            const { photos, lastPhoto } = res.data

            if (FETCH_MODE === FETCH_MODES.SCROLL && !resetList) {
                setList(prev => [...prev, ...photos?.results])
            } else if (FETCH_MODE === FETCH_MODES.PAGINATION || resetList) {
                setList(photos?.results)
            }

            setListLoading(false)
            setPagination((state) => ({ ...state, total: photos?.total || 0 }))
            setEndOfList(photos?.results?.at(-1)?.id === lastPhoto?.id)


        } catch (error) {
            console.log('getPhotos Error', getPhotos);
        }
    }

    const resetPagination = () => {
        if (pagination.page === 1) getPhotos(true)
        else setPagination({ page: 1, perPage: PER_PAGE, total: 0 })
    }

    const paginate = (up) => {
        if (up && pagination.page < pagination.total / pagination.perPage) {
            setPagination((state) => ({ ...state, page: state.page + 1 }))
        } else if (!up && pagination.page > 1) {
            setPagination((state) => ({ ...state, page: state.page - 1 }))
        }
    }

    useEffect(() => {
        paginateRef.current = paginate
    }, [paginate])

    const uploadPopup = () => {
        toggle({ popupType: 'Upload', payload: { getPhotos, whenFinished: resetPagination } })
    }

    const hitSelect = () => {
        setSelected({})
        setSelect((state) => !state)
    }

    const onSelectItem = ({ currentTarget }) => {
        const { dataset: { photoid } } = currentTarget

        if (!photoid) return

        if (!selected[photoid]) setSelected((state) => ({ ...state, [photoid]: true }))
        else setSelected((state) => ({ ...state, [photoid]: false }))
    }

    const deleteItems = async () => {
        try {
            let ids = []
            Object.keys(selected).forEach((id) => {
                if (selected[id]) ids.push(id)
            })
            setLoader(true)

            setActionLoading(true)
            await photoService.deletePhotos({ ids, user_id: userInfo.id })
            removePhotosFromList(selected)
            hitSelect()

            // getPhotos(true) // ?

            // TODO: consider removing deleted photos from list locally instead of refetching.
            // might be necessary if moving to load-on-scroll instead of pagination.
        } catch (error) {
            console.log('delete photos', error);
        } finally {
            setActionLoading(false)
            setLoader(false)
        }

    }

    const removePhotosFromList = (selectedPhotos) => {
        setList((prev) => prev.filter((photo) => !selectedPhotos[photo.id]))
    }

    const confirmDeletePhotos = () => {
        toggle({
            popupType: 'Confirm',
            payload: {
                okText: tempContent.AllPhotos_delete,
                cancelText: tempContent.AllPhotos_cancel,
                title: tempContent.AllPhotos_deletePhotosPrompt,
                okCallback: async () => {
                    await deleteItems()
                    toggle()
                },
                cancelCallback: toggle
            }
        })
    }

    const addToAlbum = async (album) => {

        let ids = []
        Object.keys(selected).forEach((id) => {
            if (selected[id]) ids.push(id)
        })

        let fromAlbum = location.state?.fromAlbum
        let album_id = fromAlbum ? location.state?.album_id : album.id

        try {
            setActionLoading(true)
            await photoService.addPhotosToAlbum({ ids, user_id: userInfo.id, album_id })
            if (fromAlbum) backToAlbum()
            else hitSelect()
        } catch (error) {
            console.log('error at addToAlbum', error);
        } finally {
            setActionLoading(false)
        }

    }

    const backToAlbum = () => {
        const { album_id } = location.state
        navigate('/auth/albums', { replace: true, state: { album_id } })
    }

    const toggleAddToAlbum = () => {
        toggle({
            popupType: 'AddToAlbum',
            payload: { selectedIds: Object.keys(selected), albums: userAlbums.albums, onAdd: addToAlbum, selected, hitSelect }
        })
    }

    const addingFromAlbum = location.state?.albumName

    const tempContent = {
        AllPhotos_add: "upload photos",
        AllPhotos_select: 'select',
        AllPhotos_cancel: 'cancel',
        AllPhotos_delete: 'Delete',
        AllPhotos_actions: 'Actions',
        AllPhotos_gettingList: 'getting photos',
        AllPhotos_addToAlbum: 'Add photos to album',
        AllPhotos_addFromAlbumTitle: 'Select Photos to add to album:',
        AllPhotos_back: 'Back',
        AllPhotos_add: 'Add',
        AllPhotos_noPhotos: 'no photos',
        AllPhotos_noPhotosAdd: 'click to upload',
        AllPhotos_deletePhotosPrompt: 'Are you sure you want to delete these photos?',
        AllPhotos_endOfList: 'end of list'
    }

    return (
        <div className='all-photos-wrapper'>
            <div className='all-photos-top'>
                <div className='all-photos-btn-row'>
                    {location.state?.fromAlbum ? (
                        <>
                            <button className='back-btn' onClick={backToAlbum} ref={backButtonFocus.ref}>{tempContent.AllPhotos_back}</button>
                            <button className='add-btn' onClick={addToAlbum} ref={addButtonFocus.ref} disabled={!Object.values(selected).find((v) => v === true)}>{tempContent.AllPhotos_add}</button>
                        </>
                    ) : (
                        <>
                            <button className='upload-btn' onClick={uploadPopup} ref={addButtonFocus.ref}>
                                <Icon type='plus' className='btn-icon' />
                                <span>{tempContent.AllPhotos_add}</span>
                            </button>

                            <button
                                className={`select-btn${select ? ' active' : ''}`}
                                onClick={hitSelect}
                                disabled={list.length === 0}
                                ref={selectButtonFocus.ref}
                            >
                                {!select ? <Icon type='select' className='btn-icon' /> : ''}

                                <span>{select ? tempContent.AllPhotos_cancel : tempContent.AllPhotos_select}</span>
                            </button>

                            {Object.values(selected).find((v) => v === true) && (
                                <>

                                    <button className='delete-btn' onClick={confirmDeletePhotos} ref={deleteButtonFocus.ref}>{tempContent.AllPhotos_delete}</button>

                                    {userAlbums.albums.length > 1 && (
                                        <button className='add-to-album-btn' onClick={toggleAddToAlbum} ref={addToAlbumButtonFocus.ref}>{'add to album'}</button>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {actionLoading && <Spinner className='spinner' />}
                </div>

                {location.state?.fromAlbum && (
                    <div className='all-photos-title'>{`${tempContent.AllPhotos_addFromAlbumTitle} ${addingFromAlbum}`}</div>
                )}

                <div className='selected-count'>
                    {Object.values(selected).find((v) => v === true) && !location.state?.fromAlbum ?
                        <span>{`${Object.values(selected).filter((v) => v === true).length} selected`}</span> : ''}
                </div>

            </div>

            <div className='all-photos-list-container' ref={scrollerRef}>
                <div className='all-photos-list' ref={listRef}>

                    {list.map((item, idx) => <ThumbnailSelect params={{ item, onSelectItem, select, selected, disable: actionLoading }} key={idx.toString()} />)}

                    {endOfList ? <div className='end-of-list'>{tempContent.AllPhotos_endOfList}</div> : ''}
                    {listLoading ? <Spinner className='all-photos-loading' /> : ''}
                    {noPhotos && (
                        <div className='no-photos'>
                            <span className='no-photos-text'>{tempContent.AllPhotos_noPhotos}</span>
                            <span className='no-photos-add' onClick={uploadPopup}>{tempContent.AllPhotos_noPhotosAdd}</span>
                        </div>
                    )}
                </div>
            </div>


            {FETCH_MODE === FETCH_MODES.PAGINATION && (pagination.total / pagination.perPage > 1) ? (
                <div className='all-photos-pagination'>
                    <button disabled={pagination.page === 1} onClick={() => paginate(0)}>{"<"}</button>
                    <span>{pagination.page}</span>
                    <button disabled={pagination.page * pagination.perPage >= pagination.total} onClick={() => paginate(1)}>{">"}</button>
                </div>) : ''}
        </div>
    )
}

export default AllPhotos
