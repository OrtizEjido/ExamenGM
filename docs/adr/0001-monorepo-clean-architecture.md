# ADR 0001 — Monorepo con Clean Architecture y tipos compartidos

**Estado:** Aceptada · **Fecha:** 2026-06

## Contexto

El legacy es un Flask monolítico que mezcla rutas, SQL y lógica en los mismos archivos.
Al reescribir necesitamos backend y frontend en TypeScript que compartan los contratos de
datos sin duplicarlos ni desincronizarlos.

## Opciones consideradas

1. **Dos repos separados** (api / web), con los tipos copiados o publicados como paquete npm.
2. **Monorepo** (Turborepo + npm workspaces) con un paquete `@erp/types` compartido y capas
   Clean Architecture (domain → application → infrastructure → interface) en ambas apps.

## Decisión

Monorepo con `@erp/types` como única fuente de verdad de los DTOs, y Clean Architecture +
MVVM en frontend. Un solo `npm install` instala todo.

## Consecuencias

- **Corto plazo:** un cambio de contrato rompe el `tsc` de ambas apps de inmediato — los
  desajustes FE/BE se detectan en compilación, no en runtime.
- **Largo plazo:** las capas internas no dependen de frameworks, así que cambiar Prisma o
  Express toca solo `infrastructure`/`interface`. El precio es más ceremonia (puertos,
  casos de uso) por cada módulo, asumido como inversión en mantenibilidad.
