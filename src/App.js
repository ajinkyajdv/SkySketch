import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Instruction from './pages/Instructions/Instruction';
import LandingPage from './pages/LandingPage/landingpage';
import Login from './pages/LoginPage/LoginPage';
import Register from './pages/LoginPage/register';
import Whiteboard from './pages/Whiteboard/Whiteboard';
import Image from './pages/Image/Image';
import SkyAI from './pages/SkyAI/SkyAI';
import Maths from './pages/Maths/Maths';
import Threed from './pages/Threed/Threed';
import PPT from './pages/PPT/PPT';

const App = () => (
  <Router>
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/instruction" element={<Instruction />} />
        <Route path="/Whiteboard" element={<Whiteboard />} />
        <Route path="/Image" element={<Image />} />
        <Route path="/SkyAI" element={<SkyAI />} />
        <Route path="/Maths" element={<Maths />} />
        <Route path="/Threed" element={<Threed />} />
        <Route path="/PPT" element={<PPT />} />
      </Routes>
    </>
  </Router>
);

export default App;
