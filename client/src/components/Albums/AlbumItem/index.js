import { useState } from "react"
import spinner from '../../../images/svgs/spinner.svg'
import './album-item.scss'


const AlbumItem = ({ data: { name, id, clickHandler, selectedAlbum } }) => {

    const [loading, setLoading] = useState(false)
    const [edit, setEdit] = useState(false)
    const [newName, setNewName] = useState(name)

    const doSomthing = ({ target }) => {
        if (target.id === 'editAlbumName' || edit) return

        clickHandler(id)

    }

    const toggleEdit = () => {
        setEdit(!edit)
    }

    const cancelEdit = () => {
        setEdit(false)
        setNewName(name)
    }

    const test = async () => {
        console.log('test')

        try {
            setLoading(true)

            console.log('newName', newName);

            // let res = await service.changeAlbumName(id, name)
            console.log('res at changeAlbumName',);

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
        >
            <div className="album-name-container">
                {edit ?
                    <button className="album-item-cancel" disabled={loading} onClick={cancelEdit}>X</button> :
                    <button className="album-item-edit" id="editAlbumName" onClick={toggleEdit}>Edit</button>}
                {edit ?
                    <input type="text" className="album-item-input" value={newName} onChange={(e) => setNewName(e.target.value)} /> :
                    <span>{name}</span>}
                {loading ?
                    <img src={spinner} alt="loading" /> :
                    edit ?
                        <button disabled={loading} className="album-item-submit" onClick={test}>v</button> : ''}
            </div>
        </div>
    )
}

export default AlbumItem