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
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.z = 1200;
      scene.add(camera);

      const light = new Three.DirectionalLight(0xffffff, 1);
      light.position.set(-1, 0, 1);
      light.castShadow = true;
      scene.add(light);

      // loading
      const loader = new Three.TextureLoader();
      loader.load("/smoke.png", (smokeTexture) => {
        const smokeMaterial = new Three.MeshLambertMaterial({
          color: 0xffffff,
          map: smokeTexture,
          transparent: true,
          opacity: 0.1,
          depthWrite: false, // prevent artefacts
          blending: Three.AdditiveBlending,
        });
        const smokeGeo = new Three.PlaneGeometry(2000, 2000);

        const gridSize = 4; // particles per row/col
        const spacing = 600;

        for (let x = 0; x < gridSize; x++) {
          for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
              const particle = new Three.Mesh(smokeGeo, smokeMaterial);

              particle.position.set(
                (x - gridSize / 2) * spacing + (Math.random() - 0.5) * 100,
                (y - gridSize / 2) * spacing +
                  (Math.random() - 0.5) * 100 +
                  250,
                (z - gridSize / 2) * spacing + (Math.random() - 0.5) * 100
              );

              particle.rotation.z = Math.random() * 360;
              scene.add(particle);
              smokeParticles.push(particle);
            }
          }
        }
      });

      animate();
    };

    // animation
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      smokeParticles.forEach((particle) => {
        particle.rotation.z += delta * 0.05;
        particle.position.x += (Math.random() - 0.5) * 0.2; // move on X
        particle.position.y += (Math.random() - 0.5) * 0.2; // move on Y
      });
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
