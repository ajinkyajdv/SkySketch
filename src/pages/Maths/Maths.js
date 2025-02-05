import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyAKgP7vVI5x8MDUjbdAA7ZNWBzajPEdSo0"); 

const Whiteboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const buttonRef = useRef(null);
  const clearButtonRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    const ctx = canvasElement.getContext('2d');
    const buttonElement = buttonRef.current;

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
    return [8, 12, 16, 20].filter(i => landmarks[i].y < landmarks[4].y).length;
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

  const handleGeminiAI = async () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    
    if (!drawingCanvasElement) return;

    // Convert canvas to Blob and then to Base64
    drawingCanvasElement.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to convert canvas to blob');
        return;
      }

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Get the base64 part of the image data
        console.log("Base64 Image:", base64Image); // Log Base64 data for debugging

        try {
          setAiResponse('loading...');

          // Initialize Gemini API model
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          // Create the prompt and the base64 image part
          const prompt = "Analyze this image of a math problem and provide the solution.";
          const imagePart = {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          };

          // Send both text and image to Gemini API
          const result = await model.generateContent([prompt, imagePart]);

          // Handle response
          console.log("AI Response:", result.response.text()); // Log response for debugging
          setAiResponse(result.response.text());  // Assuming the response contains text
        } catch (error) {
          console.error('Error with Gemini AI:', error);
          setAiResponse(`Sorry, there was an error with the AI. Details: ${error.message}`);
        }
      };
      reader.readAsDataURL(blob); // Converts the Blob to Base64
    }, 'image/png');
  };

  const clearCanvas = () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const ctx = drawingCanvasElement.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasElement.width, drawingCanvasElement.height);
    setAiResponse('');
  };

  return (
    <div style={{ display: 'flex', height: '98vh', width: '100vw' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', backgroundColor: 'white' }} />
        <canvas ref={drawingCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'transparent' }} />
        <video ref={videoRef} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '300px', border: '2px solid #000' }} autoPlay />
        <button 
          ref={buttonRef} 
          onClick={handleGeminiAI} 
          disabled={aiResponse === 'loading...'} 
          style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {aiResponse === 'loading...' ? 'Processing...' : 'Gemini AI'}
        </button>
        <button ref={clearButtonRef} onClick={clearCanvas} style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', backgroundColor: '#FF6347', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Clear Canvas</button>
      </div>
      <div style={{ width: '300px', padding: '20px', backgroundColor: '#f7f7f7', border: '2px solid black' }}>
        <h2>AI Response:</h2>
        <p>{aiResponse}</p>
      </div>
    </div>
  );
};

export default Whiteboard;
