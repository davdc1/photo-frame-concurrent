import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContext'
import { PopupContext } from '../../Contexts/PopupContext'
import Select from '../Select'
import Thumbnail from '../Thumbnail'
import ThumbnailSelect from '../ThumbnailSelect'
import { photoService } from '../../services/photoService'
import spinner from '../../images/svgs/spinner.svg'
import './all-photos.scss'

const AllPhotos = () => {

    const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0 })
    const [list, setList] = useState([])
    const [select, setSelect] = useState(false)
    const [selected, setSelected] = useState({})
    const [listLoading, setListLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [userAlbums, setUserAlbums] = useState({ albums: [], loading: true })
    const [noPhotos, setNoPhotos] = useState(false)

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (location.state?.fromAlbum) {
            console.log('onUploadDone???', location.state?.onUploadDone);

            setSelect(true)
        }
    }, [])

    useEffect(() => {
        if (userInfo.id) {
            getUserAlbums(userInfo.id)
        }
    }, [userInfo])

    useEffect(() => {
        getPhotos()
    }, [pagination.page])

    // const getUserAlbums2 = (userId) => {

    //     setUserAlbums((state) => {
    //         photoService.getUserAlbums({ userId })
    //         .then((res) => {
    //             console.log('RESDATA ERROR 222222222', res);

    //             const albums = res.data.map(({ name, id }) => ({ text: name, id }))
    //             albums.unshift({ text: tempContent.AllPhotos_addToAlbum })
    //             setUserAlbums({ albums, loading: false })
    //         })
    //         // .catch((error) => {
    //         //     console.log('EEEERROROR', error);

    //         // })

    //         return { albums: state.albums, loading: true }
    //     })
    // }


    const getUserAlbums = async (userId) => {

        try {
            console.log('first');

            setUserAlbums((state) => ({ ...state, loading: true }))
            let res = await photoService.getUserAlbums({ userId })
            console.log('second');

            const albums = res.data.map(({ name, id }) => ({ text: name, id }))
            albums.unshift({ text: tempContent.AllPhotos_addToAlbum })
            setUserAlbums((state) => ({ ...state, albums, loading: false }))
        } catch (error) {
            console.log('getUserAlbums Error', error);
        }

    }

    const getPhotos = async () => {

        setListLoading(true)

        try {
            const { page, perPage } = pagination
            let res = await photoService.getUserPhotos({ page, perPage })
            const { results, total } = res.data
            setList(results)
            setListLoading(false)
            setPagination((state) => ({ ...state, total }))
            if (results.length === 0 && list.length === 0) {
                setNoPhotos(true)
            } else {
                setNoPhotos(false)
            }
        } catch (error) {
            console.log('getPhotos Error', getPhotos);
        }
    }

    const paginate = (up) => {
        if (up && pagination.page < pagination.total / pagination.perPage) {
            setPagination((state) => ({ ...state, page: state.page + 1 }))
        } else if (!up && pagination.page > 1) {
            setPagination((state) => ({ ...state, page: state.page - 1 }))
        }
    }

    const uploadPopup = () => {
        toggle({ popupType: 'Upload', payload: { getPhotos } })
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

    const deleteItems = () => {
        let ids = []
        Object.keys(selected).forEach((id) => {
            if (selected[id]) ids.push(id)
        })

        setActionLoading(() => {
            photoService.deletePhotos({ ids, user_id: userInfo.id })
                .then(() => {
                    hitSelect()
                    getPhotos()
                })
                .catch((error) => {
                    console.log('delete photos', error);
                })
                .finally(() => {
                    setActionLoading(false)
                })
            return true
        })

    }

    const addToAlbum = (album) => {

        let ids = []
        Object.keys(selected).forEach((id) => {
            if (selected[id]) ids.push(id)
        })

        let fromAlbum = location.state?.fromAlbum
        let album_id = fromAlbum ? location.state?.album_id : album.id

        setActionLoading(() => {
            photoService.addPhotosToAlbum({ ids, user_id: userInfo.id, album_id })
                .then((res) => {
                    if (fromAlbum) {
                        backToAlbum()
                    } else {
                        hitSelect()
                    }
                })
                .catch((error) => {
                    console.log('error at addToAlbum', error);
                })
                .finally(() => setActionLoading(false))
            return true
        })

    }

    const backToAlbum = () => {
        const { album_id } = location.state
        navigate('/auth/albums', { replace: true, state: { album_id } })
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
        AllPhotos_noPhotosAdd: 'click to upload'
    }

    const selectOptions = [
        {
            text: tempContent.AllPhotos_actions
        },
        {
            text: tempContent.AllPhotos_delete,
            optionCallback: deleteItems
        }
    ]

    return (
        <div className='all-photos-wrapper'>
            <div className='all-photos-top-row'>
                {location.state?.fromAlbum ?
                    <>
                        <button onClick={backToAlbum}>{tempContent.AllPhotos_back}</button>
                        <span>{`${tempContent.AllPhotos_addFromAlbumTitle} ${addingFromAlbum}`}</span>
                    </> :
                    <>
                        <button onClick={uploadPopup}>{tempContent.AllPhotos_add}</button>
                        <button onClick={hitSelect}>{select ? tempContent.AllPhotos_cancel : tempContent.AllPhotos_select}</button>
                    </>
                }

                {!location.state?.fromAlbum && Object.values(selected).find((v) => v === true) ?
                    <>
                        <div className='all-photos-actions'>
                            <Select options={selectOptions} />
                        </div>

                        {userAlbums.albums.length > 1 ?
                            <div className='all-photos-select-album'>
                                <Select options={userAlbums.albums} callback={addToAlbum} noSelect={true} />
                            </div> : ''}

                        {`${Object.values(selected).filter((v) => v === true).length} selected`}
                    </> : ''}

                {location.state?.fromAlbum ?
                    <button onClick={addToAlbum} disabled={!Object.values(selected).find((v) => v === true)}>{tempContent.AllPhotos_add}</button> : ''}

                {actionLoading ?
                    <img src={spinner} /> : ''}

            </div>

            <div className='all-photos-list'>

                {listLoading ? <span>{tempContent.AllPhotos_gettingList}</span> : ''}

                {/* {select ?
                    list.map((item, idx) => <ThumbnailSelect params={{ item, onSelectItem, selected, disable: actionLoading }} key={idx.toString()} />) :
                    list.map((item, idx) => <Thumbnail params={{ item }} key={idx.toString()} />)} */}

                {list.map((item, idx) => <ThumbnailSelect params={{ item, onSelectItem, select, selected, disable: actionLoading }} key={idx.toString()} />)}


                {noPhotos ?
                    <div className='no-photos'>
                        <span className='no-photos-text'>{tempContent.AllPhotos_noPhotos}</span>
                        <span className='no-photos-add' onClick={uploadPopup}>{tempContent.AllPhotos_noPhotosAdd}</span>
                    </div> : ''}

            </div>

            <div className='all-photos-pagination'>
                <button onClick={() => paginate(0)}>{"<"}</button>
                <span>{pagination.page}</span>
                <button onClick={() => paginate(1)}>{">"}</button>
            </div>
        </div>
    )
}

export default AllPhotos