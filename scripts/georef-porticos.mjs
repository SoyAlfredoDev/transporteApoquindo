/**
 * Geocodifica y valida pórticos TAG contra Google Geocoding + Roads snap.
 * Uso: node scripts/georef-porticos.mjs
 * Requiere NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local
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

/** Consultas de geocodificación por pórtico (intersección / referencia MOP) */
const GEO_QUERIES = [
  // Vespucio Norte OP
  { id: "vespucio-norte-p15", q: "Américo Vespucio El Salto, Huechuraba, Santiago, Chile" },
  { id: "vespucio-norte-p13", q: "Américo Vespucio Recoleta, Santiago, Chile" },
  { id: "vespucio-norte-p11", q: "Américo Vespucio Pedro Fontova, Conchalí, Chile" },
  { id: "vespucio-norte-p8", q: "Américo Vespucio Panamericana Norte, Conchalí, Chile" },
  { id: "vespucio-norte-p6", q: "Américo Vespucio Condell, Quilicura, Chile" },
  { id: "vespucio-norte-p4", q: "Américo Vespucio Costanera Norte, Pudahuel, Chile" },
  { id: "vespucio-norte-p2", q: "Américo Vespucio Ruta 68, Pudahuel, Chile" },
  { id: "vespucio-norte-p17", q: "Américo Vespucio Ruta 78, Maipú, Chile" },
  // Vespucio Norte PO
  { id: "vespucio-norte-p1", q: "Américo Vespucio Ruta 78, Maipú, Chile" },
  { id: "vespucio-norte-p16", q: "Américo Vespucio Santa Elena, Pudahuel, Chile" },
  { id: "vespucio-norte-p3", q: "Américo Vespucio Ruta 68, Pudahuel, Chile" },
  { id: "vespucio-norte-p5", q: "Américo Vespucio Costanera Norte, Pudahuel, Chile" },
  { id: "vespucio-norte-p7", q: "Américo Vespucio Lo Echevers, Quilicura, Chile" },
  { id: "vespucio-norte-p9", q: "Américo Vespucio Panamericana Norte, Conchalí, Chile" },
  { id: "vespucio-norte-p10", q: "Américo Vespucio Pedro Fontova, Conchalí, Chile" },
  { id: "vespucio-norte-p12", q: "Américo Vespucio Guanaco, Huechuraba, Chile" },
  { id: "vespucio-norte-p14", q: "Américo Vespucio El Salto, Huechuraba, Chile" },
  // Vespucio Sur PO
  { id: "vespucio-sur-p1.3", q: "Américo Vespucio Camino a Melipilla, Maipú, Chile" },
  { id: "vespucio-sur-p2.2", q: "Américo Vespucio General Velásquez, Estación Central, Chile" },
  { id: "vespucio-sur-p3.4", q: "Américo Vespucio Gran Avenida, La Cisterna, Chile" },
  { id: "vespucio-sur-p3.2", q: "Américo Vespucio Santa Rosa, La Pintana, Chile" },
  { id: "vespucio-sur-p4.3", q: "Américo Vespucio Santa Julia, La Florida, Chile" },
  { id: "vespucio-sur-p4.2", q: "Américo Vespucio Vicuña Mackenna, La Florida, Chile" },
  { id: "vespucio-sur-p5.4", q: "Américo Vespucio Las Torres, Peñalolén, Chile" },
  { id: "vespucio-sur-p5.2", q: "Américo Vespucio Grecia, Peñalolén, Chile" },
  // Vespucio Sur OP
  { id: "vespucio-sur-p5.1", q: "Américo Vespucio Grecia, Peñalolén, Chile" },
  { id: "vespucio-sur-p5.3", q: "Américo Vespucio Quilín, Peñalolén, Chile" },
  { id: "vespucio-sur-p4.1", q: "Américo Vespucio Vicuña Mackenna, La Florida, Chile" },
  { id: "vespucio-sur-p3.1", q: "Américo Vespucio Santa Rosa, La Pintana, Chile" },
  { id: "vespucio-sur-p3.3", q: "Américo Vespucio Gran Avenida, La Cisterna, Chile" },
  { id: "vespucio-sur-p2.1", q: "Américo Vespucio General Velásquez, Estación Central, Chile" },
  { id: "vespucio-sur-p1.1", q: "Américo Vespucio Ruta 78, Maipú, Chile" },
  // AVO I
  { id: "avo-i-p111", q: "Américo Vespucio Cerro Colorado, Las Condes, Chile" },
  { id: "avo-i-p110", q: "Américo Vespucio La Pirámide, Las Condes, Chile" },
  { id: "avo-i-p109", q: "Américo Vespucio Puente Centenario, Las Condes, Chile" },
  { id: "avo-i-p108", q: "Américo Vespucio Costanera Norte, Las Condes, Chile" },
  { id: "avo-i-p107", q: "Américo Vespucio Presidente Kennedy, Las Condes, Chile" },
  { id: "avo-i-p106", q: "Américo Vespucio Presidente Kennedy poniente, Las Condes, Chile" },
  { id: "avo-i-p105", q: "Américo Vespucio Presidente Kennedy oriente, Las Condes, Chile" },
  { id: "avo-i-p104", q: "Américo Vespucio Presidente Riesco, Las Condes, Chile" },
  { id: "avo-i-p103", q: "Américo Vespucio Los Militares, Las Condes, Chile" },
  { id: "avo-i-p102", q: "Américo Vespucio Martín de Zamora, Las Condes, Chile" },
  { id: "avo-i-p101", q: "Américo Vespucio Bilbao, Las Condes, Chile" },
  // Autopista Central (muestra)
  { id: "ac-pa30", q: "Autopista Central Américo Vespucio Departamental, La Florida, Chile" },
  { id: "ac-pa7", q: "Autopista Central Las Acacias, La Florida, Chile" },
  { id: "ac-pa17", q: "Autopista Central 14 de la Fama, Santiago, Chile" },
  { id: "ac-pa2", q: "Autopista Central Los Guindos, San Bernardo, Chile" },
  // Costanera Norte
  { id: "cn-p0", q: "Costanera Norte Puente Padre Arteaga, Providencia, Chile" },
  { id: "cn-p9", q: "Costanera Norte Américo Vespucio Ruta 68, Pudahuel, Chile" },
  // Otros
  { id: "tsc-sn", q: "Túnel San Cristóbal Américo Vespucio Kennedy, Santiago, Chile" },
  { id: "ano-pon", q: "Acceso Nororiente Américo Vespucio, Santiago, Chile" },
  { id: "acceso-vial", q: "Acceso Vial Aeropuerto Américo Vespucio, Pudahuel, Chile" },
];

async function geocode(query) {
  const url =
    "https://maps.googleapis.com/maps/api/geocode/json?" +
    new URLSearchParams({ address: query, key: API_KEY, region: "cl" });
  const res = await fetch(url);
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address } : null;
}

async function snapToRoad(points) {
  if (points.length === 0) return [];
  const path = points.map((p) => `${p.lat},${p.lng}`).join("|");
  const url =
    "https://roads.googleapis.com/v1/snapToRoads?" +
    new URLSearchParams({ path, interpolate: "false", key: API_KEY });
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.snappedPoints ?? [];
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

const results = [];
for (const item of GEO_QUERIES) {
  const geo = await geocode(item.q);
  if (!geo) {
    results.push({ ...item, status: "geocode_failed" });
    continue;
  }
  let snapped = null;
  let snapDistanceM = null;
  try {
    const snap = await snapToRoad([{ lat: geo.lat, lng: geo.lng }]);
    if (snap[0]?.location) {
      snapped = {
        lat: snap[0].location.latitude,
        lng: snap[0].location.longitude,
      };
      snapDistanceM = Math.round(haversine(geo, snapped));
    }
  } catch (err) {
    results.push({ ...item, status: "snap_failed", geo, error: String(err) });
    continue;
  }
  results.push({
    ...item,
    status: "ok",
    geo,
    snapped,
    snapDistanceM,
    formatted: geo.formatted,
  });
  await new Promise((r) => setTimeout(r, 100));
}

const outPath = resolve("storage/porticos-georef-validated.json");
writeFileSync(outPath, JSON.stringify(results, null, 2));

const ok = results.filter((r) => r.status === "ok");
const far = ok.filter((r) => r.snapDistanceM > 150);
console.log(`Georef: ${ok.length}/${results.length} OK, ${far.length} >150m from snap`);
for (const r of far) {
  console.log(`  WARN ${r.id}: snap ${r.snapDistanceM}m — ${r.formatted?.slice(0, 50)}`);
}
console.log(`Written: ${outPath}`);
