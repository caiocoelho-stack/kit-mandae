import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import QuickLinks from './components/QuickLinks.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import InicioScreen from './screens/InicioScreen.jsx';
import FollowupScreen from './screens/FollowupScreen.jsx';
import ContratoScreen from './screens/ContratoScreen.jsx';
import SlackScreen from './screens/SlackScreen.jsx';
import BriefingScreen from './screens/BriefingScreen.jsx';
import JiraScreen from './screens/JiraScreen.jsx';
import ConcorrenteScreen from './screens/ConcorrenteScreen.jsx';
import EventosScreen from './screens/EventosScreen.jsx';

function App() {
  const [route, setRoute] = useState('home'); // home | inicio | ...
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} navOpen={navOpen} onCloseNav={() => setNavOpen(false)} />
      <Topbar route={route} setRoute={setRoute} onToggleNav={() => setNavOpen(o => !o)} />
      <QuickLinks />
      {route === 'home'        ? <HomeScreen      setRoute={setRoute} /> :
       route === 'inicio'      ? <InicioScreen    setRoute={setRoute} /> :
       route === 'followup'    ? <FollowupScreen  setRoute={setRoute} /> :
       route === 'contrato'    ? <ContratoScreen  setRoute={setRoute} /> :
       route === 'slack'       ? <SlackScreen     setRoute={setRoute} /> :
       route === 'briefing'    ? <BriefingScreen  setRoute={setRoute} /> :
       route === 'jira'        ? <JiraScreen      setRoute={setRoute} /> :
       route === 'concorrente' ? <ConcorrenteScreen setRoute={setRoute} /> :
       route === 'eventos'     ? <EventosScreen   setRoute={setRoute} /> :
       <InicioScreen setRoute={setRoute} />}
    </div>
  );
}

export default App;
