import axios from "axios";

export const authService = {
    register: (payload) => axios.post('/user/register', payload),
    login: (payload) => axios.post(`/user/login`, { ...payload }, { withCredentials: true }),
    logout: () => axios.post('/user/logout', {}, { withCredentials: true }),
    refreshAccessToken: (payload) => axios.post('user/refresh-auth', { ...payload }),
    getUserInfo: (payload) => axios.post(`/user/user-info`, { ...payload })
}