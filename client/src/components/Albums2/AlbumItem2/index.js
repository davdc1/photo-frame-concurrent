import { useContext, useState } from "react"
import { PopupContext } from "../../../Contexts/PopupContext"
import { TextContext } from "../../../Contexts/TextContext"
import Icon from "../../Icon"
import { photoService } from "../../../services/photoService"
import './album-item.scss'


const AlbumItem = ({ data: { name, id, cover, photo_count, clickHandler, selectedAlbum }, deleteAlbum, getAlbums }) => {

    const [loading, setLoading] = useState(false)
    const [edit, setEdit] = useState(false)
    const [newName, setNewName] = useState(name)
    const [showMenu, setShowMenu] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const { toggle } = useContext(PopupContext)
    const { texts } = useContext(TextContext)
    const compTexts = JSON.parse(texts['AlbumItem'] || '{}')

    const doSomthing = ({ target }) => {
        if (target.closest('.album-item-menu-container') || edit) return
        clickHandler(id)
    }

    const toggleEdit = () => {
        setEdit(!edit)
        setShowMenu(false)
    }

    const cancelEdit = () => {
        setEdit(false)
        setNewName(name)
    }

    const handleDelete = (e) => {
        e.stopPropagation()
        // deleteAlbum(id)
        confirmDelete()
    }

    const handleLoad = () => {
        setLoaded(true)
    }

    const toggleMenu = (e) => {
        e.stopPropagation()
        setShowMenu(!showMenu)
    }

    const saveName = async () => {
        try {
            setLoading(true)
            await photoService.renameAlbum({ albumId: id, name: newName })
            getAlbums()
        } catch (error) {
            console.log('changeAlbumName error', error);
        } finally {
            setLoading(false)
            setEdit(false)
        }
    }

    const confirmDelete = () => {
        toggle({
            popupType: 'Confirm',
            payload: {
                okText: compTexts.AlbumItem_yes,
                cancelText: compTexts.AlbumItem_no,
                title: compTexts.AlbumItem_deletePrompt,
                okCallback: async () => {
                    await deleteAlbum(id)
                    toggle()
                },
                cancelCallback: toggle
            }
        })
    }



    return (
        <div
            className={`album-item-wrapper2 ${selectedAlbum == id ? 'selected' : ''}`}
            onClick={doSomthing}
            onMouseLeave={() => setShowMenu(false)}
        >

            <div className="album-item-menu-container">
                {showMenu && (
                    <div className="album-item-menu-dropdown">
                        <button onClick={toggleEdit} className="album-item-btn rename">{compTexts.AlbumItem_rename}</button>
                        <button onClick={handleDelete} className="album-item-btn delete">{compTexts.AlbumItem_delete}</button>
                    </div>
                )}
                <button className="album-item-menu-btn" onClick={toggleMenu}>
                    {/* ⋮ */}
                    <span className="album-item-dot"></span>
                    <span className="album-item-dot"></span>
                    <span className="album-item-dot"></span>
                </button>
            </div>

            {photo_count ? (
                <>
                    {!loaded ?
                        <div className="album-item-skeleton">
                            <Icon type="spinner" className={'album-skeleton-spinner'} />
                        </div> : ''}
                    <img src={cover} alt="cover" className="album-item-cover" onLoad={handleLoad} />
                </>
            ) :
                <div className="album-item-cover empty">
                    <span className="album-item-empty">{compTexts.AlbumItem_empty}</span>
                </div>
            }
            <div className="album-item-bottom">
                <div className="album-item-text">
                    {
                        edit ? (
                            <div className="edit-mode">
                                <input disabled={loading} type="text" className="album-item-input" value={newName} onChange={(e) => setNewName(e.target.value)} onClick={(e) => e.stopPropagation()} />
                                {
                                    loading ? (
                                        <Icon type="spinner" className={'album-item-spinner'} />
                                    ) : (
                                        <>
                                            <button disabled={loading} className="album-rename-ok" onClick={saveName}>v</button>
                                            <button className="album-rename-cancel" disabled={loading} onClick={cancelEdit}>X</button>
                                        </>
                                    )
                                }
                            </div>
                        ) :
                            <span className="album-item-name">{name}</span>
                    }
                    <span className="album-item-photo-count">{`${photo_count || 0} ${compTexts.AlbumItem_photoCount}`}</span>
                </div>

            </div>

        </div>
    )
}

export default AlbumItem