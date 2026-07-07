<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Transporte Apoquindo

SaaS de gestión de flotas y transporte para Chile. Etapa actual: Cotizador de Rutas (experiencia móvil nativa + PWA).

## Tecnologías Core

- Next.js (App Router) → Vercel
- Neon DB (PostgreSQL) — futura
- Google Maps API — futura
- TypeScript estricto + Tailwind CSS v4

## Reglas Permanentes

Ver `.cursor/rules/` para reglas detalladas. Resumen:

1. **Chile-first:** regiones, comunas, TAG, peajes locales, CLP, es-CL
2. **Arquitectura modular:** `src/app`, `src/components`, `src/features`, `src/lib`
3. **PWA inmersiva:** overscroll lock, viewport fijo `h-[100dvh]`, scroll solo interno
4. **Diseño:** usar skills de `.agents/skills/` (taste-skill) para UI

## Skills del Proyecto

- `.cursor/skills/transporte-apoquindo/` — contexto de dominio
- `.agents/skills/` — taste-skill (diseño frontend)
