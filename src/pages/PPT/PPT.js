import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const PptDrawing = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const [pptUrl, setPptUrl] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [drawing, setDrawing] = useState(true);
  const buttonRef = useRef(null);
  const slides = useRef([]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    const ctx = canvasElement.getContext('2d');
    const buttonElement = buttonRef.current;

    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    drawingCanvasElement.width = window.innerWidth;
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

      if (slides.current.length > 0) {
        const img = new Image();
        img.src = slides.current[currentSlideIndex];
        img.onload = () => ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
      }

      if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexFingerTip = landmarks[8];
        const x = indexFingerTip.x * canvasElement.width;
        const y = indexFingerTip.y * canvasElement.height;
        const invertedX = canvasElement.width - x;

        drawLandmarks(landmarks, ctx);

        const numFingers = countFingers(landmarks);

        if (numFingers === 1 && drawing) {
          if (prevPosition.current.x !== 0 && prevPosition.current.y !== 0) {
            drawFromPreviousPosition(prevPosition.current.x, prevPosition.current.y, invertedX, y, drawingCtx);
          }
          prevPosition.current = { x: invertedX, y };
        } else if (numFingers === 2) {
          setDrawing(false);
          prevPosition.current = { x: 0, y: 0 };

          const buttonRect = buttonElement.getBoundingClientRect();
          if (isFingerNearButton(invertedX, y, buttonRect)) clearCanvas();
        } else {
          setDrawing(true);
        }
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => await hands.send({ image: videoElement }),
      width: 1280,
      height: 720,
    });
    camera.start();

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') nextSlide();
      if (event.key === 'ArrowLeft') previousSlide();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex]);

  const handlePptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      slides.current.push(fileUrl);
      setCurrentSlideIndex(slides.current.length - 1);
      setPptUrl(fileUrl);
    }
  };

  const clearCanvas = () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    drawingCtx.clearRect(0, 0, drawingCanvasElement.width, drawingCanvasElement.height);
    prevPosition.current = { x: 0, y: 0 };
  };

  const nextSlide = () => {
    if (slides.current.length > 0) {
      setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, slides.current.length - 1));
    }
  };

  const previousSlide = () => {
    if (slides.current.length > 0) {
      setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

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
    const buffer = 20; // Buffer around the button
    return (
      fingerX > buttonRect.left - buffer &&
      fingerX < buttonRect.right + buffer &&
      fingerY > buttonRect.top - buffer &&
      fingerY < buttonRect.bottom + buffer
    );
  };

  return (
    <div className="home-main">
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
        }}
      />
      <canvas
        ref={drawingCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'transparent',
          zIndex: 3,
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
          zIndex: 4,
        }}
        autoPlay
      />
      <button
        ref={buttonRef}
        onClick={clearCanvas}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#2b750c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 5,
        }}
      >
        Clear Canvas
      </button>
      <input
        type="file"
        accept=".pptx"
        onChange={handlePptUpload}
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 5,
        }}
      />
      {slides.current.length > 0 && (
        <iframe
          title="PPT Viewer"
          src={'https://docs.google.com/presentation/d/1fWdH4QM7YM724NAQhRBD6BwXfjDsod3l/embed'}
          width="100%"
          height="600px"
          style={{ border: 'none', position: 'absolute', top: '150px', left: '0', zIndex: 1 }}
        ></iframe>
      )}
    </div>
  );
};

export default PptDrawing;
