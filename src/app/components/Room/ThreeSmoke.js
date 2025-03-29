"use client";

import * as Three from "three";

import { useRef, useEffect } from "react";

import "./ThreeSmoke.css";

export default function ThreeSmoke() {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, clock;
    let smokeParticles = [];

    // init
    const init = () => {
      clock = new Three.Clock();

      renderer = new Three.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      scene = new Three.Scene();

      camera = new Three.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.z = 1200;
      scene.add(camera);

      const light = new Three.DirectionalLight(0xffffff, 0.6);
      light.position.set(-1, 0, 1);
      scene.add(light);

      // loading
      const loader = new Three.TextureLoader();
      loader.load("/smoke.png", (smokeTexture) => {
        const smokeMaterial = new Three.MeshLambertMaterial({
          color: 0xffffff,
          map: smokeTexture,
          transparent: true,
        });
        const smokeGeo = new Three.PlaneGeometry(300, 300);

        for (let p = 0; p < 150; p++) {
          const particle = new Three.Mesh(smokeGeo, smokeMaterial);
          particle.position.set(
            Math.random() * 500 - 250,
            Math.random() * 500 - 250,
            Math.random() * 1000 - 100
          );
          particle.rotation.z = Math.random() * 360;
          scene.add(particle);
          smokeParticles.push(particle);
        }
      });

      animate();
    };

    // animation
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      smokeParticles.forEach(
        (particle) => (particle.rotation.z += delta * 0.1)
      );
      renderer.render(scene, camera);
    };

    init();
  }, []);

  return (
    <div
      ref={mountRef}
      className="canvas-container animate-[fadeIn_1.5s_ease-in-out]"
    />
  );
}
