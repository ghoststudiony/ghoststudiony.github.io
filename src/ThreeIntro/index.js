import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import DollarBill from './DollarBill';
import * as THREE from 'three';
import "./styles.css";
import ProgressLoader from './ProgressLoader';

// -----------------------------------------------------
// CameraController: Moves the camera along a preset path.

const CameraController = ({ active }) => {
  const { camera } = useThree();
  const positions = useMemo(() => [
    new THREE.Vector3(4, 3, 3),    // A: Top Front
    new THREE.Vector3(2, -8, 5),   // B: Bottom Front
    new THREE.Vector3(0, -10, -5), // C: Bottom Back
    new THREE.Vector3(0, 8, -5),   // D: Top Back
    new THREE.Vector3(-2, -3, 5),
    new THREE.Vector3(0, -10, -5),
    new THREE.Vector3(-3.4, 7, -5),
  ], []);

  useEffect(() => {
    camera.position.copy(positions[0]);
    camera.lookAt(0, 0, 0);
  }, [camera, positions]);

  const segmentTime = 1.8;
  const progressRef = useRef(0);
  const segmentIndexRef = useRef(0);

  useFrame((state, delta) => {
    if (!active) return;
    progressRef.current += delta;
    if (progressRef.current >= segmentTime) {
      progressRef.current -= segmentTime;
      segmentIndexRef.current = (segmentIndexRef.current + 1) % positions.length;
    }
    const t = progressRef.current / segmentTime;
    const easedT = (1 - Math.cos(t * Math.PI)) / 2;
    const currentIndex = segmentIndexRef.current;
    const nextIndex = (currentIndex + 1) % positions.length;
    const startPos = positions[currentIndex];
    const endPos = positions[nextIndex];
    const interpolated = new THREE.Vector3().lerpVectors(startPos, endPos, easedT);
    camera.position.copy(interpolated);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// -----------------------------------------------------
// Model: Loads and displays the ghost character GLB (remains static).
const Model = () => {
  const { scene } = useGLTF('/models/ghostchar.glb'); // Adjust path as needed
  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};
// -----------------------------------------------------
// DollarBills: Spawns multiple DollarBill instances.
const DollarBills = ({ count = 20, active }) => {
  const { scene: dollarBillScene } = useGLTF('/models/money.glb'); // Adjust path as needed
  const startPositions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(20);
      const z = THREE.MathUtils.randFloatSpread(20);
      arr.push(new THREE.Vector3(x, 8, z));
    }
    return arr;
  }, [count]);

  return (
    <>
      {startPositions.map((_, index) => (
        <DollarBill key={index} model={dollarBillScene} active={active} />
      ))}
    </>
  );
};

const ThreeIntro = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [width, setWidth] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Preload home page
  useEffect(()=>{
    import('../Home');
  }, [])

  // When isAnimating is true, start a setInterval to increment width and play audio.
  useEffect(() => {
    if (isAnimating) {
      // Play the audio if available.
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
      intervalRef.current = setInterval(() => {
        setWidth((prevWidth) => {
          // Optionally, you can limit width to a maximum value (e.g., 100%)
          if (prevWidth < 100) {
            return prevWidth + 0.4;
          } else {
            return prevWidth;
          }
        });
      }, 20); // Adjust the interval duration for speed
    } else {
      // Pause the audio when the animation stops.
      if (audioRef.current) {
        audioRef.current.pause();
        // Optionally, reset the playback position:
        // audioRef.current.currentTime = 0;
      }
      // Clear the interval when animation stops.
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup on unmount or when isAnimating changes.
    return () => clearInterval(intervalRef.current);
  }, [isAnimating]);

  useEffect(()=>{
    audioRef.current.volume = 0.8;
  },[])

  const onPointerDown = () => {
    setIsAnimating(true);
  };

  const onPointerUp = () => {
    setIsAnimating(false);
  };

  const onPointerLeave = () => {
    setIsAnimating(false);
  };

  return (
    <div className='three-intro-container'>
      <Canvas
        shadows
        style={{ height: '100vh', width: '100vw', zIndex: 2 }}
        gl={{ alpha: true }}
        onCreated={({ scene, gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          scene.background = null;
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          intensity={0.7}
          position={[6, 10, 10]}
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

        {/* Your Model, CameraController, and DollarBills components */}
        <Model />
        <CameraController active={isAnimating} />
        <DollarBills count={10} active={true} />

        {/* Ground plane that only shows the shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <shadowMaterial side={THREE.DoubleSide} opacity={0.5} />
        </mesh>
      </Canvas>
      <ProgressLoader width={width} />
      <div className='intro-background'>
        <img className='intro-background-logo' src="images/ghoststudio.png"/>
        <div className='intro-background-env'>
          <div className='intro-background-canvas' style={{ width: `${width}%` }}></div>
        </div>
      </div>
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/music/imeanit.mp3" preload="auto" loop />
    </div>
  );
};

export default ThreeIntro;

