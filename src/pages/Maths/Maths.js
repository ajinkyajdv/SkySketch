import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Ensure the package is installed

// Hardcoded API key (not recommended for production)
const genAI = new GoogleGenerativeAI('AIzaSyAZZdK1pVkG3gYvmonOINJRZjD_V4bYvr0');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Whiteboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(true);
  const buttonRef = useRef(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState(''); // State for the text input

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    const ctx = canvasElement.getContext('2d');
    const buttonElement = buttonRef.current;

    // Set canvas dimensions
    canvasElement.width = window.innerWidth * 0.8; // Adjusted width for right section
    canvasElement.height = window.innerHeight;
    drawingCanvasElement.width = canvasElement.width;
    drawingCanvasElement.height = canvasElement.height;

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

  const handleGeminiAI = async () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const imageData = drawingCanvasElement.toDataURL('image/png');

    console.log("Image Data URL:", imageData); // Log the data URL for debugging

    const prompt = 'Analyze this image of a drawing and describe how the depicted product might be manufactured. Here is the image:';
    const imagePart = fileToGenerativePart(imageData, 'image/png');

    try {
      const result = await model.generateContent([prompt, imagePart]);
      console.log("AI Response:", result); // Log the AI response for debugging
      setAnswer(result.response.text());
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get an answer from Gemini AI. Please try again.'); // Display error message
    }
  };

  const handleTextSubmit = async () => {
    const prompt = `Analyze the following text and provide a detailed explanation: ${textInput}`;
    try {
      const result = await model.generateContent([prompt]);
      console.log("AI Response from text input:", result);
      setAnswer((prev) => prev + "\n" + result.response.text()); // Append new answer to previous answer
      setTextInput(''); // Clear the text input after submission
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get an answer from Gemini AI. Please try again.'); // Display error message
    }
  };

  function fileToGenerativePart(dataUrl, mimeType) {
    return {
      inlineData: {
        data: dataUrl.split(',')[1], // Get the base64 part of the data URL
        mimeType,
      },
    };
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left Side - Canvas */}
      <div style={{ flex: 0.8, position: 'relative' }}>
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
        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your text here..."
            style={{
              padding: '10px',
              marginRight: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              flex: 1,
            }}
          />
          <button
            onClick={handleTextSubmit}
            aria-label="Submit text input"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
            }}
          >
            Submit
          </button>
          <button
            ref={buttonRef}
            onClick={handleGeminiAI}
            aria-label="Get answer from Gemini AI"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: '10px',
              transition: 'background-color 0.3s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'; // Darker blue on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007BFF'; // Original color
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.5)'; // Outline on focus
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'; // Remove outline when not focused
            }}
          >
            Gemini AI
          </button>
        </div>
      </div>

      {/* Right Side - Answer Section */}
      <div
        style={{
          flex: 0.2,
          padding: '20px',
          backgroundColor: '#f7f7f7',
          borderLeft: '2px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          color: 'black',
          width: '300px', // Fixed width for the answer section
          maxHeight: '700px', // Set a fixed height
          overflow: 'auto', // Enable scrolling for overflowing content
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>AI Generated Answer</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{answer || 'Your answer will appear here.'}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Whiteboard;
