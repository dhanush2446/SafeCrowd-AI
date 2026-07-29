import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Layers, Shield, Navigation, AlertCircle, Compass, Zap } from "lucide-react";

export default function Venue3DViewer() {
  const [activeLayer, setActiveLayer] = useState("all");
  const [selectedNode, setSelectedNode] = useState(null);

  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Light Theme Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(22, 26, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Light Theme Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd97706, 1.2);
    dirLight.position.set(25, 35, 20);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.6);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 2. Base Light Floor Grid
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed, // Soft warm cream
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(36, 18, 0xd97706, 0xe2e8f0);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 3. Venue 3D Buildings / Elements
    const venueGroup = new THREE.Group();
    scene.add(venueGroup);

    // Main Stage Block
    const stageGeo = new THREE.BoxGeometry(12, 3.5, 6);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Warm Amber
      roughness: 0.3,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(0, 1.75, -10);
    stage.userData = {
      name: "Main Performance Stage",
      type: "High Density Zone",
      capacity: "18,000 Attendees",
      status: "Active - Peak Load",
    };
    venueGroup.add(stage);

    // Entry Gates (Gate A, Gate B)
    const createGate = (x, z, label, gateColor) => {
      const gGroup = new THREE.Group();
      const p1Geo = new THREE.BoxGeometry(0.8, 4, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: gateColor });

      const p1 = new THREE.Mesh(p1Geo, mat);
      p1.position.set(-2, 2, 0);

      const p2 = new THREE.Mesh(p1Geo, mat);
      p2.position.set(2, 2, 0);

      const beamGeo = new THREE.BoxGeometry(4.8, 0.8, 0.8);
      const beam = new THREE.Mesh(beamGeo, mat);
      beam.position.set(0, 4, 0);

      gGroup.add(p1, p2, beam);
      gGroup.position.set(x, 0, z);
      gGroup.userData = {
        name: label,
        type: "Ingress / Egress Gate",
        capacity: "450 Persons / Min",
        status: "Flow Normal",
      };
      return gGroup;
    };

    const gateA = createGate(-10, 14, "North Gate A", 0x059669);
    const gateB = createGate(10, 14, "South Gate B", 0x059669);
    const emergencyExit1 = createGate(-14, -4, "Emergency Exit 1", 0xd97706);
    const emergencyExit2 = createGate(14, -4, "Emergency Exit 2", 0xd97706);

    venueGroup.add(gateA, gateB, emergencyExit1, emergencyExit2);

    // Medical Tent & Command HQ
    const tentGeo = new THREE.ConeGeometry(2.5, 3, 4);
    tentGeo.rotateY(Math.PI / 4);
    const medMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const medTent = new THREE.Mesh(tentGeo, medMat);
    medTent.position.set(-12, 1.5, 2);
    medTent.userData = {
      name: "Medical Emergency Hub",
      type: "First Aid Station",
      capacity: "12 Triage Beds",
      status: "Ready",
    };
    venueGroup.add(medTent);

    const hqMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const hq = new THREE.Mesh(tentGeo, hqMat);
    hq.position.set(12, 1.5, 2);
    hq.userData = {
      name: "Security Command HQ",
      type: "Operational Control",
      capacity: "35 Officers",
      status: "Monitoring Live Feed",
    };
    venueGroup.add(hq);

    // 4. Security Radius Spheres
    const secRadiusGroup = new THREE.Group();
    const secSphereGeo = new THREE.SphereGeometry(7, 32, 16);
    const secSphereMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const secSphere1 = new THREE.Mesh(secSphereGeo, secSphereMat);
    secSphere1.position.set(12, 1, 2);
    const secSphere2 = new THREE.Mesh(secSphereGeo, secSphereMat);
    secSphere2.position.set(-12, 1, 2);
    secRadiusGroup.add(secSphere1, secSphere2);
    scene.add(secRadiusGroup);

    // 5. Evacuation Flow Tube Lines
    const evacLinesGroup = new THREE.Group();
    const createEvacLine = (fromPos, toPos, lineColor) => {
      const points = [
        new THREE.Vector3(...fromPos),
        new THREE.Vector3(fromPos[0], 0.3, (fromPos[2] + toPos[2]) / 2),
        new THREE.Vector3(...toPos),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.25, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.75,
      });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    const line1 = createEvacLine([0, 0.3, -7], [-14, 0.3, -4], 0xd97706);
    const line2 = createEvacLine([0, 0.3, -7], [14, 0.3, -4], 0xd97706);
    const line3 = createEvacLine([0, 0.3, -7], [-10, 0.3, 14], 0x059669);
    const line4 = createEvacLine([0, 0.3, -7], [10, 0.3, 14], 0x059669);

    evacLinesGroup.add(line1, line2, line3, line4);
    scene.add(evacLinesGroup);

    // 6. Raycasting for Clicking 3D Nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(venueGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData?.name && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.name) {
          setSelectedNode(obj.userData);
        }
      }
    };

    container.addEventListener("click", handleClick);

    // 7. Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      scene.rotation.y = elapsed * 0.035;

      if (activeLayer === "evacuation") {
        evacLinesGroup.visible = true;
        secRadiusGroup.visible = false;
      } else if (activeLayer === "security") {
        evacLinesGroup.visible = false;
        secRadiusGroup.visible = true;
      } else {
        evacLinesGroup.visible = true;
        secRadiusGroup.visible = true;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
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
      cancelAnimationFrame(animationId);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      floorGeo.dispose();
      stageGeo.dispose();
      renderer.dispose();
    };
  }, [activeLayer]);

  return (
    <div className="w-full bg-white/90 border border-amber-200/80 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-xl shadow-amber-900/5 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-mono text-xs tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4" />
            <span>Interactive 3D Venue Blueprint</span>
          </div>
          <h3 className="text-2xl font-bold text-amber-950 tracking-tight font-serif">
            Tactical Spatial Venue Inspection
          </h3>
        </div>

        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-amber-50/80 p-1.5 rounded-xl border border-amber-200/60">
          {[
            { id: "all", label: "All Layers", icon: Layers },
            { id: "evacuation", label: "Evacuation Paths", icon: Navigation },
            { id: "security", label: "Security Zones", icon: Shield },
          ].map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLayer === layer.id
                    ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/20"
                    : "text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewport Area */}
      <div className="relative w-full h-[420px] bg-gradient-to-br from-[#fff7ed] to-white rounded-2xl border border-amber-200/80 overflow-hidden">
        <div ref={containerRef} className="w-full h-full cursor-pointer" />

        {/* Selected Node Inspector Overlay */}
        {selectedNode ? (
          <div className="absolute top-4 left-4 bg-white/95 border border-amber-300 p-4 rounded-xl max-w-xs shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-700 text-xs font-mono mb-1">
              <span className="flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5" /> TELEMETRY NODE
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <h4 className="text-base font-bold text-amber-950">{selectedNode.name}</h4>
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <div>
                <span className="text-slate-500">Category:</span>{" "}
                <span className="font-semibold text-amber-800">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-slate-500">Capacity:</span>{" "}
                <span className="font-semibold text-emerald-700">{selectedNode.capacity}</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <span className="font-semibold text-amber-700">{selectedNode.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-200 text-xs text-slate-600 flex items-center gap-2 pointer-events-none shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Click any 3D structure to inspect spatial telemetry</span>
          </div>
        )}
      </div>
    </div>
  );
}
