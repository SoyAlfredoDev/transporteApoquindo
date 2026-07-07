/**
 * Valida que los pórticos TAG tengan coords sobre vía (Google Roads Snap)
 * y reporta duplicados / faltantes.
 * Uso: node scripts/validate-portico-coordinates.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

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

// Cargar TAG_PORTICOS compilado vía ts — usamos JSON validado + AC desde fuente
const validated = JSON.parse(
  readFileSync(resolve("storage/porticos-coordinates-validated.json"), "utf8"),
).results;

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

async function snapDistance(point) {
  const url =
    "https://roads.googleapis.com/v1/snapToRoads?" +
    new URLSearchParams({
      path: `${point.lat},${point.lng}`,
      interpolate: "false",
      key: API_KEY,
    });
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) return { error: data.error.message };
  const snap = data.snappedPoints?.[0]?.location;
  if (!snap) return { error: "no snap" };
  const snapped = { lat: snap.latitude, lng: snap.longitude };
  return { distanceM: Math.round(haversine(point, snapped)), snapped };
}

// Leer coords AC desde validated (full set) — AC usa manual en runtime
const acSource = readFileSync(
  resolve("src/features/quotes/data/autopistaCentral2026.ts"),
  "utf8",
);
const acCoords = [...acSource.matchAll(/porticoCode: \"(PA[^\"]+)\"[\s\S]*?coordinates: \{ lat: ([-\d.]+), lng: ([-\d.]+) \}/g)].map(
  (m) => ({
    id: `ac-${m[1].toLowerCase()}`,
    lat: +m[2],
    lng: +m[3],
    highway: "Autopista Central",
  }),
);

const otherCoords = Object.entries(validated)
  .filter(([id]) => !id.startsWith("ac-"))
  .map(([id, c]) => ({ id, lat: c.lat, lng: c.lng, highway: id.split("-")[0] }));

const all = [...acCoords, ...otherCoords];
console.log(`Validating ${all.length} portico coordinates...\n`);

const dupes = new Map();
for (const p of all) {
  const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  if (!dupes.has(key)) dupes.set(key, []);
  dupes.get(key).push(p.id);
}
const duplicateGroups = [...dupes.values()].filter((g) => g.length > 1);
if (duplicateGroups.length) {
  console.log(`⚠ ${duplicateGroups.length} grupos de coords duplicadas (pórticos distintos, mismo punto):`);
  for (const g of duplicateGroups.slice(0, 8)) {
    console.log(`  ${g.join(", ")}`);
  }
  if (duplicateGroups.length > 8) console.log(`  ... y ${duplicateGroups.length - 8} más`);
  console.log("");
}

let ok = 0;
let warn = 0;
let fail = 0;

for (const p of all) {
  const result = await snapDistance(p);
  if (result.error) {
    console.log(`✗ ${p.id}: ${result.error}`);
    fail++;
  } else if (result.distanceM > 50) {
    console.log(`⚠ ${p.id}: ${result.distanceM}m de la vía más cercana`);
    warn++;
  } else {
    ok++;
  }
  await new Promise((r) => setTimeout(r, 60));
}

console.log(`\nResumen: ${ok} OK (≤50m), ${warn} advertencias (>50m), ${fail} fallos`);
process.exit(fail > 0 ? 1 : 0);
