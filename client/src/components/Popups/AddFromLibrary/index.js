import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../../Contexts/AuthContext"
import { PopupContext } from '../../../Contexts/PopupContext'
import Spinner from '../../Spinner'
import ThumbnailSelect from '../../ThumbnailSelect'
import { photoService } from "../../../services/photoService"
import './add-from-library.scss'

const AddFromLibrary = () => {

    // get all photos
    // dispaly as selectable thumbnails, allow open?
    // a fn (here)/callback (in parent comp) to add selected photos to album

    // pagination / load on scroll
    // pagination probably better for performance

    const { userInfo } = useContext(AuthContext)
    const { toggle } = useContext(PopupContext)

    const [list, setList] = useState() // [] ??
    const [listLoading, setListLoading] = useState(false)
    const [selected, setSelected] = useState({})
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 })  // per-page. how to go about?

    useEffect(() => {
        getPhotos()
    }, [])


    const getPhotos = async () => {

        try {
            const { page, perPage } = pagination
            setListLoading(true)
            let { data } = await photoService.getUserPhotos({ page, perPage })   // { user_id, page, perPage }

            setList(data.results)
            setPagination((prev) => ({ ...prev, total: data.total }))
            // setList
            // setPagination ???  or is it already set before fetch?
        } catch (error) {
            console.log('getPhotos Error', error);
        }

        setListLoading(false)

    }

    const onSelectItem = (id) => {
        if (selected[id]) {
            setSelected((prev) => ({ ...prev, [id]: false }))
        } else {
            setSelected((prev) => ({ ...prev, [id]: true }))
        }
    }

    const submit = () => {
        photoService.addPhotosToAlbum()
    }

    const tempTexts = {
        AddFL_submit: 'Add'
    }

    return (
        <div className="add-fl-wrapper">

            <button className="add-fl-close" onClick={toggle}>+</button>


            <div className="add-fl-list">
                {listLoading ?
                    <Spinner /> : ''}
                {list?.length ?
                    list.map((item) => {

                        return (
                            <ThumbnailSelect params={{ item, onSelectItem, selected }} />
                        )
                    }) : ''}


            </div>
            <button className="add-fl-submit">{tempTexts.AddFL_submit}</button>
        </div>
    )
}

export default AddFromLibrary