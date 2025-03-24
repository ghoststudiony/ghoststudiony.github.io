import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Float, OrbitControls } from '@react-three/drei';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import * as THREE from 'three';
import './styles.css';
import GhostModal from './GhostModal';
import { useNavigate } from 'react-router-dom';

// Create a canvas texture with a black background and green grid lines.
function createGridTexture(size = 512, gridSpacing = 40, lineColor = '#00ff00', bgColor = '#000000') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  // Fill with background color.
  context.fillStyle = bgColor;
  context.fillRect(0, 0, size, size);
  // Draw vertical and horizontal grid lines.
  context.strokeStyle = lineColor;
  context.lineWidth = 1;
  for (let i = 0; i < size; i += gridSpacing) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, size);
    context.stroke();

    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(size, i);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// This component wraps its children and handles pointer events.
const InteractiveModel = ({ name, onClickModel, children }) => {
  const groupRef = useRef();

  // When the pointer is over, traverse and change mesh colors.
  const handlePointerOver = (e) => {
    e.stopPropagation();
    groupRef.current.traverse(child => {
      if (child.isMesh) {
        // Save the original color once.
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.clone();
        }
        child.material.color.set(0xbd96ff); // Change to red on hover.
      }
    });
  };

  // When pointer leaves, restore original colors.
  const handlePointerOut = (e) => {
    e.stopPropagation();
    groupRef.current.traverse(child => {
      if (child.isMesh && child.userData.originalColor) {
        child.material.color.copy(child.userData.originalColor);
      }
    });
  };

  // On click, update the clicked models list.
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClickModel) {
      onClickModel(name);
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
    </group>
  );
};

const Aboutme = ({ onClickModel }) => {
  const { scene } = useGLTF('/models/gltf/aboutme.gltf');
  useEffect(() => {
    const metallicMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.2,
    });
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = metallicMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  return (
    <InteractiveModel name="Aboutme" onClickModel={onClickModel}>
      <Float speed={1.0} rotationIntensity={2.0} floatIntensity={3.0}>
        <primitive object={scene} scale={[2, 2, 2]} position={[-1, -1, -2]} />
      </Float>
    </InteractiveModel>
  );
};

const Pastwork = ({ onClickModel }) => {
  const { scene } = useGLTF('/models/gltf/pastwork.gltf');
  useEffect(() => {
    const metallicMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.2,
    });
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = metallicMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  return (
    <InteractiveModel name="Pastwork" onClickModel={onClickModel}>
      <Float speed={1.0} rotationIntensity={2.0} floatIntensity={3.0}>
        <primitive object={scene} scale={[2, 2, 2]} position={[3, -2.3, -2.5]} />
      </Float>
    </InteractiveModel>
  );
};

const Merch = ({ onClickModel }) => {
    const { scene } = useGLTF('/models/gltf/merch.gltf');
    useEffect(() => {
      const metallicMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.2,
      });
      scene.traverse(child => {
        if (child.isMesh) {
          child.material = metallicMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }, [scene]);
    return (
      <InteractiveModel name="Merch" onClickModel={onClickModel}>
        <Float speed={1.0} rotationIntensity={2.0} floatIntensity={3.0}>
          <primitive object={scene} scale={[2, 2, 2]} position={[-7, -4, -4]} />
        </Float>
      </InteractiveModel>
    );
  };

const Contact = ({ onClickModel }) => {
  const { scene } = useGLTF('/models/gltf/contact.gltf');
  useEffect(() => {
    const metallicMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.2,
    });
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = metallicMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  return (
    <InteractiveModel name="Contact" onClickModel={onClickModel}>
      <Float speed={1.0} rotationIntensity={2.0} floatIntensity={3.0}>
        <primitive object={scene} scale={[2, 2, 2]} position={[6, 2, -3]} />
      </Float>
    </InteractiveModel>
  );
};

// Render a huge sphere with a grid texture on the inside.
const BackgroundSphere = () => {
  const gridTexture = useMemo(() => createGridTexture(), []);
  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={gridTexture} side={THREE.BackSide} />
    </mesh>
  );
};

const Home = () => {
  // This state will hold an array of clicked model names.
  const [clickedModel, setClickedModel] = useState();
  const navigate = useNavigate();

  // Callback to update clicked models.
  const handleModelClick = (modelName) => {
    setClickedModel(modelName);
  };

  const onLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="home-container">
      <div className="home-page-header">
        <img className="home-logo" src="/images/ghostlogo.png" alt="Logo" onClick={onLogoClick} />
      </div>
      <div className='modal-container'>
        {clickedModel && <GhostModal active={clickedModel} setClickedModel={setClickedModel}/>}
      </div>
      <div className="home-page-game">
        <Canvas style={{ height: '100vh', width: '100vw' }} gl={{ alpha: true }}
          onCreated={({ scene, gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            // Load EXR environment.
            const exrLoader = new EXRLoader();
            exrLoader.load('de.exr', (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              scene.environment = texture;
            });
          }}>
          <ambientLight intensity={0.5} />
          <directionalLight
            intensity={0.5}
            position={[5, 10, 7]}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <hemisphereLight intensity={0.2} color="#ffffff" groundColor="#444444" />
          <OrbitControls
            enableZoom={false}
            enablePan={true}
            rotateSpeed={0.5}
            minPolarAngle={THREE.MathUtils.degToRad(60)}
            maxPolarAngle={Math.PI / 1.5}
            minAzimuthAngle={-Math.PI / 2}
            maxAzimuthAngle={Math.PI / 2} />
          <BackgroundSphere />
          <Aboutme onClickModel={handleModelClick} />
          <Contact onClickModel={handleModelClick} />
          <Pastwork onClickModel={handleModelClick} />
          <Merch onClickModel={handleModelClick} />
        </Canvas>
      </div>
    </div>
  );
};

export default Home;
