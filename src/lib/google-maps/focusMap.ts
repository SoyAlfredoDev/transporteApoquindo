const SINGLE_POINT_ZOOM = 14;

/** Centra y acerca suavemente el mapa a un punto. */
export function focusMapOnPoint(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  zoom = SINGLE_POINT_ZOOM,
): void {
  map.panTo(position);

  const currentZoom = map.getZoom() ?? zoom;
  if (Math.abs(currentZoom - zoom) <= 1) {
    map.setZoom(zoom);
    return;
  }

  const listener = map.addListener("idle", () => {
    google.maps.event.removeListener(listener);
    map.setZoom(zoom);
  });
}

/** Encuadra dos puntos con padding (preview antes de que cargue la ruta). */
export function fitMapToPoints(
  map: google.maps.Map,
  points: google.maps.LatLngLiteral[],
  padding: google.maps.Padding | number,
): void {
  if (points.length === 0) return;

  if (points.length === 1) {
    const [point] = points;
    if (point) focusMapOnPoint(map, point);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  for (const point of points) {
    bounds.extend(point);
  }
  map.fitBounds(bounds, padding);
}
