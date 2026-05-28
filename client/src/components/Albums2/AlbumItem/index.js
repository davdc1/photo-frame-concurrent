import { useState } from "react"
import spinner from '../../../images/svgs/spinner.svg'
import './album-item.scss'


const AlbumItem = ({ data: { name, id, cover, photo_count, clickHandler, selectedAlbum }, deleteAlbum }) => {

    const [loading, setLoading] = useState(false)
    const [edit, setEdit] = useState(false)
    const [newName, setNewName] = useState(name)
    const [showMenu, setShowMenu] = useState(false)

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
        deleteAlbum(id)
    }

    const toggleMenu = (e) => {
        e.stopPropagation()
        setShowMenu(!showMenu)
    }

    const saveName = async () => {
        console.log('test')

        try {
            setLoading(true)
            // let res = await service.changeAlbumName(id, name)

        } catch (error) {
            console.log('changeAlbumName error', error);

        } finally {
            setLoading(false)
            setEdit(false)
        }
    }

    return (
        <div
            className={`album-item-wrapper ${selectedAlbum == id ? 'selected' : ''}`}
            onClick={doSomthing}
            onMouseLeave={() => setShowMenu(false)}
        >
            <div className="album-name-container">

                <div className="album-item-menu-container">
                    <button className="album-item-menu-btn" onClick={toggleMenu}>
                        ⋮
                    </button>
                    {showMenu && (
                        <div className="album-item-menu-dropdown">
                            <button onClick={toggleEdit}>Rename</button>
                            <button onClick={handleDelete} className="delete-btn">Delete</button>
                        </div>
                    )}
                </div>

                {edit ?
                    <div className="edit-mode">
                        <input type="text" className="album-item-input" value={newName} onChange={(e) => setNewName(e.target.value)} onClick={(e) => e.stopPropagation()} />
                        <button className="album-item-cancel" disabled={loading} onClick={cancelEdit}>X</button>
                        <button disabled={loading} className="album-item-submit" onClick={saveName}>v</button>
                    </div>
                    :
                    <>
                        <span>{name}</span>
                        {/* <img src={cover} alt="cover" /> */}
                    </>}
                {loading ? <img src={spinner} alt="loading" /> : ''}
            </div>




            <img src={cover} alt="cover" className="album-item-cover" />
            <div className="album-item-bottom">
                <div className="album-item-text">
                    <span className="album-item-name">{name}</span>
                    <span className="album-item-photo-count">{photo_count}</span>
                </div>

                <div className="album-item-menu-container">
                    <button className="album-item-menu-btn" onClick={toggleMenu}>
                        ⋮
                    </button>
                    {showMenu && (
                        <div className="album-item-menu-dropdown">
                            <button onClick={toggleEdit}>Rename</button>
                            <button onClick={handleDelete} className="delete-btn">Delete</button>
                        </div>
                    )}
                </div>

            </div>




        </div>
    )
}

export default AlbumItem