import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps/config";
import {
  encodePolyline,
  simplifyPath,
  type LatLngPoint,
} from "@/lib/google-maps/polyline";

export interface RouteMapSnapshotInput {
  path: LatLngPoint[];
  origin?: LatLngPoint | null;
  destination?: LatLngPoint | null;
  waypoints?: LatLngPoint[];
}

const MAP_WIDTH = 640;
const MAP_HEIGHT = 360;

function formatMarker(point: LatLngPoint, label?: string): string {
  const labelPart = label ? `|label:${label}` : "";
  return `color:red${labelPart}|${point.lat},${point.lng}`;
}

export function buildRouteStaticMapUrl(input: RouteMapSnapshotInput): string | null {
  if (!GOOGLE_MAPS_API_KEY || input.path.length < 2) return null;

  const simplified = simplifyPath(input.path);
  const params = new URLSearchParams({
    size: `${MAP_WIDTH}x${MAP_HEIGHT}`,
    scale: "2",
    maptype: "roadmap",
    key: GOOGLE_MAPS_API_KEY,
  });

  const pathParam = encodeURIComponent(
    `color:0x1A6FE8|weight:5|enc:${encodePolyline(simplified)}`,
  );
  const markers: string[] = [];

  if (input.origin) markers.push(formatMarker(input.origin, "A"));
  input.waypoints?.forEach((point, index) => {
    markers.push(formatMarker(point, String(index + 1)));
  });
  if (input.destination) markers.push(formatMarker(input.destination, "B"));

  let url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  url += `&path=${pathParam}`;
  for (const marker of markers) {
    url += `&markers=${encodeURIComponent(marker)}`;
  }

  return url;
}

export async function fetchStaticMapDataUrl(
  input: RouteMapSnapshotInput,
): Promise<string | null> {
  const mapUrl = buildRouteStaticMapUrl(input);
  if (!mapUrl) return null;

  const response = await fetch(mapUrl);
  if (!response.ok) return null;

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen del mapa."));
    reader.readAsDataURL(blob);
  });
}
