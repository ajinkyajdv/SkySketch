import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie Player
import whiteboardAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/whiteboard.json'; // Add the path to your Lottie JSON
import uploadImageAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/uploadImage.json';
import uploadPdfAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/uploadPdf.json';
import uploadPptAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/uploadPpt.json';
import upload3dModelAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/upload3dModel.json';
import solveMathAnimation from 'C:/Users/ajayj/OneDrive/Desktop/SkySketch/project/src/Animation/solveMath.json';
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
        {/* First row of buttons */}
        <div className="btn-section">
          <div className="column">
            <Player
              autoplay
              loop
              src={whiteboardAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Use Whiteboard</h2>
            <Link to='/Whiteboard'>
              <button className="btn start-btn">Start Whiteboard</button>
            </Link>
          </div>

          <div className="column">
            <Player
              autoplay
              loop
              src={uploadImageAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Upload Image</h2>
            <Link to='/Image'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>

          <div className="column">
            <Player
              autoplay
              loop
              src={uploadPdfAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Upload PDF</h2>
            <Link to='/PDF'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>
        </div>

        {/* Second row of buttons */}
        <div className="btn-section">
          <div className="column">
            <Player
              autoplay
              loop
              src={uploadPptAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Upload PPT</h2>
            <Link to='/ppt'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>

          <div className="column">
            <Player
              autoplay
              loop
              src={upload3dModelAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Upload 3D Model</h2>
            <Link to='/Threed'>
              <button className="btn start-btn">Upload</button>
            </Link>
          </div>

          <div className="column">
            <Player
              autoplay
              loop
              src={solveMathAnimation}
              style={{ height: '150px', width: '150px' }}
            />
            <h2>Draw and Solve Math Problem</h2>
            <Link to='/Maths'>
              <button className="btn start-btn">Start Solving</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
