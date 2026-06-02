import axios from "axios";

export const textService = {
    getTextsByLng: (payload) => axios.get('/texts', { params: payload }),
}