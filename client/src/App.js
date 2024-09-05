// import { AuthContextProvider } from './Contexts/authContext';
import { useContext, useEffect } from 'react';
import { AuthContext } from './Contexts/AuthContext';
import MainRouter from './Routers/MainRouter';
import setAxiosDefaults from './utils/serviceDefaults';
import './App.scss';

function App() {

  const { userInfo } = useContext(AuthContext)

  useEffect(() => {
    setAxiosDefaults(userInfo.token)
  }, [userInfo.token])

  return (
    <div className="App">

      {/* <div style={{
        
        border: 'solid gold 1px',
        width: '200px',
        height: '200px',
        position: 'absolute',
        top: '100px',
        left: '100px'
      }}>
        {JSON.stringify(userInfo)}
      </div> */}


        <MainRouter />
    </div>
  );
}

export default App;
