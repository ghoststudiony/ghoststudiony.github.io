// DollarBill.js
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DollarBill = ({ model, active }) => {
  const ref = useRef();
  // Cache mesh children so we don't traverse every frame.
  const meshRefs = useRef([]);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const windRef = useRef(new THREE.Vector3());
  const timerRef = useRef(0);
  const spawnDelayRef = useRef(THREE.MathUtils.randFloat(0, 3));
  const fadeInDuration = 3; // Fade in over 3 seconds
  const spawnY = 30;
  const fadeOutStart = -40; // Start fade out at y = -40
  const despawnY = -50; // Fully faded out at y = -50

  // Function to collect all mesh children once.
  const collectMeshes = () => {
    meshRefs.current = [];
    ref.current.traverse(child => {
      if (child.isMesh) {
        // Clone material for uniqueness.
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0;
        // Remove shadow properties for dollar bills.
        child.castShadow = false;
        child.receiveShadow = false;
        meshRefs.current.push(child);
      }
    });
  };

  // Apply custom vertex shader modifications for wind bending & twist.
  const applyWindBendEffect = () => {
    if (!meshRefs.current.length) return;
    meshRefs.current.forEach(child => {
      child.material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.windStrength = { value: 2.5 };
        shader.uniforms.twistFactor = { value: 0.5 };
        shader.vertexShader = `
          uniform float uTime;
          uniform float windStrength;
          uniform float twistFactor;
        ` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          // Wind displacement.
          transformed.x += sin( position.y * 0.1 + uTime * 0.8 ) * windStrength;
          transformed.z += cos( position.y * 0.1 + uTime * 0.8 ) * windStrength;
          // Twist (roll up) effect.
          float angle = twistFactor * position.y * sin(uTime * 1.5);
          float s = sin(angle);
          float c = cos(angle);
          vec2 twisted = vec2( transformed.x * c - transformed.z * s,
                               transformed.x * s + transformed.z * c );
          transformed.x = twisted.x;
          transformed.z = twisted.y;
          `
        );
        child.material.userData.shader = shader;
      };
      child.material.needsUpdate = true;
    });
  };

  // Randomize the initial state of the bill.
  const randomizeState = () => {
    if (!ref.current) return;
    const x = THREE.MathUtils.randFloatSpread(20);
    const z = THREE.MathUtils.randFloatSpread(20);
    ref.current.position.set(x, spawnY, z);
    ref.current.rotation.set(
      THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(0, 360)),
      THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(0, 360)),
      THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(0, 360))
    );
    velocity.current.set(
      THREE.MathUtils.randFloatSpread(1),
      THREE.MathUtils.randFloat(0, 0.5),
      THREE.MathUtils.randFloatSpread(1)
    );
    windRef.current.set(
      THREE.MathUtils.randFloat(-10, 10),
      0,
      THREE.MathUtils.randFloat(-5, 5)
    );
    timerRef.current = 0;
    spawnDelayRef.current = THREE.MathUtils.randFloat(0, 3);
    // Reset opacity on all mesh children.
    meshRefs.current.forEach(child => {
      child.material.opacity = 0;
    });
  };

  useEffect(() => {
    randomizeState();
    if (ref.current) {
      collectMeshes();
      applyWindBendEffect();
    }
  }, []);

  useFrame((state, delta) => {
    if (!active) return;
    timerRef.current += delta;

    // Fade in: after spawn delay, ramp opacity from 0 to 1.
    if (timerRef.current >= spawnDelayRef.current) {
      const fadeProgress = Math.min((timerRef.current - spawnDelayRef.current) / fadeInDuration, 1);
      meshRefs.current.forEach(child => {
        child.material.opacity = fadeProgress;
      });
    }
    if (timerRef.current < spawnDelayRef.current) return;

    // Update falling motion.
    const gravity = new THREE.Vector3(0, -9.8, 0).multiplyScalar(delta);
    velocity.current.add(gravity);
    const windVec = windRef.current.clone().multiplyScalar(delta);
    velocity.current.add(windVec);
    const flutterAmplitude = 0.7;
    const flutterFrequency = 2;
    const flutterOffsetX = flutterAmplitude * Math.sin(state.clock.elapsedTime * flutterFrequency);
    const flutterOffsetZ = flutterAmplitude * Math.cos(state.clock.elapsedTime * flutterFrequency);
    const flutter = new THREE.Vector3(flutterOffsetX, 0, flutterOffsetZ).multiplyScalar(delta);
    ref.current.position.add(velocity.current.clone().multiplyScalar(delta)).add(flutter);
    ref.current.rotation.x += delta * THREE.MathUtils.randFloat(0.1, 0.3);
    ref.current.rotation.y += delta * THREE.MathUtils.randFloat(0.1, 0.3);
    ref.current.rotation.z += delta * THREE.MathUtils.randFloat(0.1, 0.3);

    // Update uTime uniform for all mesh materials.
    meshRefs.current.forEach(child => {
      if (child.material.userData.shader) {
        child.material.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });

    // Fade out effect when passing from -40 to -50.
    if (ref.current.position.y < fadeOutStart) {
      const fadeOutRange = fadeOutStart - despawnY; // 10 units
      // Calculate fade progress: 0 at fadeOutStart, 1 at despawnY.
      const fadeOutProgress = (fadeOutStart - ref.current.position.y) / fadeOutRange;
      meshRefs.current.forEach(child => {
        child.material.opacity = Math.max(0, 1 - fadeOutProgress);
      });
    }

    if (ref.current.position.y < despawnY) {
      randomizeState();
      applyWindBendEffect();
    }
  });

  const clonedModel = useMemo(() => model.clone(), [model]);
  return <primitive ref={ref} object={clonedModel} />;
};

export default DollarBill;
