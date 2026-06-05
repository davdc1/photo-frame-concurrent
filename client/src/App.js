import { useContext, useEffect } from 'react';
import { AuthContext } from './Contexts/AuthContext';
import { TextContext } from './Contexts/TextContext';
import { init } from "@noriginmedia/norigin-spatial-navigation";
import BottomNav from './components/BottomNav';
import GeneralLoader from './components/GeneralLoader';
import Header from './components/Header';
import MainRouter from './Routers/MainRouter';
import { navLinks } from './utils/navLinks';
import './App.scss';

init({
  debug: false,
  visualDebug: false,
});

function App() {

  const { logout } = useContext(AuthContext)
  const { texts } = useContext(TextContext)

  useEffect(() => {

    window.addEventListener('auth-unauthorized', logout)

    // in order to prevent bottom-nav from jumping up when keyboard opens.
    const handleFocusIn = (e) => {
      if (
        e.target.matches('input, textarea, [contenteditable="true"]')
      ) {
        document.body.classList.add('keyboard-open');
      }
    };

    const handleFocusOut = () => {
      document.body.classList.remove('keyboard-open');
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('auth-unauthorized', logout)
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    }
  }, [])

  return (
    <div className="App" style={{ paddingTop: '50px' }}>
      <Header title="" />
      <MainRouter />
      <GeneralLoader />
      {window.innerWidth < 768 ?
        <BottomNav links={navLinks} /> : ''}
    </div>
  );
}

export default App;
