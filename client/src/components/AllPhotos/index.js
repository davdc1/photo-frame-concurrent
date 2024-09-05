import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Contexts/AuthContext'
import { PopupContext } from '../../Contexts/PopupContext'
import Select from '../Select'
import Thumbnail from '../Thumbnail'
import ThumbnailSelect from '../ThumbnailSelect'
import { photoService } from '../../services/photoService'
import spinner from '../../images/svgs/spinner.svg'
import './all-photos.scss'

const AllPhotos = () => {

    const [pagination, setPagination] = useState({ page: 1, perPage: 5, total: 0 })
    const [list, setList] = useState([])
    const [select, setSelect] = useState(false)
    const [selected, setSelected] = useState({})
    const [listLoading, setListLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)


    useEffect(() => {
        getPhotos()
    }, [pagination.page])


    const getPhotos = () => {
        const { page, perPage } = pagination
        setListLoading(() => {
            photoService.getUserPhotos({ user_id: userInfo.id, page, perPage })
            .then((res) => {
                const { results, total } = res.data
                setList(results)
                setListLoading(false)
                setPagination((state) => ({ ...state, total }))
            })
            return true
        })
    }

    const paginate = (up) => {
        if (up && pagination.page < pagination.total / pagination.perPage) {
            setPagination((state) => ({ ...state, page: state.page + 1 }))
        } else if (!up && pagination.page > 1) {
            setPagination((state) => ({ ...state, page: state.page - 1 }))
        }
    }

    const uploadPopup = () => {
        toggle({ popupType: 'Upload' })
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

        setDeleteLoading(() => {
            photoService.deletePhotos({ ids, user_id: userInfo.id })
            .then((res) => {
                console.log('res delete photos', res);
                hitSelect()
                getPhotos()
            })
            .catch((error) => {
                console.log('delete photos', error);
            })
            .finally(() => {
                setDeleteLoading(false)
            })
            return true
        })
        
    }

    const tempContent = {
        AllPhotos_add: "upload photos",
        AllPhotos_select: 'select',
        AllPhotos_cancel: 'cancel',
        AllPhotos_delete: 'Delete',
        AllPhotos_actions: 'Actions',
        AllPhotos_gettingList: 'getting photos'
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
                <button onClick={uploadPopup}>{tempContent.AllPhotos_add}</button>
                <button onClick={hitSelect}>{select ? tempContent.AllPhotos_cancel : tempContent.AllPhotos_select}</button>
                {Object.values(selected).find((v) => v === true) ?
                    <div className='all-photos-actions'>
                        <Select options={selectOptions} />
                    </div> : ''}

                {deleteLoading ?
                    <img src={spinner} /> : ''}

            </div>

            <div className='all-photos-list'>

                {listLoading ? <span>{tempContent.AllPhotos_gettingList}</span> : ''}
                
                {select ?
                    list.map((item, idx) => <ThumbnailSelect params={{ item, onSelectItem, selected, deleteLoading }} />) :
                    list.map((item, idx) => <Thumbnail params={{ item }} />)}

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