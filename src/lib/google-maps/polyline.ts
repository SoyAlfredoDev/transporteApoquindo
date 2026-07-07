export type LatLngPoint = google.maps.LatLngLiteral;

function encodeSigned(value: number): string {
  let s = value < 0 ? ~(value << 1) : value << 1;
  let output = "";
  while (s >= 0x20) {
    output += String.fromCharCode((0x20 | (s & 0x1f)) + 63);
    s >>= 5;
  }
  output += String.fromCharCode(s + 63);
  return output;
}

/** Codificación polyline de Google para Static Maps. */
export function encodePolyline(path: LatLngPoint[]): string {
  let lastLat = 0;
  let lastLng = 0;
  let result = "";

  for (const point of path) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    result += encodeSigned(lat - lastLat);
    result += encodeSigned(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  }

  return result;
}

export function toLatLngLiteral(
  point: google.maps.LatLng | LatLngPoint,
): LatLngPoint {
  if (typeof (point as google.maps.LatLng).lat === "function") {
    const latLng = point as google.maps.LatLng;
    return { lat: latLng.lat(), lng: latLng.lng() };
  }
  return point as LatLngPoint;
}

export function simplifyPath(path: LatLngPoint[], maxPoints = 80): LatLngPoint[] {
  if (path.length <= maxPoints) return path;

  const result: LatLngPoint[] = [];
  const step = (path.length - 1) / (maxPoints - 1);

  for (let i = 0; i < maxPoints; i++) {
    const point = path[Math.round(i * step)];
    if (point) result.push(point);
  }

  return result;
}
