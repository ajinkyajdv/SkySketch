import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import './Threed.css'; // Assuming you use CSS for styles

const ThreeD = () => {
  const [model, setModel] = useState(null);
  const [modelConfig, setModelConfig] = useState({
    position: [0, -1, 0],
    scale: 0.1,
  });

  // Consolidate model loading logic
  const loadObjModel = useCallback((url) => {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => {
        obj.position.set(...modelConfig.position);
        obj.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
        setModel(obj);
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  }, [modelConfig]);

  useEffect(() => {
    const defaultModelUrl = '/path/to/your/model.obj'; // Replace with your model path
    loadObjModel(defaultModelUrl);
  }, [loadObjModel]);

  const handleModelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const modelUrl = URL.createObjectURL(file);
      loadObjModel(modelUrl);
    }
  };

  return (
    <div className="three-d-container">
      <input
        type="file"
        accept=".obj"
        onChange={handleModelUpload}
        id="model-upload"
      />
      <label htmlFor="model-upload" className="upload-btn">
        Upload Model
      </label>

      {/* Three.js Canvas for 3D model */}
      {model && (
        <Canvas className="canvas-container">
          <ambientLight />
          <pointLight position={[25, 30, 30]} />
          <OrbitControls />
          <primitive object={model} />
        </Canvas>
      )}
    </div>
  );
};

export default ThreeD;
