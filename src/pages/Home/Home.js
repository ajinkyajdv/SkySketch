import React from 'react';
import { Link } from 'react-router-dom';
import 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/App.css';

export default function Home() {
  return (
    <div className='home-container'>
      <div className='home-header'>
        <div className='header-content'>
          <h1 className='home-heading'>SkySketch</h1>
          <Link to='/instruction'>
            <button className="btn btn-secondary" id="about-btn">
              Instruction
            </button>
          </Link>
        </div>
      </div>

      <h1 className="description">An interactive fingertip teaching</h1>

      <div className="home-main">
        <div className="btn-section">
          <div className="column">
            <h2>Use Whiteboard</h2>
            <Link to='/Whiteboard'>
              <button className="btn start-btn">Start Whiteboard</button>
            </Link>
          </div>

          <div className="column">
            <h2>Upload Image</h2>
            <Link to='/Image'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>

          <div className="column">
            <h2>Upload PDF</h2>
            <Link to='/PDF'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>
        </div>

        <div className="centered-column">
          <h2>Draw and Solve Math Problem</h2>
          <Link to='/Maths'>
            <button className="btn start-btn">Start Solving</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
