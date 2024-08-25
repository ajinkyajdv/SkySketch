import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/Home/Home';
import Instruction from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/Instructions/Instruction';
import Whiteboard from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/Whiteboard/Whiteboard';
import Image from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/Image/Image';
import PDF from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/PDF/PDF';
import Maths from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/pages/Maths/Maths';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instruction" element={<Instruction />} />
          <Route path="/Whiteboard" element={<Whiteboard />} />
          <Route path="/Image" element={<Image />} />
          <Route path="/PDF" element={<PDF />} />
          <Route path="/Maths" element={<Maths />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
