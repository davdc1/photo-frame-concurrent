import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL

export const authService = {
    login: (payload) => axios.post(`/user/login`, { ...payload }),
    refreshAccessToken: (payload) => axios.post('user/refresh-auth', { ...payload }),
    getUserInfo: (payload) => axios.post(`/user/user-info`, { ...payload })
}