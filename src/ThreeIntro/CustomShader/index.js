// CustomShaderPass.js
import React from 'react';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import * as THREE from 'three';

class CustomShaderPass extends React.Component {
  constructor(props) {
    super(props);
    const { shader } = props;
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
    });
    // Use FullScreenQuad imported directly.
    this.fsQuad = new FullScreenQuad(this.material);
  }

  renderPass(renderer, writeBuffer, readBuffer) {
    this.uniforms.tDiffuse1.value = readBuffer.texture;
    this.uniforms.tDiffuse2.value = readBuffer.texture;
    if (this.props.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.props.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  render() {
    // This component doesn't render any visible JSX.
    return null;
  }
}

export default CustomShaderPass;
