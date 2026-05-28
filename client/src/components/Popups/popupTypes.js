import AddFromLibrary from "./AddFromLibrary";
import AddPhotosPopup from "./AddPhotos";
import AddToAlbum from "./AddToAlbum";
import ConfirmPopup from "./Confirm";
import NewAlbum from "./NewAlbum";
import PhotoPrev from "./PhotoPrev2";
import PlayListPopup from "./PlayList";
import UploadDone from "./UploadDone";
import UploadPopup from "./UploadPhotos";

export default {
    PlayList: <PlayListPopup />,
    PhotoPrev: <PhotoPrev />,
    AddPhotos: <AddPhotosPopup />,
    Upload: <UploadPopup />,
    UploadDone: <UploadDone />,
    Confirm: <ConfirmPopup />,
    NewAlbum: <NewAlbum />,
    AddFromLibrary: <AddFromLibrary />,
    AddToAlbum: <AddToAlbum />
}