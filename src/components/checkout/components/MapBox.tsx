"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { DefaultIcon } from "./leaflet-icon";

L.Marker.prototype.options.icon = DefaultIcon;

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  coords: Coords;
  onMapClick: (coords: Coords) => void;
}

export default function MapBox({ coords, onMapClick }: Props) {
  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Recenter coords={coords} />

      <Marker position={[coords.lat, coords.lng]} />

      <MapClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}

function Recenter({ coords }: { coords: Coords }) {
  const map = useMapEvents({});

  useEffect(() => {
    map.setView([coords.lat, coords.lng], 17);
  }, [coords, map]);

  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: Coords) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}
