import axios from "axios";
 
function setAxiosDefaults (token) {
    if (axios.defaults.baseURL != process.env.REACT_APP_API_URL) {
        axios.defaults.baseURL = process.env.REACT_APP_API_URL
    }
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}

export default setAxiosDefaults