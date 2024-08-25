import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Instruction from '../pages/Instructions/Instruction';
import Whiteboard from '../pages/Whiteboard/Whiteboard';
import Image from '../pages/Image/Image';
import PDF from '../pages/PDF/PDF';
import Maths from '../pages/Maths/Maths';
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
