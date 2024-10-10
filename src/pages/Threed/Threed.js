import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const DocumentManipulation = () => {
  const [model, setModel] = useState(null);
  const [modelPosition, setModelPosition] = useState([0, -1, 0]);
  const [modelScale, setModelScale] = useState(0.1); // Adjust scale here

  useEffect(() => {
    const loadObjModel = (url) => {
      const loader = new OBJLoader();
      loader.load(
        url,
        (obj) => {
          obj.position.set(...modelPosition); // Center the model position
          obj.scale.set(modelScale, modelScale, modelScale); // Scale the model
          setModel(obj);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
        }
      );
    };

    // Load a default model when the component mounts (optional)
    const defaultModelUrl = '/path/to/your/model.obj'; // Replace with your model path
    loadObjModel(defaultModelUrl);
  }, [modelPosition, modelScale]);

  const handleModelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const modelUrl = URL.createObjectURL(file);
      loadObjModel(modelUrl);
    }
  };

  const loadObjModel = (url) => {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => {
        obj.position.set(...modelPosition); // Center the model position
        obj.scale.set(modelScale, modelScale, modelScale); // Scale the model
        setModel(obj);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <input
        type="file"
        accept=".obj"
        onChange={handleModelUpload}
        style={{
          position: 'absolute',
          top: '20px',
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
      <label
        style={{
          position: 'absolute',
          top: '20px',
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
      >
        Upload Model
      </label>

      {/* Three.js Canvas for 3D model */}
      {model && (
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <ambientLight />
          <pointLight position={[25, 30, 30]} />
          <OrbitControls />
          <primitive object={model} />
        </Canvas>
      )}
    </div>
  );
};

export default DocumentManipulation;
