import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getRiskStyle(prob) {
  if (prob < 40)
    return { radius: 300, color: "#16a34a" }; // green
  if (prob < 70)
    return { radius: 600, color: "#ca8a04" }; // yellow
  return { radius: 1000, color: "#dc2626" }; // red
}

export default function VenueMap({ lat, lon, location, risk }) {
  if (!lat || !lon) return null;

  const { radius, color } = getRiskStyle(risk);

  return (
    <div className="bg-white rounded-2xl shadow border p-4">
      <h4 className="font-semibold mb-2">Live Risk Zone</h4>

      <MapContainer
        center={[lat, lon]}
        zoom={14}
        style={{ height: "320px", width: "100%" }}
        className="rounded-xl"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lon]}>
          <Popup>{location}</Popup>
        </Marker>

        <Circle
          center={[lat, lon]}
          radius={radius}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.25,
          }}
        />
      </MapContainer>

      <p className="text-sm mt-2">
        Risk Radius: <strong>{radius} meters</strong>
      </p>
    </div>
  );
}
