// "use client";

// import * as Three from "three";

// import { useRef, useEffect } from "react";

// import "./ThreeSmoke.css";

// export default function ThreeSmoke() {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     let scene, camera, renderer, clock;
//     let smokeParticles = [];

//     // init
//     const init = () => {
//       if (!mountRef.current) return;
//       clock = new Three.Clock();

//       renderer = new Three.WebGLRenderer({ alpha: true });

//       renderer.setSize(window.innerWidth, window.innerHeight);

//       mountRef.current.appendChild(renderer.domElement);

//       scene = new Three.Scene();

//       camera = new Three.PerspectiveCamera(
//         60,
//         window.innerWidth / window.innerHeight,
//         1,
//         10000
//       );
//       camera.position.z = 1200;
//       scene.add(camera);

//       const light = new Three.DirectionalLight(0xffffff, 1);
//       light.position.set(-1, 0, 1);
//       light.castShadow = true;
//       scene.add(light);

//       // loading
//       const loader = new Three.TextureLoader();
//       loader.load("/smoke.png", (smokeTexture) => {
//         const smokeMaterial = new Three.MeshLambertMaterial({
//           color: 0xffffff,
//           map: smokeTexture,
//           transparent: true,
//           opacity: 0.1,
//           depthWrite: false, // prevent artefacts
//           blending: Three.AdditiveBlending,
//         });
//         const smokeGeo = new Three.PlaneGeometry(2000, 2000);

//         const gridSize = 4; // particles per row/col
//         const spacing = 600;

//         for (let x = 0; x < gridSize; x++) {
//           for (let y = 0; y < gridSize; y++) {
//             for (let z = 0; z < gridSize; z++) {
//               const particle = new Three.Mesh(smokeGeo, smokeMaterial);

//               particle.position.set(
//                 (x - gridSize / 2) * spacing + (Math.random() - 0.5) * 100,
//                 (y - gridSize / 2) * spacing +
//                   (Math.random() - 0.5) * 100 +
//                   250,
//                 (z - gridSize / 2) * spacing + (Math.random() - 0.5) * 100
//               );

//               particle.rotation.z = Math.random() * 360;
//               scene.add(particle);
//               smokeParticles.push(particle);
//             }
//           }
//         }
//       });

//       animate();
//     };

//     // animation
//     const animate = () => {
//       requestAnimationFrame(animate);
//       const delta = clock.getDelta();
//       smokeParticles.forEach((particle) => {
//         particle.rotation.z += delta * 0.05;
//         particle.position.x += (Math.random() - 0.5) * 0.2; // move on X
//         particle.position.y += (Math.random() - 0.5) * 0.2; // move on Y
//       });
//       renderer.render(scene, camera);
//     };

//     if (typeof window === "undefined") return;
//     init();
//   }, []);

//   return (
//     <div
//       ref={mountRef}
//       className="canvas-container animate-[fadeIn_1.5s_ease-in-out]"
//     />
//   );
// }

"use client";

import * as Three from "three";
import { useRef, useEffect, useState } from "react";
import "./ThreeSmoke.css";

export default function ThreeSmoke() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const smokeParticles = useRef([]);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const clockRef = useRef(new Three.Clock());

  useEffect(() => {
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
    };

    setTimeout(() => setLoaded(true), 100);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!loaded || !mountRef.current) return;

    // const isWebGLAvailable = () => {
    //   try {
    //     const canvas = document.createElement("canvas");
    //     return !!(
    //       window.WebGLRenderingContext &&
    //       (canvas.getContext("webgl") ||
    //         canvas.getContext("experimental-webgl"))
    //     );
    //   } catch {
    //     return false;
    //   }
    // };

    // if (!isWebGLAvailable()) {
    //   console.error("WebGL non supporté sur ce navigateur !");
    //   return;
    // }
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 non disponible");
      return;
    }

    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 1200;

    const renderer = new Three.WebGLRenderer({
      alpha: true,
      antialias: true,
      // preserveDrawingBuffer: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    mountRef.current.innerHTML = ""; // clean previous canvas if needed
    mountRef.current.appendChild(renderer.domElement);

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 0, 1);
    scene.add(light);
    scene.add(camera);

    rendererRef.current = renderer;
    cameraRef.current = camera;
    sceneRef.current = scene;

    const loader = new Three.TextureLoader();
    loader.load(
      "/smoke.png",
      (texture) => {
        const material = new Three.MeshLambertMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          opacity: 0.1,
          depthWrite: false,
          blending: Three.AdditiveBlending,
        });

        const geometry = new Three.PlaneGeometry(2000, 2000);
        const gridSize = 4;
        const spacing = 600;

        for (let x = 0; x < gridSize; x++) {
          for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
              const particle = new Three.Mesh(geometry, material);
              particle.position.set(
                (x - gridSize / 2) * spacing + (Math.random() - 0.5) * 100,
                (y - gridSize / 2) * spacing +
                  (Math.random() - 0.5) * 100 +
                  250,
                (z - gridSize / 2) * spacing + (Math.random() - 0.5) * 100
              );
              particle.rotation.z = Math.random() * 360;
              scene.add(particle);
              smokeParticles.current.push(particle);
            }
          }
        }

        animate();
      },
      undefined,
      (err) => console.error("Erreur chargement texture :", err)
    );

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      smokeParticles.current.forEach((p) => {
        p.rotation.z += delta * 0.05;
        p.position.x += (Math.random() - 0.5) * 0.2;
        p.position.y += (Math.random() - 0.5) * 0.2;
      });
      renderer.render(scene, camera);
    };

    return () => {
      renderer.dispose();
      renderer.forceContextLoss?.();
      smokeParticles.current = [];
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [loaded]);

  return (
    <div
      ref={mountRef}
      className="canvas-container animate-[fadeIn_1.5s_ease-in-out]"
    />
  );
}
