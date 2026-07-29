import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Sliders, Shield, AlertTriangle, Users, Wind, CheckCircle2, RotateCcw } from "lucide-react";

export default function RiskSimulator3D() {
  // Input parameters state
  const [attendees, setAttendees] = useState(25000);
  const [gateWidth, setGateWidth] = useState(6);
  const [exits, setExits] = useState(4);
  const [security, setSecurity] = useState(80);
  const [weather, setWeather] = useState(1); // 1: Clear, 2: Rain, 3: Storm

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const barsRef = useRef([]);

  // Calculate risk metrics mathematically
  const calculateMetrics = () => {
    // Basic capacity bottleneck calculation
    const exitCapacity = gateWidth * exits * 450; // max people per min
    const idealSecurityRatio = attendees / 250; // 1 security per 250 people
    const securityCoverage = Math.min(1.2, security / Math.max(1, idealSecurityRatio));

    const bottleneckRatio = attendees / (exitCapacity * 1.5);
    const weatherPenalty = weather === 1 ? 1 : weather === 2 ? 1.35 : 1.75;

    let rawRisk = Math.min(
      99,
      Math.max(
        5,
        Math.round((bottleneckRatio * 45 * weatherPenalty) / securityCoverage)
      )
    );

    const evacuationTimeMin = Math.round(attendees / Math.max(1, exitCapacity) * weatherPenalty * 10) / 10;
    const maxDensity = Math.round((attendees / 5000) * (weatherPenalty / (exits * 0.5)) * 10) / 10;
    const stampedeOdds = rawRisk > 70 ? Math.round((rawRisk - 55) * 1.8) : Math.round(rawRisk * 0.15);

    let statusLabel = "LOW RISK (SAFE)";
    let statusColor = "#10b981"; // Emerald green
    if (rawRisk > 40 && rawRisk <= 70) {
      statusLabel = "MODERATE WARNING";
      statusColor = "#f59e0b"; // Amber
    } else if (rawRisk > 70) {
      statusLabel = "CRITICAL HAZARD";
      statusColor = "#ef4444"; // Crimson
    }

    return {
      rawRisk,
      evacuationTimeMin,
      maxDensity,
      stampedeOdds,
      statusLabel,
      statusColor,
    };
  };

  const metrics = calculateMetrics();

  // Initialize Three.js 3D Bar Heatmap Matrix
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(16, 22, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd580, 1.2);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    // 3D Grid of Bar Cubes (7x7 matrix)
    const gridSize = 7;
    const barSpacing = 2.2;
    const offset = ((gridSize - 1) * barSpacing) / 2;
    const bars = [];

    const barGeo = new THREE.BoxGeometry(1.6, 1, 1.6);
    // Shift origin to bottom of box for easy scaling from floor up
    barGeo.translate(0, 0.5, 0);

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(barGeo, mat);
        mesh.position.set(x * barSpacing - offset, 0, z * barSpacing - offset);

        // Calculate distance from center (stage / main gate bottleneck zone)
        const distFromCenter = Math.hypot(x - 3, z - 3);

        scene.add(mesh);
        bars.push({ mesh, x, z, distFromCenter });
      }
    }
    barsRef.current = bars;

    // Ground tactical grid floor
    const gridHelper = new THREE.GridHelper(22, 14, 0xd97706, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Animation & Controls Loop
    let clock = new THREE.Clock();
    let animationId;
    let isDragging = false;
    let previousMouseX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      scene.rotation.y += deltaX * 0.008;
      previousMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const animate = () => {
      const time = clock.getElapsedTime();

      if (!isDragging) {
        scene.rotation.y += 0.002; // Slow ambient orbit
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
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      barGeo.dispose();
      renderer.dispose();
    };
  }, []);

  // Update 3D Bar Heights and Colors dynamically when metrics change
  useEffect(() => {
    if (!barsRef.current || barsRef.current.length === 0) return;

    const riskFactor = metrics.rawRisk / 100;

    barsRef.current.forEach(({ mesh, distFromCenter }) => {
      // Center & gate zones experience highest density spike
      const densityMultiplier = 1 + (3 - distFromCenter) * 0.35;
      const targetHeight = Math.max(
        0.5,
        1.2 + riskFactor * 8.5 * Math.max(0.3, densityMultiplier)
      );

      // Lerp scale
      mesh.scale.y = targetHeight;

      // Color mapping based on height/risk
      const heightRisk = (targetHeight - 0.5) / 8;
      let barColor = new THREE.Color(0x10b981); // Emerald
      if (heightRisk > 0.35 && heightRisk <= 0.65) {
        barColor.setHex(0xf59e0b); // Amber
      } else if (heightRisk > 0.65) {
        barColor.setHex(0xef4444); // Crimson red
      }

      mesh.material.color = barColor;
    });
  }, [metrics.rawRisk, attendees, gateWidth, exits, security, weather]);

  // Preset Scenario Loaders
  const applyPreset = (preset) => {
    if (preset === "safe") {
      setAttendees(15000);
      setGateWidth(12);
      setExits(8);
      setSecurity(150);
      setWeather(1);
    } else if (preset === "warning") {
      setAttendees(45000);
      setGateWidth(6);
      setExits(4);
      setSecurity(70);
      setWeather(2);
    } else if (preset === "critical") {
      setAttendees(85000);
      setGateWidth(3);
      setExits(2);
      setSecurity(40);
      setWeather(3);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs tracking-wider uppercase mb-1">
            <Sliders className="w-4 h-4" />
            <span>Interactive 3D WebGL Simulation Engine</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Real-Time Crowd Risk & Bottleneck Simulator
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Adjust crowd parameters below to visualize 3D spatial density spikes, exit bottlenecks, and AI safety risk scores.
          </p>
        </div>

        {/* Preset buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyPreset("safe")}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
          >
            Safe Preset
          </button>
          <button
            onClick={() => applyPreset("warning")}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-all"
          >
            Overcrowded
          </button>
          <button
            onClick={() => applyPreset("critical")}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all"
          >
            Hazard Scenario
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + 3D Viewport + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-4 space-y-5 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Event Input Parameters
          </h4>

          {/* Attendee Slider */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" /> Expected Crowd
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {attendees.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2500"
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Gate Exit Width Slider */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" /> Main Gate Width
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                {gateWidth} Meters
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={gateWidth}
              onChange={(e) => setGateWidth(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Emergency Exits Slider */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Emergency Exit Gates
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                {exits} Gates
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={exits}
              onChange={(e) => setExits(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Security Personnel Slider */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" /> Security Personnel
              </span>
              <span className="text-purple-400 font-mono font-bold">
                {security} Guards
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={security}
              onChange={(e) => setSecurity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Weather Selector */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-blue-400" /> Weather Condition
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, label: "Clear" },
                { id: 2, label: "Rain" },
                { id: 3, label: "Storm" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setWeather(item.id)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    weather === item.id
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: 3D Three.js WebGL Canvas */}
        <div className="lg:col-span-5 relative h-[380px] bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden group">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Interactive instruction tip */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-slate-400 border border-slate-800 pointer-events-none flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Drag to rotate 3D heatmap matrix</span>
          </div>
        </div>

        {/* Right Column: Live Calculated Metrics Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Risk Meter Card */}
          <div
            className="p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden"
            style={{
              borderColor: `${metrics.statusColor}40`,
              backgroundColor: `${metrics.statusColor}10`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                AI Risk Score
              </span>
              <AlertTriangle
                className="w-5 h-5"
                style={{ color: metrics.statusColor }}
              />
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-black font-mono tracking-tight"
                style={{ color: metrics.statusColor }}
              >
                {metrics.rawRisk}%
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${metrics.statusColor}25`,
                  color: metrics.statusColor,
                }}
              >
                {metrics.statusLabel}
              </span>
            </div>

            {/* Risk Gauge Bar */}
            <div className="w-full h-2 bg-slate-950/80 rounded-full mt-3 overflow-hidden border border-slate-800">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${metrics.rawRisk}%`,
                  backgroundColor: metrics.statusColor,
                }}
              />
            </div>
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono uppercase">
                Evac Time
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {metrics.evacuationTimeMin} <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono uppercase">
                Max Density
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {metrics.maxDensity} <span className="text-xs text-slate-400">p/m²</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono uppercase">
                Stampede Risk
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {metrics.stampedeOdds}%
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono uppercase">
                Security Ratio
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                1:{Math.round(attendees / Math.max(1, security))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
