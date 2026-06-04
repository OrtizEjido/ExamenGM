# ADR 0005 — Normalización en ETL sobre seed legacy inmutable

**Estado:** Aceptada · **Fecha:** 2026-06

## Contexto

Los datos legacy arrastran deuda: montos como TEXT (`"3335.5"`), fechas en formatos mezclados
(ISO, `DD/MM/YYYY`, epoch unix), estatus multivaluados. El seed (`seed_data.sql`) es la fuente
de verdad de la evaluación y **no puede editarse**.

## Opciones consideradas

1. **Limpiar el seed legacy** a mano antes de importarlo.
2. **ETL en la capa de migración:** cargar el seed inmutable en SQLite en memoria y normalizar
   al esquema nuevo en `prisma/seed.ts` + helpers testeados (`parseAmount`, `parseMixedDate`,
   `normalizeRefundStatus`).

## Decisión

ETL en `seed.ts`. El seed legacy permanece intacto; toda transformación ocurre al poblar la
BD nueva.

## Consecuencias

- **Corto plazo:** la migración es reproducible y auditable — se puede re-ejecutar tantas
  veces como haga falta sin tocar el origen. Los helpers de normalización tienen tests unitarios.
- **Largo plazo:** si aparecen nuevos formatos sucios, se extiende un helper, no el dato.
  El ETL documenta de facto la deuda que se corrigió. El costo es que el `db:seed` es un paso
  obligatorio del arranque, no opcional.
