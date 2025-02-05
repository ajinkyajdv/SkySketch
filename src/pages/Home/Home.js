import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { Player } from '@lottiefiles/react-lottie-player'; 
import whiteboardAnimation from './Animation/whiteboard.json'; 
import uploadImageAnimation from './Animation/uploadImage.json';
import uploadPdfAnimation from './Animation/uploadPdf.json';
import uploadPptAnimation from './Animation/uploadPpt.json';
import upload3dModelAnimation from './Animation/upload3dModel.json';
import solveMathAnimation from './Animation/solveMath.json';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };
  return (
    <div className='home-container'>
      {/* Navbar */}
      <div className='navbar'>
        <div className='navbar-left'>
          <h1 className='ri-quill-pen-line nav__logo-icon navbar-heading'> SkySketch</h1>
        </div>
        <div className='navbar-right'>
          <Link to='/instruction'>
            <button className="btn btn-secondary" id="about-btn">
              Instruction
            </button>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
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
            <h2>SkyBot</h2>
            <Link to='/SkyAI'>
              <button className="btn start-btn">Chat</button>
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
