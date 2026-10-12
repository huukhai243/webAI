"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { dayColor } from "@/lib/categories";
import type { Activity, ItineraryDay } from "@/lib/schema";

export type MapFocus = { day: number; index: number; seq: number };

type Props = {
  days: ItineraryDay[];
  center: { lat: number; lng: number };
  focus: MapFocus | null;
};

type Point = { key: string; day: number; index: number; activity: Activity };

// Máy chủ bản đồ miễn phí của cộng đồng OpenStreetMap. Một số mạng không truy cập được
// máy chủ chính, khi đó tự chuyển sang máy chủ dự phòng.
const TILE_SOURCES = [
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
];

const markerKey = (day: number, index: number) => `${day}-${index}`;

function isValidPoint({ lat, lng }: { lat: number; lng: number }) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

const iconCache = new Map<string, L.DivIcon>();

function pinIcon(label: string, color: string): L.DivIcon {
  const cacheKey = `${label}|${color}`;
  let icon = iconCache.get(cacheKey);
  if (!icon) {
    icon = L.divIcon({
      className: "",
      html: `<div class="map-pin" style="--pin:${color}">${label}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
    iconCache.set(cacheKey, icon);
  }
  return icon;
}

export default function TripMap({ days, center, focus }: Props) {
  const markers = useRef(new Map<string, L.Marker>());
  const [tileSource, setTileSource] = useState(0);

  const points = useMemo<Point[]>(
    () =>
      days.flatMap((day) =>
        day.activities
          .map((activity, index) => ({
            key: markerKey(day.dayNumber, index),
            day: day.dayNumber,
            index,
            activity,
          }))
          .filter((p) => isValidPoint(p.activity)),
      ),
    [days],
  );

  const routes = useMemo(
    () =>
      days.map((day) => ({
        day: day.dayNumber,
        positions: day.activities
          .filter(isValidPoint)
          .map((a) => [a.lat, a.lng] as [number, number]),
      })),
    [days],
  );

  const start: [number, number] = isValidPoint(center)
    ? [center.lat, center.lng]
    : points[0]
      ? [points[0].activity.lat, points[0].activity.lng]
      : [16.05, 108.2];

  return (
    <MapContainer center={start} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        key={TILE_SOURCES[tileSource]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={TILE_SOURCES[tileSource]}
        maxZoom={19}
        eventHandlers={{
          tileerror: () => setTileSource((i) => Math.min(i + 1, TILE_SOURCES.length - 1)),
        }}
      />

      {routes.map(
        (route) =>
          route.positions.length > 1 && (
            <Polyline
              key={route.day}
              positions={route.positions}
              pathOptions={{ color: dayColor(route.day), weight: 3, opacity: 0.75, dashArray: "6 8" }}
            />
          ),
      )}

      {points.map((point) => (
        <Marker
          key={point.key}
          position={[point.activity.lat, point.activity.lng]}
          icon={pinIcon(String(point.index + 1), dayColor(point.day))}
          ref={(marker) => {
            if (marker) markers.current.set(point.key, marker);
            else markers.current.delete(point.key);
          }}
        >
          <Popup>
            <div className="text-xs text-stone-500">
              Ngày {point.day} · {point.activity.time}
            </div>
            <div className="font-semibold text-stone-900">{point.activity.title}</div>
            <div className="text-stone-600">{point.activity.placeName}</div>
          </Popup>
        </Marker>
      ))}

      <FitToPoints points={points} />
      <FlyToFocus focus={focus} markers={markers} />
    </MapContainer>
  );
}

/** Thu phóng bản đồ vừa với các điểm mỗi khi đổi ngày đang xem. */
function FitToPoints({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    const latLngs = points.map((p) => L.latLng(p.activity.lat, p.activity.lng));
    if (latLngs.length === 1) map.setView(latLngs[0], 15);
    else if (latLngs.length > 1) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [36, 36], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
}

/** Bay tới ghim và mở popup khi người dùng bấm vào một hoạt động. */
function FlyToFocus({
  focus,
  markers,
}: {
  focus: MapFocus | null;
  markers: RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const marker = markers.current.get(markerKey(focus.day, focus.index));
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
    marker.openPopup();
  }, [map, markers, focus]);
  return null;
}
