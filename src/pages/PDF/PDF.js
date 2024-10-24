import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentDrawing = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const [pdfFile, setPdfFile] = useState(null);
  const [drawing, setDrawing] = useState(true);
  const buttonRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
            drawFromPreviousPosition(prevPosition.current.x, prevPosition.current.y, invertedX, y, drawingCtx);
          }
          prevPosition.current = { x: invertedX, y };
        } else if (numFingers === 2) {
          setDrawing(false);
          prevPosition.current = { x: 0, y: 0 };

          // Check if both fingers are near the button
          const buttonRect = buttonElement.getBoundingClientRect();
          if (isFingerNearButton(invertedX, y, buttonRect) && isFingerNearButton(middleFingerTip.x * canvasElement.width, middleFingerTip.y * canvasElement.height, buttonRect)) {
            clearCanvas();
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
      const buffer = 20; // 20px buffer around the button
      return (
        fingerX > buttonRect.left - buffer &&
        fingerX < buttonRect.right + buffer &&
        fingerY > buttonRect.top - buffer &&
        fingerY < buttonRect.bottom + buffer
      );
    }
  }, []);

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfFile(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    const drawingCanvasElement = drawingCanvasRef.current;
    const drawingCtx = drawingCanvasElement.getContext('2d');
    drawingCtx.clearRect(0, 0, drawingCanvasElement.width, drawingCanvasElement.height);
    prevPosition.current = { x: 0, y: 0 };
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
          //cursor: 'crosshair',
          backgroundColor: 'transparent',
          zIndex: 2,
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
      <Document
        file={pdfFile}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <Page pageNumber={currentPage} width={window.innerWidth} />
      </Document>
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
          zIndex: 3,
        }}
      >
        Clear Canvas
      </button>
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfUpload}
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
          zIndex: 4,
        }}
      />
    </div>
  );
};

export default DocumentDrawing;
