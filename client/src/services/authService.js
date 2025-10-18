import axios from "axios";

export const authService = {
    login: (payload) => axios.post(`/user/login`, { ...payload }),
    refreshAccessToken: (payload) => axios.post('user/refresh-auth', { ...payload }),
    getUserInfo: (payload) => axios.post(`/user/user-info`, { ...payload })
}