const DollarBill = ({ model, active }) => {
    const ref = useRef();
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const windRef = useRef(new THREE.Vector3());
    const timerRef = useRef(0);
    const spawnDelayRef = useRef(THREE.MathUtils.randFloat(0, 3));
    const spawnY = 8;
    const despawnY = -8;
  
    // Apply the wind + twist (roll up) effect by modifying the vertex shader.
    const applyWindBendEffect = () => {
      if (ref.current) {
        ref.current.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.onBeforeCompile = (shader) => {
              // Add uniforms for time and wind strength (you can add more if needed)
              shader.uniforms.uTime = { value: 0 };
              shader.uniforms.windStrength = { value: 2.5 }; // Adjust for stronger wind displacement
              shader.uniforms.twistFactor = { value: 0.5 };    // Adjust for twist intensity
  
              // Prepend the uniform declarations to the shader
              shader.vertexShader = `
                uniform float uTime;
                uniform float windStrength;
                uniform float twistFactor;
              ` + shader.vertexShader;
  
              // Inject code after <begin_vertex> to displace and twist the vertices.
              shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                  #include <begin_vertex>
                  // Displace the vertex to follow the wind:
                  transformed.x += sin( position.y * 0.1 + uTime * 0.8 ) * windStrength;
                  transformed.z += cos( position.y * 0.1 + uTime * 0.8 ) * windStrength;
                  // Twist (roll up) effect: twist amount is proportional to Y and modulated by time.
                  float angle = twistFactor * position.y * sin(uTime * 1.5);
                  float s = sin(angle);
                  float c = cos(angle);
                  vec2 twisted = vec2( transformed.x * c - transformed.z * s, transformed.x * s + transformed.z * c );
                  transformed.x = twisted.x;
                  transformed.z = twisted.y;
                `
              );
              // Save a reference to update uniforms later.
              child.material.userData.shader = shader;
            };
            child.material.needsUpdate = true;
          }
        });
      }
    };
  
    // Randomize the bill's initial state.
    const randomizeState = () => {
      if (ref.current) {
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
        // Stronger, randomized wind: X between -10 and 10, Z between -5 and 5.
        windRef.current.set(
          THREE.MathUtils.randFloat(-10, 10),
          0,
          THREE.MathUtils.randFloat(-5, 5)
        );
        timerRef.current = 0;
        spawnDelayRef.current = THREE.MathUtils.randFloat(0, 3);
      }
    };
  
    useEffect(() => {
      randomizeState();
      applyWindBendEffect();
    }, []);
  
    useFrame((state, delta) => {
      if (!active) return;
      timerRef.current += delta;
      if (timerRef.current < spawnDelayRef.current) return;
  
      // Update velocity with gravity.
      const gravity = new THREE.Vector3(0, -9.8, 0).multiplyScalar(delta);
      velocity.current.add(gravity);
      // Apply wind effect.
      const windVec = windRef.current.clone().multiplyScalar(delta);
      velocity.current.add(windVec);
      // Add flutter effect for natural motion.
      const flutterAmplitude = 0.7;
      const flutterFrequency = 2;
      const flutterOffsetX = flutterAmplitude * Math.sin(state.clock.elapsedTime * flutterFrequency);
      const flutterOffsetZ = flutterAmplitude * Math.cos(state.clock.elapsedTime * flutterFrequency);
      const flutter = new THREE.Vector3(flutterOffsetX, 0, flutterOffsetZ).multiplyScalar(delta);
      ref.current.position.add(velocity.current.clone().multiplyScalar(delta)).add(flutter);
      ref.current.rotation.x += delta * THREE.MathUtils.randFloat(0.1, 0.3);
      ref.current.rotation.y += delta * THREE.MathUtils.randFloat(0.1, 0.3);
      ref.current.rotation.z += delta * THREE.MathUtils.randFloat(0.1, 0.3);
  
      // Update the shader uniform for time.
      ref.current.traverse(child => {
        if (child.isMesh && child.material.userData.shader) {
          child.material.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
        }
      });
  
      if (ref.current.position.y < despawnY) {
        randomizeState();
        applyWindBendEffect();
      }
    });
  
    const clonedModel = useMemo(() => model.clone(), [model]);
    return <primitive ref={ref} object={clonedModel} />;
  };
  