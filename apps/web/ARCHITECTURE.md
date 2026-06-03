# Arquitectura — `apps/web`

Clean Architecture + **MVVM** en la capa de presentación, con SOLID transversal.

## Regla de dependencia

Las dependencias apuntan **hacia adentro**. Una capa solo conoce a las más internas:

```
presentation (View + ViewModel)   ── React, antd, Next
        │
        ▼
application (use cases + ports)    ── sin framework
        │
        ▼
domain (modelos + reglas)          ── puro TypeScript
        ▲
        │
infrastructure (adapters + DI) ────┘   implementa los ports de application
```

- **`domain/`** — modelos y reglas de negocio. Sin React, sin HTTP, sin DTOs.
- **`application/`** — casos de uso y **puertos** (interfaces). No conoce implementaciones.
- **`infrastructure/`** — **adapters** que implementan los puertos (in-memory hoy, HTTP
  contra `apps/api` después) y el **composition root** (`di/container.ts`).
- **`presentation/`** — MVVM:
  - **View** (`*.View.tsx`): componente "tonto", solo renderiza estado y delega acciones.
  - **ViewModel** (`use*ViewModel.ts`): estado de presentación (carga/error/datos) y
    orquestación de casos de uso. Sin JSX ni reglas de negocio.
- **`app/`** — solo enrutado de Next.js; cada `page.tsx` delega en una View.

## MVVM

| MVVM | Aquí |
|------|------|
| Model | `domain/` + casos de uso de `application/` |
| View | `presentation/**/*View.tsx` + `@erp/ui` |
| ViewModel | `presentation/**/use*ViewModel.ts` |

## SOLID

- **SRP** — View renderiza, ViewModel orquesta, UseCase aplica la regla, Adapter accede a datos.
- **OCP** — nuevos adapters (p.ej. `HttpDashboardRepository`) sin tocar use case ni View.
- **LSP** — adapters intercambiables tras el puerto.
- **ISP** — puertos pequeños y enfocados (`DashboardRepository` expone solo `getSummary`).
- **DIP** — los casos de uso dependen de abstracciones; las concretas se inyectan en el
  `container` y se proveen vía `ServicesProvider` / `useServices()`.

## Vertical slice de referencia: Dashboard

```
domain/dashboard/DashboardSummary.ts
application/dashboard/DashboardRepository.ts      (puerto)
application/dashboard/GetDashboardSummary.ts      (caso de uso)
infrastructure/dashboard/InMemoryDashboardRepository.ts  (adapter)
infrastructure/di/container.ts                    (composition root)
presentation/di/ServicesProvider.tsx              (DI en React)
presentation/dashboard/useDashboardViewModel.ts   (ViewModel)
presentation/dashboard/DashboardView.tsx          (View)
app/page.tsx                                       (ruta -> View)
```

Cada módulo nuevo (catálogo, ventas, etc.) seguirá esta misma estructura.

## Relación con los paquetes del monorepo

- **`@erp/types`** — contratos compartidos FE/BE (DTOs de API). Vive en la frontera de
  adapters: la infraestructura mapea DTOs → modelos de `domain`. El dominio **no** importa
  `@erp/types`.
- **`@erp/ui`** — biblioteca de componentes de presentación (Ant Design), sin lógica de negocio.
