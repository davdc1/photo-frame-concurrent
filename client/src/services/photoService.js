import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL

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

  // seperate service file?
  getUserAlbums: (payload) => axios.get('/albums', { params: payload }),
  getAlbumPhotos: (payload) => axios.get('/albums/album-photos', { params: payload }),
  uploadPhotos: (payload) => axios.post('/photos/upload-photos', payload),
  deleteFailedUpload: (payload) => axios.delete('/photos/failed-upload', { params: payload }),
  deletePhotos: (payload) => axios.delete('/photos/delete', { params: payload }),
    
}