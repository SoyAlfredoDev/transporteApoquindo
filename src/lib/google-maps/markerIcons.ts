/**
 * Iconos discretos para mapas — puntos en lugar del pin rojo por defecto.
 */

const BRAND_BLUE = "#1A6FE8";
const BRAND_BLUE_DARK = "#1558c0";

function dotSvgDataUrl(
  fill: string,
  stroke: string,
  radius: number,
  size: number,
): string {
  const center = size / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${center}" cy="${center}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" opacity="0.95"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function dotIcon(size: number, fill: string, stroke = "#ffffff"): google.maps.Icon {
  const radius = size * 0.36;
  return {
    url: dotSvgDataUrl(fill, stroke, radius, size),
    scaledSize: { width: size, height: size } as google.maps.Size,
    anchor: { x: size / 2, y: size / 2 } as google.maps.Point,
  };
}

/** Pórtico / peaje TAG — punto azul corporativo */
export const PORTICO_MARKER_ICON = dotIcon(10, BRAND_BLUE);

/** Pórtico seleccionado — punto un poco más grande */
export const PORTICO_MARKER_ICON_SELECTED = dotIcon(13, BRAND_BLUE_DARK);

/** Origen de ruta — punto azul suave */
export const ROUTE_ORIGIN_ICON = dotIcon(11, BRAND_BLUE);

/** Destino de ruta — punto azul más intenso */
export const ROUTE_DESTINATION_ICON = dotIcon(11, BRAND_BLUE_DARK);

/** Parada intermedia — punto azul claro */
export const ROUTE_WAYPOINT_ICON = dotIcon(9, "#5BA3F5");
