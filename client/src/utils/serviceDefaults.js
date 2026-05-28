import axios from "axios";
import { localStorageKeys } from "./consts";
 
export function setAxiosDefaults (token) {
    if (axios.defaults.baseURL != process.env.REACT_APP_API_URL) {
        axios.defaults.baseURL = process.env.REACT_APP_API_URL
    }
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}


let isRefreshing = false
let queue = [] // stores { resolve, reject } pairs
let interceptorsInstalled = false

export function axiosIntercept () {
    if (interceptorsInstalled) return
    interceptorsInstalled = true

    axios.interceptors.response.use(
        (res) => res,
        async (error) => {

          const origReq = error.config

          if (error.response?.status === 401 && !origReq._retry) {
            
            origReq._retry = true

            if (isRefreshing) {
              // Queue this request — it will be retried once refresh completes
              return new Promise((resolve, reject) => {
                queue.push({ resolve, reject })
              }).then((newToken) => {
                origReq.headers['Authorization'] = `Bearer ${newToken}`
                return axios(origReq)
              })
            }

            isRefreshing = true

            try {
              const accessToken = await refreshTokens()

              origReq.headers['Authorization'] = `Bearer ${accessToken}`

              // Flush queue — resolve all waiting requests with the new token
              queue.forEach(({ resolve }) => resolve(accessToken))
              queue = []

              return axios(origReq)
            } catch (refreshError) {
              // Flush queue — reject all waiting requests cleanly
              queue.forEach(({ reject }) => reject(refreshError))
              queue = []
              return Promise.reject(refreshError)
            } finally {
              isRefreshing = false
            }

          } else if (error.response?.status === 403) {
            window.dispatchEvent(new Event("auth-unauthorized"));
          }
          return Promise.reject(error);
        }
      );
}


export async function refreshTokens () {
  try {
      let res = await axios.post('/user/refresh-auth', {}, { withCredentials: true })

      const { accessToken } = res.data
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      let store = JSON.parse(localStorage.getItem(localStorageKeys.FRAME_APP_STORE) || '{}')
      store.accessToken = accessToken
      localStorage.setItem(localStorageKeys.FRAME_APP_STORE, JSON.stringify(store))

      return accessToken
  } catch (error) {
      console.log('refreshTokens', error)
      throw error // propagate — do NOT return undefined
  }
}



// TODO:
// export axios instance from here, and import it to use across the app.

