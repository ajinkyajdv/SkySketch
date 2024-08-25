import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const Whiteboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(true);
  const buttonRef = useRef(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    const ctx = canvasElement.getContext('2d');
    const buttonElement = buttonRef.current;

    canvasElement.width = window.innerWidth * 0.75;
    canvasElement.height = window.innerHeight;
    drawingCanvasElement.width = window.innerWidth * 0.75;
    drawingCanvasElement.height = window.innerHeight;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexFingerTip = landmarks[8];
        const middleFingerTip = landmarks[12];
        const x = indexFingerTip.x * canvasElement.width;
        const y = indexFingerTip.y * canvasElement.height;
        const invertedX = canvasElement.width - x;

        drawLandmarks(landmarks, ctx);

        const numFingers = countFingers(landmarks);

        if (numFingers === 1 && drawing) {
          if (prevPosition.current.x !== 0 && prevPosition.current.y !== 0) {
            drawFromPreviousPosition(
              prevPosition.current.x,
              prevPosition.current.y,
              invertedX,
              y,
              drawingCtx
            );
          }
          prevPosition.current = { x: invertedX, y };
        } else if (numFingers === 2) {
          setDrawing(false);
          prevPosition.current = { x: 0, y: 0 };

          const buttonRect = buttonElement.getBoundingClientRect();
          if (
            isFingerNearButton(invertedX, y, buttonRect) &&
            isFingerNearButton(
              middleFingerTip.x * canvasElement.width,
              middleFingerTip.y * canvasElement.height,
              buttonRect
            )
          ) {
            handleGeminiAI();
          }
        } else {
          setDrawing(true);
        }
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    camera.start();

    function drawLandmarks(landmarks, ctx) {
      landmarks.forEach((landmark) => {
        const x = landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;
        ctx.beginPath();
        ctx.arc(canvasElement.width - x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    }

    function drawFromPreviousPosition(prevX, prevY, currX, currY, ctx) {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currX, currY);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    function countFingers(landmarks) {
      const thumbTip = landmarks[4];
      const indexFingerTip = landmarks[8];
      const middleFingerTip = landmarks[12];
      const ringFingerTip = landmarks[16];
      const pinkyTip = landmarks[20];

      let fingers = 0;

      if (indexFingerTip.y < thumbTip.y) fingers++;
      if (middleFingerTip.y < thumbTip.y) fingers++;
      if (ringFingerTip.y < thumbTip.y) fingers++;
      if (pinkyTip.y < thumbTip.y) fingers++;

      return fingers;
    }

    function isFingerNearButton(fingerX, fingerY, buttonRect) {
      const buffer = 20;
      return (
        fingerX > buttonRect.left - buffer &&
        fingerX < buttonRect.right + buffer &&
        fingerY > buttonRect.top - buffer &&
        fingerY < buttonRect.bottom + buffer
      );
    }
  }, []);

  const handleGeminiAI = () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const imageData = drawingCanvasElement.toDataURL('image/png');

    console.log('Sending image data to Gemini AI:', imageData); // Log image data

    // API call to Gemini AI
    fetch('https://api.gemini.ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer AIzaSyApws0mJT_dIwM9vEXrRuFfUSdlxhIOt5w`,
      },
      body: JSON.stringify({ image: imageData }),
    })
      .then((response) => {
        console.log('Response from Gemini AI:', response); // Log response object
        return response.json();
      })
      .then((data) => {
        console.log('Data from Gemini AI:', data); // Log parsed data
        setAnswer(data.answer); // Assuming 'answer' is the field in the API response
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="home-main" style={{ display: 'flex', height: '100vh' }}>
      {/* Left Side - Canvas */}
      <div style={{ flex: 3, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
          }}
        />
        <canvas
          ref={drawingCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            backgroundColor: 'transparent',
          }}
        />
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '300px',
            border: '2px solid #000',
          }}
          autoPlay
        />
        <button
          ref={buttonRef}
          onClick={handleGeminiAI}
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 10, // Ensure it's on top of other elements
          }}
        >
          Gemini AI
        </button>
      </div>

      {/* Right Side - Answer Section */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f7f7f7',
          borderLeft: '2px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <h3>Gemini AI Answer</h3>
        <div
          style={{
            padding: '10px',
            backgroundColor: 'black',
            border: '1px solid #ddd',
            borderRadius: '5px',
            minHeight: '100px',
            color: 'white',
          }}
        >
          {answer ? <p>{answer}</p> : <p>No answer yet. Draw a problem and click "Gemini AI" to get an answer.</p>}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
