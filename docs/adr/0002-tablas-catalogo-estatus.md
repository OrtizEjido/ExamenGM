# ADR 0002 — Tablas catálogo para estatus multivaluados

**Estado:** Aceptada · **Fecha:** 2026-06

## Contexto

El legacy guarda estatus como texto libre con variantes equivalentes: `Approved` /
`aprobada` / `done`, o `info` / `INFO`. Mismo significado, valores distintos — imposible
filtrar o agrupar de forma fiable, y el texto visible está acoplado al dato.

## Opciones consideradas

1. **Enum/string en la columna**, normalizando variantes al leer pero dejando el valor en la fila.
2. **Tabla catálogo** por dominio (`refund_statuses`, `notification_kinds`) con un `code`
   canónico estable + `label_es`, referenciada por FK desde la entidad.

## Decisión

Tabla catálogo con `code` canónico. El mapeo de variantes legacy → `code` ocurre en el ETL;
el texto visible se resuelve en el frontend por i18n usando el `code`.

## Consecuencias

- **Corto plazo:** integridad referencial (no entran estatus inválidos) y filtros/agrupados
  fiables. El repositorio hace un `join` para exponer el `code` como string al dominio.
- **Largo plazo:** añadir un idioma es solo otra columna/clave; añadir un estatus es una fila.
  El `code` nunca cambia, así que la API y el frontend quedan estables ante cambios de etiqueta.
