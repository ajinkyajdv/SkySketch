import React, { useEffect, useRef, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import './Whiteboard.css';

const Whiteboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const prevPosition = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const isDrawing = useRef(true);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');
    const button = buttonRef.current;

    const { innerWidth: width, innerHeight: height } = window;
    [canvas, drawingCanvas].forEach((el) => {
      el.width = width;
      el.height = height;
    });

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(({ multiHandLandmarks }) => {
      ctx.clearRect(0, 0, width, height);
      if (!multiHandLandmarks?.length) return;

      const landmarks = multiHandLandmarks[0];
      const [indexTip, middleTip] = [landmarks[8], landmarks[12]];
      const [x, y] = [indexTip.x * width, indexTip.y * height];
      const invertedX = width - x;

      drawLandmarks(landmarks, ctx);
      const numFingers = countFingers(landmarks);

      if (numFingers === 1 && isDrawing.current) {
        if (prevPosition.current.x && prevPosition.current.y) {
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
        isDrawing.current = false;
        prevPosition.current = { x: 0, y: 0 };

        if (isFingerNearButton(invertedX, y, button.getBoundingClientRect()) &&
            isFingerNearButton(middleTip.x * width, middleTip.y * height, button.getBoundingClientRect())) {
          clearCanvas(drawingCtx);
        }
      } else {
        isDrawing.current = true;
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  const drawLandmarks = (landmarks, ctx) => {
    landmarks.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(window.innerWidth - x * window.innerWidth, y * window.innerHeight, 5, 0, 2 * Math.PI);
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
    return ['8', '12', '16', '20'].filter((idx) => landmarks[idx].y < landmarks[4].y).length;
  };

  const isFingerNearButton = (x, y, rect) => {
    const buffer = 20;
    return x > rect.left - buffer && x < rect.right + buffer && y > rect.top - buffer && y < rect.bottom + buffer;
  };

  const clearCanvas = useCallback((ctx = drawingCanvasRef.current.getContext('2d')) => {
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    prevPosition.current = { x: 0, y: 0 };
  }, []);

  return (
    <div className="home-main">
      <canvas ref={canvasRef} className="main-canvas" />
      <canvas ref={drawingCanvasRef} className="drawing-canvas" />
      <video ref={videoRef} className="video-feed" autoPlay />
      <button ref={buttonRef} className="clear-btn" onClick={() => clearCanvas()}>
        Clear Canvas
      </button>
    </div>
  );
};

export default Whiteboard;
