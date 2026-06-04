# ADR 0004 — Paginado y búsqueda server-side

**Estado:** Aceptada · **Fecha:** 2026-06

## Contexto

Módulos como catálogo (500 productos) e inventario (1500 filas de stock) tienen demasiados
registros para traerlos completos al navegador. La búsqueda del legacy filtraba en cliente
mientras se escribía, recargando todo el dataset.

## Opciones consideradas

1. **Cargar todo y filtrar/paginar en el cliente:** simple, pero transfiere miles de filas y
   no escala.
2. **Paginado y búsqueda server-side:** el backend devuelve `{ items, total, page, pages }`;
   la búsqueda es un endpoint dedicado por campo, disparado por botón (no por tecla).

## Decisión

Server-side. Cada cambio de página o búsqueda es una llamada al API; el frontend nunca filtra
localmente cuando existe paginado.

## Consecuencias

- **Corto plazo:** payloads pequeños y constantes sin importar el volumen; el `$transaction`
  de Prisma trae datos y total en una sola ida a la BD.
- **Largo plazo:** el patrón se reutiliza en todo módulo con muchos registros (regla fija en
  la skill de migración). El costo es más latencia por interacción (una petición por página),
  aceptable frente a la escalabilidad ganada.
