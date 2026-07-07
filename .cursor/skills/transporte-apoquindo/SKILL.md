---
name: transporte-apoquindo
description: Contexto de dominio para el SaaS de gestión de flotas y cotizador de rutas en Chile. Usar al trabajar en lógica de negocio, cotizaciones, rutas, peajes, regiones/comunas, o cualquier feature del proyecto Transporte Apoquindo.
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
- Cálculo de TAG y peajes locales
- Moneda: CLP | Zona horaria: America/Santiago | Idioma: es-CL

## Arquitectura de Carpetas

```
src/
├── app/          # Rutas y layouts (App Router)
├── components/   # UI reutilizable (botones, inputs, layouts)
├── features/     # Módulos de dominio (cotizador, rutas, peajes)
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
