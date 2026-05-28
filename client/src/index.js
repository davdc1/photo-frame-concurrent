import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './Contexts/AuthContext';
import { PopupContextProvider } from './Contexts/PopupContext';
import { ThemeContextProvider } from './Contexts/ThemeContext';
import { LoaderContextProvider } from './Contexts/LoaderContext';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { setAxiosDefaults, axiosIntercept } from './utils/serviceDefaults';
import { localStorageKeys } from './utils/consts';
import { initStorage } from './utils/initStorage';
import ErrorBoundary from './components/ErrorBoundary';

initStorage()

let { accessToken } = JSON.parse(localStorage.getItem(localStorageKeys.FRAME_APP_STORE) || '{}')
setAxiosDefaults(accessToken)
// Install before React mounts so child useEffects (e.g. Albums) are not racing App’s useEffect.
axiosIntercept()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <ErrorBoundary>
    <BrowserRouter>
      <AuthContextProvider>
        <ThemeContextProvider>
          <LoaderContextProvider>
            <PopupContextProvider>
              <App />
            </PopupContextProvider>
          </LoaderContextProvider>
        </ThemeContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </ErrorBoundary>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
