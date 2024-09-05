import './album-item.scss'

const AlbumItem = ({ data: { name, id, clickHandler } }) => {

    const doSomthing = () => {
        clickHandler(id)
    }

    return (
        <div
            className="album-item-wrapper"
            onClick={doSomthing}
        >
            <span>{name}</span>
        </div>
    )
}

export default AlbumItem