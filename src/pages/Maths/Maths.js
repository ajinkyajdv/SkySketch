import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI with API Key from environment variables
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
  const [textInput, setTextInput] = useState('');
  const [showCanvas, setShowCanvas] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    const ctx = canvasElement.getContext('2d');
    const buttonElement = buttonRef.current;

    // Set canvas dimensions
    canvasElement.width = window.innerWidth * 0.8;
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
  }, []);

  // Drawing and AI interaction functions
  const drawLandmarks = (landmarks, ctx) => {
    landmarks.forEach((landmark) => {
      const x = landmark.x * canvasRef.current.width;
      const y = landmark.y * canvasRef.current.height;
      ctx.beginPath();
      ctx.arc(canvasRef.current.width - x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  };

  const drawFromPreviousPosition = (prevX, prevY, currX, currY, ctx) => {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  const countFingers = (landmarks) => {
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
  };

  const isFingerNearButton = (fingerX, fingerY, buttonRect) => {
    const buffer = 20;
    return (
      fingerX > buttonRect.left - buffer &&
      fingerX < buttonRect.right + buffer &&
      fingerY > buttonRect.top - buffer &&
      fingerY < buttonRect.bottom + buffer
    );
  };

  const normalizeText = (text) => {
    return text
      .replace(/(\*\s?)/g, '') // Remove bullet points
      //.replace(/(\n\n|\r\n|\r)/g, '\n') // Replace double line breaks with single
      .trim(); // Trim whitespace
  };

  const handleGeminiAI = async () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const imageData = drawingCanvasElement.toDataURL('image/png');

    const prompt = 'Analyze this image of a drawing and describe how the depicted product might be manufactured. Here is the image:';
    const imagePart = fileToGenerativePart(imageData, 'image/png');

    try {
      const result = await model.generateContent([prompt, imagePart]);
      setAnswer(normalizeText(result.response.text()));
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get an answer from Gemini AI. Please try again.');
    }
  };

  const handleTextSubmit = async () => {
    const prompt = `Analyze the following text and provide a detailed explanation: ${textInput}`;
    try {
      const result = await model.generateContent([prompt]);
      setAnswer(normalizeText(result.response.text()));
      setTextInput('');
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get an answer from Gemini AI. Please try again.');
    }
  };

  const fileToGenerativePart = (dataUrl, mimeType) => ({
    inlineData: {
      data: dataUrl.split(',')[1],
      mimeType,
    },
  });

  return (
    <div style={{ display: 'flex', height: '98vh', width: '100vw' }}>
      {showCanvas ? (
        <div style={{ flex: 0.8, position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', backgroundColor: 'white' }} />
          <canvas ref={drawingCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'transparent' }} />
          <video ref={videoRef} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '300px', border: '2px solid #000' }} autoPlay />
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
            <button ref={buttonRef} onClick={handleGeminiAI} aria-label="Get answer from Gemini AI" style={buttonStyle}>
              Gemini AI
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 0.8, padding: '20px', backgroundColor: '#f7f7f7' }}>
          <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type your text here..." style={inputStyle} />
          <button onClick={handleTextSubmit} aria-label="Text input" style={submitButtonStyle}>
            Submit
          </button>
        </div>
      )}
      <div style={answerSectionStyle}>
        <h2 style={{ marginBottom: '20px' }}>AI Generated Answer</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{answer || 'Your answer will appear here.'}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
        <button onClick={() => setShowCanvas(true)} style={toggleButtonStyle}>
          Canvas
        </button>
        <button onClick={() => setShowCanvas(false)} style={toggleButtonStyle}>
          Show Text Input
        </button>
      </div>
    </div>
  );
};

// Button styles (to avoid inline styling clutter)
const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginLeft: '10px',
  transition: 'background-color 0.3s, transform 0.2s',
};

const inputStyle = {
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  width: '100%',
};

const submitButtonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.2s',
};

const answerSectionStyle = {
  flex: 0.2,
  border: '1px solid #000000',
  padding: '20px',
  backgroundColor: '#f7f7f7',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'left',
  height: '95%',
  color: 'black',
  width: '300px',
  maxHeight: '700px',
  overflowY: 'auto',
  textAlign: 'justify',
};

const toggleButtonStyle = {
  marginRight: '10px',
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Whiteboard;
