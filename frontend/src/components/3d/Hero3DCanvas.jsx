import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3DCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer (Light theme setup)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff7ed, 0.025); // Soft warm amber fog

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 18, 35);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 2. Interactive 3D Terrain Wireframe Mesh (Warm Amber Gold)
    const gridWidth = 48;
    const gridDepth = 48;
    const gridSegments = 40;

    const planeGeo = new THREE.PlaneGeometry(
      gridWidth,
      gridDepth,
      gridSegments,
      gridSegments
    );
    planeGeo.rotateX(-Math.PI / 2);

    const count = planeGeo.attributes.position.count;
    const posAttr = planeGeo.attributes.position;

    // Light Theme Wireframe Material with Warm Amber/Orange accent
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Warm Amber
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const terrainMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(terrainMesh);

    // 3. Point Vertices (Glowing Gold Nodes)
    const pointsMat = new THREE.PointsMaterial({
      color: 0xb45309,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
    });
    const pointsMesh = new THREE.Points(planeGeo, pointsMat);
    scene.add(pointsMesh);

    // 4. Tactical Emerald & Amber Perimeter Rings
    const ringGeo = new THREE.RingGeometry(8, 8.2, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x059669, // Emerald Green
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.position.y = 0.5;
    scene.add(radarRing);

    const outerRingGeo = new THREE.RingGeometry(16, 16.15, 64);
    outerRingGeo.rotateX(-Math.PI / 2);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Amber
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const outerRadarRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRadarRing.position.y = 0.4;
    scene.add(outerRadarRing);

    // 5. Light Warm Particle Dust
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 55;
      particlePos[i + 1] = Math.random() * 22;
      particlePos[i + 2] = (Math.random() - 0.5) * 55;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePos, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xd97706,
      size: 0.3,
      transparent: true,
      opacity: 0.45,
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // 6. Interactive Mouse Motion Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Deform Terrain Vertices smoothly with sine waves
      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        const y =
          Math.sin(x * 0.25 + elapsedTime * 1.4) * 1.1 +
          Math.cos(z * 0.25 + elapsedTime * 1.1) * 1.1 +
          Math.sin(dist * 0.18 - elapsedTime * 1.8) * 0.7;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Rotate Rings
      radarRing.rotation.y += 0.006;
      outerRadarRing.rotation.y -= 0.003;

      // Mouse-follow target lerping
      targetX += (mouseX * 4 - targetX) * 0.05;
      targetY += (-mouseY * 3 - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 18 + targetY;
      camera.lookAt(0, 0, 0);

      terrainMesh.rotation.y = elapsedTime * 0.04;
      pointsMesh.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      planeGeo.dispose();
      planeMat.dispose();
      pointsMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px]">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {/* HUD badge overlay in light theme */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none text-xs text-amber-900 font-mono shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>3D SPATIAL MODEL ONLINE</span>
      </div>
    </div>
  );
}
