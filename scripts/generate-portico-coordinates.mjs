/**
 * Genera coordenadas validadas (Google Geocoding + Roads Snap) para todos los pórticos.
 * Uso: node scripts/generate-portico-coordinates.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
}

loadEnv();
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  process.exit(1);
}

/** [porticoId, geocodeQuery] — ids deben coincidir con TagPortico.id en runtime */
const PORTICO_GEO_MANIFEST = [
  // Autopista Central (32)
  ["ac-pa2", "Autopista Central Los Guindos La Capilla, San Bernardo, Chile"],
  ["ac-pa3", "Autopista Central La Capilla Colón, San Bernardo, Chile"],
  ["ac-pa5", "Autopista Central Colón Las Acacias, La Florida, Chile"],
  ["ac-pa7", "Autopista Central Las Acacias Américo Vespucio, La Florida, Chile"],
  ["ac-pa30", "Autopista Central Américo Vespucio Departamental, La Florida, Chile"],
  ["ac-pa10", "Autopista Central Departamental Carlos Valdovinos, La Florida, Chile"],
  ["ac-pa31", "Autopista Central Carlos Valdovinos Alameda, Santiago, Chile"],
  ["ac-pa13", "Autopista Central Alameda Río Mapocho, Santiago, Chile"],
  ["ac-pa16", "Autopista Central Río Mapocho 14 de la Fama, Santiago, Chile"],
  ["ac-pa17", "Autopista Central 14 de la Fama Américo Vespucio Norte, Santiago, Chile"],
  ["ac-pa8", "Autopista Central Américo Vespucio Norte 14 de la Fama, Santiago, Chile"],
  ["ac-pa9", "Autopista Central 14 de la Fama Río Mapocho, Santiago, Chile"],
  ["ac-pa11", "Autopista Central Río Mapocho Alameda, Santiago, Chile"],
  ["ac-pa12", "Autopista Central Alameda Carlos Valdovinos, Santiago, Chile"],
  ["ac-pa14", "Autopista Central Carlos Valdovinos Departamental, La Florida, Chile"],
  ["ac-pa15", "Autopista Central Departamental Américo Vespucio, La Florida, Chile"],
  ["ac-pa18", "Autopista Central Américo Vespucio Las Acacias, La Florida, Chile"],
  ["ac-pa6", "Autopista Central Las Acacias Colón, La Florida, Chile"],
  ["ac-pa4", "Autopista Central Colón La Capilla, San Bernardo, Chile"],
  ["ac-pa32", "Autopista Central La Capilla Los Guindos, San Bernardo, Chile"],
  ["ac-pa37", "Autopista Central Los Guindos, San Bernardo, Chile"],
  ["ac-pa1", "Autopista Central Los Guindos, San Bernardo, Chile"],
  ["ac-pa19", "Autopista Central General Velásquez Américo Vespucio, Estación Central, Chile"],
  ["ac-pa21", "Autopista Central Américo Vespucio Ruta 5 Sur, San Bernardo, Chile"],
  ["ac-pa23", "Autopista Central Ruta 5 Sur Carlos Valdovinos, San Bernardo, Chile"],
  ["ac-pa25", "Autopista Central Carlos Valdovinos Gran Avenida, San Miguel, Chile"],
  ["ac-pa28", "Autopista Central Gran Avenida Departamental, La Cisterna, Chile"],
  ["ac-pa20", "Autopista Central Departamental Gran Avenida, La Cisterna, Chile"],
  ["ac-pa22", "Autopista Central Gran Avenida Carlos Valdovinos, San Miguel, Chile"],
  ["ac-pa24", "Autopista Central Carlos Valdovinos Ruta 5 Sur, San Bernardo, Chile"],
  ["ac-pa26", "Autopista Central Ruta 5 Sur Américo Vespucio, San Bernardo, Chile"],
  ["ac-pa29", "Autopista Central Américo Vespucio General Velásquez, Estación Central, Chile"],
  // Vespucio Norte (17)
  ["vespucio-norte-p15", "Américo Vespucio El Salto Recoleta, Huechuraba, Chile"],
  ["vespucio-norte-p13", "Américo Vespucio Recoleta Pedro Fontova, Santiago, Chile"],
  ["vespucio-norte-p11", "Américo Vespucio Pedro Fontova Panamericana Norte, Conchalí, Chile"],
  ["vespucio-norte-p8", "Américo Vespucio Panamericana Norte Condell, Conchalí, Chile"],
  ["vespucio-norte-p6", "Américo Vespucio Condell Costanera Norte, Quilicura, Chile"],
  ["vespucio-norte-p4", "Américo Vespucio Costanera Norte Ruta 68, Pudahuel, Chile"],
  ["vespucio-norte-p2", "Américo Vespucio Ruta 68 Los Mares, Pudahuel, Chile"],
  ["vespucio-norte-p17", "Américo Vespucio Los Mares Ruta 78, Maipú, Chile"],
  ["vespucio-norte-p1", "Américo Vespucio Ruta 78 Santa Elena, Maipú, Chile"],
  ["vespucio-norte-p16", "Américo Vespucio Santa Elena Ruta 68, Pudahuel, Chile"],
  ["vespucio-norte-p3", "Américo Vespucio Ruta 68 Costanera Norte, Pudahuel, Chile"],
  ["vespucio-norte-p5", "Américo Vespucio Costanera Norte Condell, Quilicura, Chile"],
  ["vespucio-norte-p7", "Américo Vespucio Condell Lo Echevers, Quilicura, Chile"],
  ["vespucio-norte-p9", "Américo Vespucio Lo Echevers Panamericana Norte, Conchalí, Chile"],
  ["vespucio-norte-p10", "Américo Vespucio Panamericana Norte Pedro Fontova, Conchalí, Chile"],
  ["vespucio-norte-p12", "Américo Vespucio Pedro Fontova Guanaco, Huechuraba, Chile"],
  ["vespucio-norte-p14", "Américo Vespucio Guanaco El Salto, Huechuraba, Chile"],
  // Vespucio Sur (15)
  ["vespucio-sur-p1-3", "Américo Vespucio Camino Melipilla 2a Transversal, Maipú, Chile"],
  ["vespucio-sur-p2-2", "Américo Vespucio General Velásquez Ruta 5, Estación Central, Chile"],
  ["vespucio-sur-p3-4", "Américo Vespucio Ruta 5 Gran Avenida, La Cisterna, Chile"],
  ["vespucio-sur-p3-2", "Américo Vespucio Gran Avenida Santa Rosa, La Pintana, Chile"],
  ["vespucio-sur-p4-3", "Américo Vespucio Coronel Santa Julia, La Florida, Chile"],
  ["vespucio-sur-p4-2", "Américo Vespucio Gnmno de Alderete Vicuña Mackenna, La Florida, Chile"],
  ["vespucio-sur-p5-4", "Américo Vespucio Las Torres Quilín, Peñalolén, Chile"],
  ["vespucio-sur-p5-2", "Américo Vespucio Quilín Grecia, Peñalolén, Chile"],
  ["vespucio-sur-p5-1", "Américo Vespucio Grecia Quilín, Peñalolén, Chile"],
  ["vespucio-sur-p5-3", "Américo Vespucio Quilín Las Torres, Peñalolén, Chile"],
  ["vespucio-sur-p4-1", "Américo Vespucio Gnmno de Alderete Santa Julia, La Florida, Chile"],
  ["vespucio-sur-p3-1", "Américo Vespucio Santa Rosa Gran Avenida, La Pintana, Chile"],
  ["vespucio-sur-p3-3", "Américo Vespucio Gran Avenida Ruta 5, La Cisterna, Chile"],
  ["vespucio-sur-p2-1", "Américo Vespucio Ruta 5 General Velásquez, Estación Central, Chile"],
  ["vespucio-sur-p1-1", "Américo Vespucio General Velásquez Ruta 78, Maipú, Chile"],
  // AVO I (11)
  ["avo-i-p101", "Américo Vespucio Bilbao, Las Condes, Chile"],
  ["avo-i-p102", "Américo Vespucio Martín de Zamora, Las Condes, Chile"],
  ["avo-i-p103", "Américo Vespucio Los Militares, Las Condes, Chile"],
  ["avo-i-p104", "Américo Vespucio Presidente Riesco, Las Condes, Chile"],
  ["avo-i-p105", "Américo Vespucio Salida Kennedy Oriente, Las Condes, Chile"],
  ["avo-i-p106", "Américo Vespucio Salida Kennedy Poniente, Las Condes, Chile"],
  ["avo-i-p107", "Américo Vespucio Presidente Kennedy, Las Condes, Chile"],
  ["avo-i-p108", "Américo Vespucio Costanera Norte Nororiente, Las Condes, Chile"],
  ["avo-i-p109", "Américo Vespucio Puente Centenario, Las Condes, Chile"],
  ["avo-i-p110", "Américo Vespucio La Pirámide, Las Condes, Chile"],
  ["avo-i-p111", "Américo Vespucio Cerro Colorado, Las Condes, Chile"],
  // Costanera Norte (18)
  ["costanera-norte-p0", "Costanera Norte Puente Padre Arteaga San Francisco, Providencia, Chile"],
  ["costanera-norte-p2-1", "Costanera Norte Gran Vía Centenario, Las Condes, Chile"],
  ["costanera-norte-p2-2", "Costanera Norte Centenario Puente Lo Saldes, Las Condes, Chile"],
  ["costanera-norte-p3", "Costanera Norte Puente Lo Saldes Vivaceta, Independencia, Chile"],
  ["costanera-norte-p4", "Costanera Norte Torres Tajamar Puente Lo Saldes, Providencia, Chile"],
  ["costanera-norte-p5", "Costanera Norte Las Tranqueras, Las Condes, Chile"],
  ["costanera-norte-p6-1", "Costanera Norte Las Tranqueras Estoril, Las Condes, Chile"],
  ["costanera-norte-p6-2", "Costanera Norte Estoril Las Tranqueras, Las Condes, Chile"],
  ["costanera-norte-p7", "Costanera Norte Américo Vespucio Petersen, Las Condes, Chile"],
  ["costanera-norte-p8-0", "Costanera Norte Petersen Carrascal, Las Condes, Chile"],
  ["costanera-norte-p8-1", "Costanera Norte Carrascal Vivaceta, Las Condes, Chile"],
  ["costanera-norte-p8-2", "Costanera Norte Vivaceta Torres Tajamar, Providencia, Chile"],
  ["costanera-norte-p8-3", "Costanera Norte Torres Tajamar Puente Lo Saldes, Providencia, Chile"],
  ["costanera-norte-p9", "Costanera Norte Américo Vespucio Ruta 68, Pudahuel, Chile"],
  ["costanera-norte-p1", "Costanera Norte Gran Vía Puente San Francisco, Providencia, Chile"],
  ["costanera-norte-ep", "Costanera Norte Entrada Purísima, Providencia, Chile"],
  ["costanera-norte-ev", "Costanera Norte Entrada Vivaceta, Independencia, Chile"],
  ["costanera-norte-sb", "Costanera Norte Salida Bellavista, Providencia, Chile"],
  // Otros RM (5) + Concepción (1)
  ["tunel-san-cristobal-tsc-sn", "Túnel San Cristóbal El Salto Kennedy, Huechuraba, Chile"],
  ["tunel-san-cristobal-tsc-ns", "Túnel San Cristóbal Kennedy El Salto, Las Condes, Chile"],
  ["acceso-nororiente-ano-pon", "Acceso Nororiente Américo Vespucio sector poniente, Santiago, Chile"],
  ["acceso-nororiente-ano-or", "Acceso Nororiente Américo Vespucio sector oriente, Santiago, Chile"],
  ["acceso-vial-p-amb", "Acceso Vial Aeropuerto Américo Vespucio Lo Boza, Pudahuel, Chile"],
  ["puente-industrial-pi-1", "Puente Industrial Américo Vespucio, Concepción, Chile"],
];

async function geocode(query) {
  const url =
    "https://maps.googleapis.com/maps/api/geocode/json?" +
    new URLSearchParams({ address: query, key: API_KEY, region: "cl" });
  const res = await fetch(url);
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  return loc
    ? { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address }
    : null;
}

async function snapToRoad(point) {
  const url =
    "https://roads.googleapis.com/v1/snapToRoads?" +
    new URLSearchParams({
      path: `${point.lat},${point.lng}`,
      interpolate: "false",
      key: API_KEY,
    });
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const snap = data.snappedPoints?.[0]?.location;
  return snap ? { lat: snap.latitude, lng: snap.longitude } : point;
}

const R = 6371000;
function haversine(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function round5(n) {
  return Math.round(n * 100000) / 100000;
}

const results = {};
const warnings = [];

for (const [id, query] of PORTICO_GEO_MANIFEST) {
  const geo = await geocode(query);
  if (!geo) {
    warnings.push(`${id}: geocode failed — ${query}`);
    continue;
  }
  let snapped;
  try {
    snapped = await snapToRoad(geo);
  } catch (err) {
    warnings.push(`${id}: snap failed — ${err.message}`);
    snapped = geo;
  }
  const snapDistanceM = Math.round(haversine(geo, snapped));
  if (snapDistanceM > 100) {
    warnings.push(`${id}: snap ${snapDistanceM}m from geocode`);
  }
  results[id] = {
    lat: round5(snapped.lat),
    lng: round5(snapped.lng),
    query,
    formatted: geo.formatted,
    snapDistanceM,
  };
  await new Promise((r) => setTimeout(r, 80));
}

const jsonPath = resolve("storage/porticos-coordinates-validated.json");
writeFileSync(
  jsonPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), results, warnings }, null, 2),
);

const tsLines = [
  "/**",
  " * Coordenadas validadas de pórticos TAG — Google Geocoding + Roads Snap.",
  " * NO editar manualmente. Regenerar: node scripts/generate-portico-coordinates.mjs",
  ` * Generado: ${new Date().toISOString()}`,
  " */",
  "",
  "export interface ValidatedPorticoCoordinate {",
  "  lat: number;",
  "  lng: number;",
  "}",
  "",
  "export const VALIDATED_PORTICO_COORDINATES: Record<string, ValidatedPorticoCoordinate> = {",
];

for (const [id, coord] of Object.entries(results)) {
  if (id.startsWith("ac-")) continue; // AC: coords manuales en autopistaCentral2026.ts
  tsLines.push(`  "${id}": { lat: ${coord.lat}, lng: ${coord.lng} },`);
}
tsLines.push("};", "");

const tsPath = resolve("src/features/quotes/data/validatedPorticoCoordinates.ts");
writeFileSync(tsPath, tsLines.join("\n"));

console.log(`Validated ${Object.keys(results).length}/${PORTICO_GEO_MANIFEST.length} porticos`);
console.log(`Warnings: ${warnings.length}`);
warnings.forEach((w) => console.log(" ", w));
console.log(`JSON: ${jsonPath}`);
console.log(`TS:   ${tsPath}`);
