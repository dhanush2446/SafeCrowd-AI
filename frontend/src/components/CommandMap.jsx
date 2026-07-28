import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Polygon, Polyline,
  useMapEvents, useMap, ImageOverlay
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ELEMENT_TYPES } from "./ElementPalette";

// ── Leaflet default-icon fix ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ── Coloured icon builder ──
function buildIcon(emoji, bg, size = 30) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;
      border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);
      display:flex;align-items:center;justify-content:center;font-size:${size * 0.48}px;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Pre-built plan icons
const PLAN_ICONS = {
  venue: buildIcon("🏟️", "#d97706"),
  checkpoint: buildIcon("🛡️", "#2563eb"),
  emergency: buildIcon("🚨", "#dc2626"),
  medical: buildIcon("🏥", "#059669"),
  parking: buildIcon("🅿️", "#6366f1"),
};

// Element icons from palette
function getElementIcon(type) {
  const def = ELEMENT_TYPES.find((t) => t.id === type);
  if (!def) return buildIcon("📌", "#6b7280");
  return buildIcon(def.emoji, def.color);
}

// ── Fly map to position ──
function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom || 15, { duration: 1.2 });
  }, [position, zoom, map]);
  return null;
}

// ── Handle map clicks for location picking OR element placement ──
function MapClickHandler({ activeTool, onLocationSelect, onElementPlace, ctrlHeld, onCoordPin }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Ctrl+Click = pin coordinate for chatbot
      if (ctrlHeld && onCoordPin) {
        onCoordPin({ lat, lng });
        return;
      }
      if (activeTool) {
        // Place element
        onElementPlace({ lat, lng });
      } else {
        // Pick location
        onLocationSelect({ lat, lng, name: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          .then((r) => r.json())
          .then((d) => d?.display_name && onLocationSelect({ lat, lng, name: d.display_name }))
          .catch(() => {});
      }
    },
  });
  return null;
}

// ── Coordinate tracker (Ctrl + hover) ──
function CoordTracker({ onCoordHover }) {
  const map = useMap();
  const [ctrlHeld, setCtrlHeld] = useState(false);
  const [coord, setCoord] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Control") setCtrlHeld(true); };
    const onKeyUp = (e) => {
      if (e.key === "Control") {
        setCtrlHeld(false);
        setCoord(null);
        if (onCoordHover) onCoordHover(null);
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onCoordHover]);

  useEffect(() => {
    if (!ctrlHeld) {
      map.getContainer().classList.remove("coord-tracking");
      // Re-enable zoom handlers
      map.scrollWheelZoom.enable();
      if (map.boxZoom) map.boxZoom.enable();
      return;
    }
    map.getContainer().classList.add("coord-tracking");

    // Disable zoom handlers so Ctrl doesn't interfere
    map.scrollWheelZoom.disable();
    if (map.boxZoom) map.boxZoom.disable();

    const onMouseMove = (e) => {
      const { lat, lng } = e.latlng;
      const c = { lat, lng };
      setCoord(c);
      if (onCoordHover) onCoordHover(c);

      // Update / create tooltip
      if (!tooltipRef.current) {
        tooltipRef.current = L.tooltip({
          permanent: true,
          direction: "right",
          offset: [15, 0],
          className: "coord-tooltip",
        });
        tooltipRef.current.addTo(map);
      }
      tooltipRef.current.setLatLng(e.latlng);
      tooltipRef.current.setContent(
        `<span style="font-family:monospace;font-size:11px;">📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/><span style="font-size:9px;color:#92400e;">Click to pin</span>`
      );
    };

    map.on("mousemove", onMouseMove);
    return () => {
      map.off("mousemove", onMouseMove);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      map.getContainer().classList.remove("coord-tracking");
      map.scrollWheelZoom.enable();
      if (map.boxZoom) map.boxZoom.enable();
    };
  }, [ctrlHeld, map, onCoordHover]);

  return null;
}

// ── Location search bar ──
function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = async (q) => {
    if (!q.trim() || q.length < 3) return setResults([]);
    setLoading(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`
      );
      setResults(await r.json());
    } catch { /* silence */ }
    setLoading(false);
  };

  const onType = (e) => {
    setQuery(e.target.value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(e.target.value), 500);
  };

  const pick = (r) => {
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), name: r.display_name });
    setResults([]);
    setQuery(r.display_name.split(",")[0]);
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-[1000]">
      <div className="relative">
        <input
          value={query}
          onChange={onType}
          placeholder="🔍 Search venue or address…"
          className="w-full px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-amber-200/60
                     text-sm text-gray-700 placeholder-gray-400 shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {results.length > 0 && (
          <div className="absolute w-full mt-1 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-amber-100 overflow-hidden max-h-56 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.place_id}
                onClick={() => pick(r)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 cursor-pointer border-b border-amber-50 last:border-b-0"
              >
                <p className="font-medium text-amber-800 truncate">{r.display_name.split(",")[0]}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{r.display_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom map image overlay controls ──
function CustomMapOverlay({ customMap, onUpload, onRemove }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target.result);
    reader.readAsDataURL(file);
  };

  if (customMap) {
    return (
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-amber-200/60 flex items-center gap-2">
          <span className="text-xs text-emerald-600 font-medium">🗺️ Custom map active</span>
          <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 font-medium">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 z-[1000]">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="bg-white/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-amber-200/60
                   text-xs text-amber-700 hover:bg-amber-50 transition-colors font-medium flex items-center gap-1.5"
      >
        📤 Upload Venue Map
      </button>
    </div>
  );
}

// ── Auto-calibration: intelligent venue-aware planning engine ──

// Helper: point inside polygon test (ray casting)
function pointInPolygon(pt, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── Crowd-size scaling: how many of each element type ───
function getElementCounts(attendees = 5000) {
  if (attendees >= 50000) return { gates: 6, security: 12, medical: 4, cctv: 10, exits: 6, barricades: 6, parking: 3 };
  if (attendees >= 20000) return { gates: 4, security: 8,  medical: 3, cctv: 8,  exits: 5, barricades: 4, parking: 2 };
  if (attendees >= 5000)  return { gates: 3, security: 5,  medical: 2, cctv: 5,  exits: 4, barricades: 3, parking: 2 };
  if (attendees >= 1000)  return { gates: 2, security: 3,  medical: 1, cctv: 3,  exits: 3, barricades: 2, parking: 1 };
  return                         { gates: 1, security: 2,  medical: 1, cctv: 2,  exits: 2, barricades: 1, parking: 1 };
}

// ─── Fetch roads, hospitals, parking from Overpass (single query) ───
async function fetchNearbyContext(lat, lng) {
  const query = `[out:json][timeout:12];(way["highway"~"primary|secondary|tertiary|trunk|residential"](around:400,${lat},${lng});node["amenity"="hospital"](around:2500,${lat},${lng});way["amenity"="hospital"](around:2500,${lat},${lng});node["amenity"="parking"](around:600,${lat},${lng});way["amenity"="parking"](around:600,${lat},${lng});node["amenity"="police"](around:2000,${lat},${lng}););out center;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await res.json();
    const items = { roads: [], hospitals: [], parking: [], police: [] };
    for (const el of data.elements || []) {
      const elLat = el.center?.lat ?? el.lat;
      const elLng = el.center?.lon ?? el.lon;
      if (!elLat || !elLng) continue;
      const tags = el.tags || {};
      if (tags.highway) {
        items.roads.push({ lat: elLat, lng: elLng, name: tags.name || "Road", type: tags.highway });
      } else if (tags.amenity === "hospital") {
        items.hospitals.push({ lat: elLat, lng: elLng, name: tags.name || "Hospital" });
      } else if (tags.amenity === "parking") {
        items.parking.push({ lat: elLat, lng: elLng, name: tags.name || "Parking Lot" });
      } else if (tags.amenity === "police") {
        items.police.push({ lat: elLat, lng: elLng, name: tags.name || "Police Station" });
      }
    }
    return items;
  } catch {
    return { roads: [], hospitals: [], parking: [], police: [] };
  }
}

// ─── Determine which direction has the most/closest roads ───
function determineApproachDirection(lat, lng, roads) {
  if (roads.length === 0) return "S"; // default: south approach
  const weights = { N: 0, S: 0, E: 0, W: 0 };
  for (const road of roads) {
    const dLat = road.lat - lat;
    const dLng = road.lng - lng;
    const dist = Math.sqrt(dLat ** 2 + dLng ** 2) + 0.00001;
    const w = 1 / dist;
    if (Math.abs(dLat) > Math.abs(dLng)) {
      weights[dLat > 0 ? "N" : "S"] += w;
    } else {
      weights[dLng > 0 ? "E" : "W"] += w;
    }
  }
  return Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];
}

const OPPOSITE = { N: "S", S: "N", E: "W", W: "E" };
const ADJACENT = { N: ["E", "W"], S: ["E", "W"], E: ["N", "S"], W: ["N", "S"] };

// ─── Spread N points along a bbox edge ───
function distributeAlongEdge(bbox, direction, count, inset = 0.08) {
  const [minLat, maxLat, minLng, maxLng] = bbox;
  const latSpan = maxLat - minLat, lngSpan = maxLng - minLng;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    switch (direction) {
      case "S": pts.push([minLat + latSpan * inset, minLng + lngSpan * t]); break;
      case "N": pts.push([maxLat - latSpan * inset, minLng + lngSpan * t]); break;
      case "E": pts.push([minLat + latSpan * t, maxLng - lngSpan * inset]); break;
      case "W": pts.push([minLat + latSpan * t, minLng + lngSpan * inset]); break;
    }
  }
  return pts;
}

// ─── Distribute N points inside bbox/polygon ───
function distributeInterior(bbox, polygon, count) {
  const [minLat, maxLat, minLng, maxLng] = bbox;
  const margin = 0.12;
  const iMinLat = minLat + (maxLat - minLat) * margin;
  const iMaxLat = maxLat - (maxLat - minLat) * margin;
  const iMinLng = minLng + (maxLng - minLng) * margin;
  const iMaxLng = maxLng - (maxLng - minLng) * margin;
  const pts = [];
  const rows = Math.ceil(Math.sqrt(count * 1.5));
  const cols = Math.ceil(count / rows);
  const latStep = (iMaxLat - iMinLat) / (rows + 1);
  const lngStep = (iMaxLng - iMinLng) / (cols + 1);
  for (let r = 1; r <= rows && pts.length < count; r++) {
    for (let c = 1; c <= cols && pts.length < count; c++) {
      const lat = iMinLat + latStep * r;
      const lng = iMinLng + lngStep * c;
      if (polygon && polygon.length > 3 && !pointInPolygon([lat, lng], polygon)) continue;
      pts.push([lat, lng]);
    }
  }
  // Fill with centroid offsets if polygon filtered too many
  const centLat = (minLat + maxLat) / 2, centLng = (minLng + maxLng) / 2;
  while (pts.length < count) {
    const a = (pts.length / count) * Math.PI * 2;
    const r = Math.min(maxLat - minLat, maxLng - minLng) * 0.25;
    pts.push([centLat + Math.cos(a) * r, centLng + Math.sin(a) * r]);
  }
  return pts;
}

// ─── Get stage position based on event type ───
function getStagePosition(bbox, approach, eventType) {
  const [minLat, maxLat, minLng, maxLng] = bbox;
  const midLat = (minLat + maxLat) / 2, midLng = (minLng + maxLng) / 2;
  const latSpan = maxLat - minLat, lngSpan = maxLng - minLng;
  const back = OPPOSITE[approach];
  switch (eventType) {
    case "sports": return [midLat, midLng]; // center field
    case "exhibition": case "fair": return [midLat, midLng]; // center hall
    default: { // concert, religious, festival, default → stage at back
      switch (back) {
        case "N": return [maxLat - latSpan * 0.15, midLng];
        case "S": return [minLat + latSpan * 0.15, midLng];
        case "E": return [midLat, maxLng - lngSpan * 0.15];
        case "W": return [midLat, minLng + lngSpan * 0.15];
      }
    }
  }
  return [midLat, midLng];
}

// ─── Distance between two points (degrees, approximate) ───
function geoDist(a, b) {
  const dLat = (a[0] || a.lat) - (b[0] || b.lat);
  const dLng = (a[1] || a.lng) - (b[1] || b.lng);
  return Math.sqrt(dLat ** 2 + dLng ** 2);
}
function distMeters(a, b) {
  return geoDist(a, b) * 111320; // rough degrees→meters
}

/**
 * SMART AUTO-CALIBRATE
 * Fetches venue boundary + nearby context, then places markers intelligently.
 */
export async function autoCalibrate(location, options = {}) {
  const { lat, lng, name } = location;
  const { attendees = 5000, eventType = "concert" } = options;
  let polygon = null;
  let bbox = null;

  // 1. Fetch venue boundary from Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&polygon_geojson=1&countrycodes=in`
    );
    const data = await res.json();
    if (data?.[0]?.geojson) {
      const geo = data[0].geojson;
      if (geo.type === "Polygon" && geo.coordinates?.[0]) {
        polygon = geo.coordinates[0].map(([ln, lt]) => [lt, ln]);
      } else if (geo.type === "MultiPolygon" && geo.coordinates?.[0]?.[0]) {
        polygon = geo.coordinates[0][0].map(([ln, lt]) => [lt, ln]);
      }
    }
    if (data?.[0]?.boundingbox) {
      const bb = data[0].boundingbox.map(Number);
      bbox = [bb[0], bb[1], bb[2], bb[3]];
    }
  } catch (err) {
    console.warn("[SafeCrowd] Could not fetch venue boundary:", err);
  }

  if (!bbox) {
    const d = 0.003;
    bbox = [lat - d, lat + d, lng - d, lng + d];
  }

  // Enforce minimum bbox (~300m)
  const MIN_SPAN = 0.003;
  if (bbox[1] - bbox[0] < MIN_SPAN) { const m = (bbox[0]+bbox[1])/2; bbox[0]=m-MIN_SPAN/2; bbox[1]=m+MIN_SPAN/2; }
  if (bbox[3] - bbox[2] < MIN_SPAN) { const m = (bbox[2]+bbox[3])/2; bbox[2]=m-MIN_SPAN/2; bbox[3]=m+MIN_SPAN/2; }

  // 2. Fetch nearby context from Overpass (roads, hospitals, parking, police)
  const ctx = await fetchNearbyContext(lat, lng);

  // 3. Determine approach direction (which side faces roads)
  const approach = determineApproachDirection(lat, lng, ctx.roads);
  const back = OPPOSITE[approach];
  const sides = ADJACENT[approach];

  // 4. Get element counts based on crowd size
  const counts = getElementCounts(attendees);
  const uid = () => `cal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const elements = [];

  // 5. GATES — on road-facing (approach) side
  const gatePositions = distributeAlongEdge(bbox, approach, counts.gates, 0.05);
  const gateLabels = ["Main Entry Gate", "Gate B", "Gate C", "Gate D", "Gate E", "Gate F"];
  gatePositions.forEach((pos, i) => {
    elements.push({ id: uid(), type: "gate", lat: pos[0], lng: pos[1], label: gateLabels[i] || `Gate ${i+1}`, source: "calibration" });
  });

  // 6. EXITS — on opposite side from gates + sides
  const exitBackCount = Math.ceil(counts.exits * 0.6);
  const exitSideCount = counts.exits - exitBackCount;
  const exitBack = distributeAlongEdge(bbox, back, exitBackCount, 0.05);
  exitBack.forEach((pos, i) => {
    elements.push({ id: uid(), type: "exit", lat: pos[0], lng: pos[1], label: `Emergency Exit ${String.fromCharCode(65+i)}`, source: "calibration" });
  });
  // Distribute remaining exits across sides
  sides.forEach((side, si) => {
    const sideExits = distributeAlongEdge(bbox, side, Math.ceil(exitSideCount / 2), 0.05);
    sideExits.forEach((pos, i) => {
      elements.push({ id: uid(), type: "exit", lat: pos[0], lng: pos[1], label: `Exit ${sides[si]}-${i+1}`, source: "calibration" });
    });
  });

  // 7. SECURITY — flanking gates + distributed
  const secPerGate = Math.min(2, Math.floor(counts.security / counts.gates));
  const secRemaining = counts.security - secPerGate * counts.gates;
  const [minLat, maxLat, minLng, maxLng] = bbox;
  const latSpan = maxLat - minLat, lngSpan = maxLng - minLng;
  gatePositions.forEach((pos, gi) => {
    for (let s = 0; s < secPerGate; s++) {
      const offset = (s === 0 ? -1 : 1) * lngSpan * 0.04;
      const isVertical = approach === "E" || approach === "W";
      elements.push({
        id: uid(), type: "security",
        lat: pos[0] + (isVertical ? offset : 0),
        lng: pos[1] + (isVertical ? 0 : offset),
        label: `Security – ${gateLabels[gi] || "Gate"} ${s === 0 ? "L" : "R"}`,
        source: "calibration",
      });
    }
  });
  // Remaining security distributed interior
  if (secRemaining > 0) {
    const secInterior = distributeInterior(bbox, polygon, secRemaining);
    secInterior.forEach((pos, i) => {
      elements.push({ id: uid(), type: "security", lat: pos[0], lng: pos[1], label: `Security Patrol ${i+1}`, source: "calibration" });
    });
  }

  // 8. STAGE — event-type-aware position
  const stagePos = getStagePosition(bbox, approach, eventType);
  elements.push({ id: uid(), type: "stage", lat: stagePos[0], lng: stagePos[1], label: eventType === "sports" ? "Main Field" : "Main Stage", source: "calibration" });

  // 9. MEDICAL — interior, labeled with nearest real hospital
  const medPositions = distributeInterior(bbox, polygon, counts.medical);
  medPositions.forEach((pos, i) => {
    let label = `Medical Post ${i+1}`;
    if (ctx.hospitals.length > 0) {
      // Find nearest hospital
      let nearest = ctx.hospitals[0], nearestDist = distMeters(pos, nearest);
      for (const h of ctx.hospitals) {
        const d = distMeters(pos, h);
        if (d < nearestDist) { nearest = h; nearestDist = d; }
      }
      label = `Medical Post ${i+1} (→ ${nearest.name} ${Math.round(nearestDist)}m)`;
    }
    elements.push({ id: uid(), type: "medical", lat: pos[0], lng: pos[1], label, source: "calibration" });
  });

  // 10. CCTV — corners + center for max coverage
  const cctvPositions = [];
  const corners = [
    [minLat + latSpan * 0.08, minLng + lngSpan * 0.08],
    [minLat + latSpan * 0.08, maxLng - lngSpan * 0.08],
    [maxLat - latSpan * 0.08, minLng + lngSpan * 0.08],
    [maxLat - latSpan * 0.08, maxLng - lngSpan * 0.08],
    [(minLat+maxLat)/2, (minLng+maxLng)/2],
  ];
  for (let i = 0; i < counts.cctv && i < corners.length; i++) {
    cctvPositions.push(corners[i]);
  }
  // Extra CCTV along edges if needed
  if (counts.cctv > corners.length) {
    const extra = distributeAlongEdge(bbox, approach, counts.cctv - corners.length, 0.12);
    cctvPositions.push(...extra);
  }
  const cctvLabels = ["CCTV – SW", "CCTV – SE", "CCTV – NW", "CCTV – NE", "CCTV – Center"];
  cctvPositions.forEach((pos, i) => {
    elements.push({ id: uid(), type: "cctv", lat: pos[0], lng: pos[1], label: cctvLabels[i] || `CCTV ${i+1}`, source: "calibration" });
  });

  // 11. BARRICADES — crowd flow channels between gates and stage
  const barricadePositions = [];
  if (counts.barricades >= 2) {
    // Two lanes from front toward stage
    const midLat = (minLat + maxLat) / 2, midLng = (minLng + maxLng) / 2;
    const laneOffset = lngSpan * 0.15;
    const isVertical = approach === "E" || approach === "W";
    for (let i = 0; i < Math.min(counts.barricades, 4); i++) {
      const sign = i % 2 === 0 ? -1 : 1;
      const depth = 0.3 + (Math.floor(i / 2)) * 0.2;
      if (isVertical) {
        barricadePositions.push([midLat + sign * latSpan * 0.12, midLng + (approach === "E" ? -1 : 1) * lngSpan * depth]);
      } else {
        barricadePositions.push([midLat + (approach === "S" ? 1 : -1) * latSpan * depth, midLng + sign * lngSpan * 0.12]);
      }
    }
  }
  // Extra barricades distributed
  while (barricadePositions.length < counts.barricades) {
    const extra = distributeInterior(bbox, polygon, 1);
    barricadePositions.push(extra[0]);
  }
  barricadePositions.forEach((pos, i) => {
    elements.push({ id: uid(), type: "barricade", lat: pos[0], lng: pos[1], label: `Barricade ${i+1}`, source: "calibration" });
  });

  // 12. PARKING — use real parking lots from Overpass if available, else inside perimeter
  if (ctx.parking.length > 0) {
    const usedParking = ctx.parking.slice(0, counts.parking);
    usedParking.forEach((p, i) => {
      elements.push({ id: uid(), type: "parking", lat: p.lat, lng: p.lng, label: p.name !== "Parking Lot" ? p.name : `Parking Zone ${i+1}`, source: "calibration" });
    });
    // Fill remaining with generated positions
    for (let i = usedParking.length; i < counts.parking; i++) {
      const pts = distributeAlongEdge(bbox, approach, 1, 0.1);
      elements.push({ id: uid(), type: "parking", lat: pts[0][0], lng: pts[0][1], label: `Parking Area ${i+1}`, source: "calibration" });
    }
  } else {
    // No real parking data — place near approach side
    const parkPositions = distributeAlongEdge(bbox, approach, counts.parking, 0.1);
    parkPositions.forEach((pos, i) => {
      elements.push({ id: uid(), type: "parking", lat: pos[0], lng: pos[1], label: i === 0 ? "Public Parking" : `VIP Parking`, source: "calibration" });
    });
  }

  const vizData = {
    boundary: polygon,
    bbox,
    approach, // expose for debugging/display
    routes: [],
    nearbyContext: {
      hospitals: ctx.hospitals.slice(0, 3),
      police: ctx.police.slice(0, 2),
    },
  };

  return { vizData, elements };
}

// Legacy sync version (fallback — no Overpass, just bbox math)
export function makePlanData(c, options = {}) {
  const { lat, lng } = c;
  const { attendees = 5000, eventType = "concert" } = options;
  const d = 0.003;
  const bbox = [lat - d, lat + d, lng - d, lng + d];
  const counts = getElementCounts(attendees);
  const uid = () => `cal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const approach = "S"; // default
  const back = "N";

  const elements = [];

  // Gates on south
  distributeAlongEdge(bbox, approach, counts.gates, 0.05).forEach((pos, i) => {
    elements.push({ id: uid(), type: "gate", lat: pos[0], lng: pos[1], label: i === 0 ? "Main Entry Gate" : `Gate ${String.fromCharCode(66+i)}`, source: "calibration" });
  });

  // Exits on north
  distributeAlongEdge(bbox, back, Math.min(counts.exits, 3), 0.05).forEach((pos, i) => {
    elements.push({ id: uid(), type: "exit", lat: pos[0], lng: pos[1], label: `Emergency Exit ${String.fromCharCode(65+i)}`, source: "calibration" });
  });

  // Stage
  const stagePos = getStagePosition(bbox, approach, eventType);
  elements.push({ id: uid(), type: "stage", lat: stagePos[0], lng: stagePos[1], label: "Main Stage", source: "calibration" });

  // Security — flanking first gate + patrol
  const [minLat, maxLat, minLng, maxLng] = bbox;
  const lngSpan = maxLng - minLng;
  const gateSouth = [minLat + (maxLat-minLat)*0.05, (minLng+maxLng)/2];
  elements.push({ id: uid(), type: "security", lat: gateSouth[0] + 0.0002, lng: gateSouth[1] - lngSpan*0.08, label: "Security – Gate L", source: "calibration" });
  elements.push({ id: uid(), type: "security", lat: gateSouth[0] + 0.0002, lng: gateSouth[1] + lngSpan*0.08, label: "Security – Gate R", source: "calibration" });

  // Medical
  distributeInterior(bbox, null, counts.medical).forEach((pos, i) => {
    elements.push({ id: uid(), type: "medical", lat: pos[0], lng: pos[1], label: `Medical Post ${i+1}`, source: "calibration" });
  });

  // CCTV
  const cctvCorners = [
    [minLat + (maxLat-minLat)*0.08, minLng + lngSpan*0.08],
    [maxLat - (maxLat-minLat)*0.08, maxLng - lngSpan*0.08],
  ];
  cctvCorners.forEach((pos, i) => {
    elements.push({ id: uid(), type: "cctv", lat: pos[0], lng: pos[1], label: i === 0 ? "CCTV – SW" : "CCTV – NE", source: "calibration" });
  });

  // Parking
  elements.push({ id: uid(), type: "parking", lat: minLat + (maxLat-minLat)*0.1, lng: minLng + lngSpan*0.15, label: "Parking Zone", source: "calibration" });

  const vizData = { boundary: null, bbox, approach, routes: [] };
  return { vizData, elements };
}

// ═══════════════════════════════════════
//  MAIN COMMAND MAP EXPORT
// ═══════════════════════════════════════

export default function CommandMap({
  location, onMapClick, onVenueSelect,
  activeTool, placedElements, onElementPlace,
  showPlanViz, planVizData,
  customMapUrl, onCustomMapUpload, onCustomMapRemove,
  onCoordHover, onCoordPin,
  elementsLocked,
  onRemoveElement,
}) {
  const DEFAULT_CENTER = [17.385, 78.4867];
  const center = location ? [location.lat, location.lng] : DEFAULT_CENTER;
  const d = 0.006; // bounds offset for custom map overlay
  const [ctrlHeld, setCtrlHeld] = useState(false);

  // Track Ctrl key at component level for MapClickHandler
  useEffect(() => {
    const down = (e) => { if (e.key === "Control") setCtrlHeld(true); };
    const up = (e) => { if (e.key === "Control") setCtrlHeld(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border border-amber-200/30 shadow-inner ${activeTool ? "placement-active" : ""}`}>
      {/* Search bar overlay — triggers calibration */}
      <LocationSearch onSelect={onVenueSelect} />

      {/* Custom map upload overlay */}
      <CustomMapOverlay customMap={customMapUrl} onUpload={onCustomMapUpload} onRemove={onCustomMapRemove} />

      {/* Placement mode indicator */}
      {activeTool && (
        <div className="absolute top-3 right-3 z-[1000] bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
          Click map to place {ELEMENT_TYPES.find(t => t.id === activeTool)?.label}
        </div>
      )}

      <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          activeTool={activeTool}
          onLocationSelect={onMapClick}
          onElementPlace={onElementPlace}
          ctrlHeld={ctrlHeld}
          onCoordPin={onCoordPin}
        />

        <CoordTracker onCoordHover={onCoordHover} />

        <FlyTo position={location ? [location.lat, location.lng] : null} zoom={15} />

        {/* Custom map image overlay */}
        {customMapUrl && location && (
          <ImageOverlay
            url={customMapUrl}
            bounds={[[location.lat - d, location.lng - d], [location.lat + d, location.lng + d]]}
            opacity={0.75}
          />
        )}

        {/* All elements (user-placed + calibration) — all draggable + deletable */}
        {placedElements.map((el) => (
          <Marker key={el.id} position={[el.lat, el.lng]} icon={getElementIcon(el.type)} draggable={!elementsLocked}>
            <Popup>
              <div className="text-sm">
                <strong>{el.label}</strong>
                <br /><span className="text-xs text-gray-500">{el.type.toUpperCase()}</span>
                {el.source === "calibration" && (
                  <span className="text-[9px] text-amber-500 ml-1">AUTO</span>
                )}
                {!elementsLocked && onRemoveElement && (
                  <div style={{ marginTop: 6 }}>
                    <button
                      onClick={() => onRemoveElement(el.id)}
                      style={{
                        background: "#fef2f2", border: "1px solid #fecaca",
                        color: "#dc2626", fontSize: 10, fontWeight: 600,
                        padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                      }}
                    >
                      🗑 Remove
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Plan visualization overlay (boundary + routes only) */}
        {showPlanViz && planVizData && (
          <>
            {/* Venue boundary polygon */}
            {planVizData.boundary && planVizData.boundary.length > 2 && (
              <Polygon
                positions={planVizData.boundary}
                pathOptions={{
                  color: "#d97706",
                  fillColor: "#fbbf24",
                  fillOpacity: 0.06,
                  weight: 2.5,
                  dashArray: "10 5",
                }}
              >
                <Popup>Calibrated Venue Boundary</Popup>
              </Polygon>
            )}
            {planVizData.routes?.map((r, i) => (
              <Polyline key={`rt${i}`} positions={r.path}
                pathOptions={{ color: r.color, weight: 3.5, opacity: 0.75, dashArray: "8 6" }}>
                <Popup>{r.label}</Popup>
              </Polyline>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
