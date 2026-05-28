import axios from "axios";

export const photoService = {
  getPhotos: (payload) => axios.get(`/photos`, {
    responseType: "arraybuffer",
    timeout: 100000,
    params: { ...payload }
  }),

  newSession: (payload) => axios.get(`/photos/new-session`, { params: { ...payload } }),
  retrieveSession: (payload) => axios.get(`/photos/retrieve-session`, { params: { ...payload } }),
  getSessionPhoto: (payload) => axios.get(`/photos/session-photo`, { params: { ...payload }, /* responseType: "arraybuffer" */ }),
  getPhotopPrev: (payload) => axios.get(`/photos/prev`, { params: payload }),
  getUserPhotos: (payload) => axios.get(`/photos/thumbnails`, { params: payload }),
  getUserPhotoCount: (payload) => axios.get(`/photos/user-photo-count`, { params: payload }),

  // album related. seperate service file?
  getUserAlbums: (payload) => axios.get('/albums', { params: payload }),
  getAlbumPhotos: (payload) => axios.get('/albums/album-photos', { params: payload }),
  uploadPhotos: (payload) => axios.post('/photos/upload-photos', payload),
  confirmUpload: (payload) => axios.post('/photos/confirm-upload', payload),
  deleteFailedUpload: (payload) => axios.delete('/photos/failed-upload', { params: payload }),
  deletePhotos: (payload) => axios.delete('/photos/delete', { params: payload }),
  addPhotosToAlbum: (payload) => axios.post('/albums/add-to-album', payload),
  changeAlbumPhotoOrder: (payload) => axios.post('/albums/change-photo-order', payload),
  createNewAlbum: (payload) => axios.post('/albums/new-album', payload),
  deleteAlbum: (payload) => axios.delete('/albums/delete', { data: payload }),
  renameAlbum: (payload) => axios.put('/albums/rename', payload),
  removeAlbumPhotos: (payload) => axios.delete('/albums/remove-photos', { data: payload }),
  llmCreateAlbum: (payload) => axios.post('/llm/create-album', payload)
}