---
name: transporte-apoquindo
description: Contexto de dominio para el SaaS de gestión de flotas y cotizador de rutas en Chile. Usar al trabajar en lógica de negocio, cotizaciones, rutas, peajes, pórticos TAG, regiones/comunas, o cualquier feature del proyecto Transporte Apoquindo.
---

# Transporte Apoquindo — Contexto de Dominio

## Producto

SaaS de gestión de flotas y transporte para Chile. Etapa actual: **Cotizador de Rutas** con experiencia móvil nativa (web + PWA instalable).

## Tecnologías Core

- **Next.js** (App Router) — Vercel
- **Neon DB** (PostgreSQL) — futura
- **Google Maps API** — futura
- **Tailwind CSS v4** + **TypeScript estricto**

## Alcance Geográfico — Chile

- Regiones y comunas como unidades geográficas
- Cálculo de peajes urbanos (pórticos TAG) e interurbanos (futuro)
- Moneda: CLP | Zona horaria: America/Santiago | Idioma: es-CL

## Peajes vs Pórticos vs TAG (Chile)

Fuente oficial MOP: https://concesiones.mop.gob.cl/peajes-y-porticos/

### Peaje
El **cobro en CLP** por usar una vía concesionada. Es el monto que sumamos en la cotización.

### Pórtico
**Infraestructura física** de cobro electrónico free flow (arcos con cámaras/antenas, sin barrera). Cada cruce registra un tránsito. En urbanas, cada pórtico puede generar un peaje según tramo, horario y vehículo.

### TAG
**Medio de pago electrónico** (dispositivo + contrato). NO es un peaje ni un pórtico. Habilita telepeaje.

### Sistemas de cobro

| Sistema | Rutas | Modelo | Tipo en código |
|---|---|---|---|
| Urbano free flow | Costanera Norte, Autopista Central, Vespucio… | Pórticos múltiples + TB/TA/TS | `TagPortico` |
| Interurbano plaza | Ruta 5, 68, 78… | Plaza con barrera, cobro fijo | `TollPlaza` (futuro) |

### Reglas permanentes

1. El pórtico es el punto geográfico (Lat/Lng) que detectamos en la ruta
2. El peaje es el cargo CLP resultante del cruce
3. En UI decimos "Subtotal TAG" (lenguaje chileno), internamente es `sum(peajes por pórtico)`
4. No modelar plazas interurbanas como `TagPortico`
5. Tarifas oficiales desde MOP; datos actuales tienen `isMock: true`

Ver implementación: `src/features/quotes/data/tollDomain.ts` y `tagTariffs.ts`

## Arquitectura de Carpetas

```
src/
├── app/          # Rutas y layouts (App Router)
├── components/   # UI reutilizable (botones, inputs, layouts)
├── features/     # Módulos de dominio (cotizador, rutas, peajes, admin)
└── lib/          # Utilidades, tipos compartidos, clientes API
```

## Reglas de UI Inmersiva (PWA)

- `overscroll-behavior: none` global en html/body
- Layout raíz: `h-[100dvh]` + `overflow-hidden`
- Scroll solo en secciones internas (`overflow-y-auto`)
- PWA: manifest, íconos, viewport fijo, `user-scalable=no`

## Skills de Diseño Relacionados

- `design-taste-frontend` — interfaces anti-slop
- `imagegen-frontend-mobile` — referencias visuales móviles
- `brandkit` — sistema de marca cuando exista
