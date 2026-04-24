import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

type LatLng = { lat: number; lng: number };

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L as any).Marker.prototype.options.icon = defaultIcon;

function Recenter({ lat, lng }: LatLng) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

type Props = {
  lat: number;
  lng: number;
  onChange: (point: LatLng) => void;
};

export function LocationPickerMap({ lat, lng, onChange }: Props) {
  const markerHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target as L.Marker;
        const pos = marker.getLatLng();
        onChange({ lat: pos.lat, lng: pos.lng });
      },
    }),
    [onChange]
  );

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-white/10">
      <MapContainer center={[lat, lng]} zoom={13} className="h-full w-full" scrollWheelZoom>
        <Recenter lat={lat} lng={lng} />
        <ClickHandler onPick={onChange} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={markerHandlers}
        />
      </MapContainer>
    </div>
  );
}
