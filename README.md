# ERP Nexus — Migración a TypeScript

Refactor del sistema **Legacy Nexus** (Flask + SQLite, JSON crudo) hacia un stack
fullstack **TypeScript** organizado como monorepo. El objetivo no es solo portar el
comportamiento, sino **corregir la deuda de datos** del legacy (estatus multivaluados,
montos como texto, fechas en formatos mezclados) durante la migración.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| **Node.js** | ≥ 20 (probado en 20 y 24) |
| **npm** | ≥ 10 (incluido con Node) |

No requiere Docker, ni base de datos externa, ni servicios en la nube: la persistencia es
**SQLite local** (un archivo `dev.db`), poblado por un ETL desde el seed legacy inmutable.

---

## Arranque en una máquina limpia

Desde la raíz del repositorio (`ERP-Migration/`):

```bash
# 1. Instalar dependencias de todo el monorepo (un solo comando, npm workspaces)
npm install

# 2. Configurar variables de entorno del backend
cp apps/api/.env.example apps/api/.env

# 3. Crear la base de datos SQLite y aplicar el esquema Prisma
cd apps/api
npm run prisma:generate     # genera el cliente Prisma tipado
npm run db:push             # crea dev.db con todas las tablas

# 4. Poblar la base con el ETL (lee el seed legacy y normaliza los datos)
npm run db:seed
# → Seeded: 2 roles, 5 users, 500 products, 3 warehouses, 1500 stock rows,
#           5 suppliers, 50 sales, 50 sale_items, 4 refund statuses, 10 refunds,
#           5 notification kinds, 30 notifications
```

Luego, en **dos terminales separadas**:

```bash
# Terminal A — Backend (http://localhost:4000)
cd apps/api && npm run dev

# Terminal B — Frontend (http://localhost:3000)
cd apps/web && npm run dev
```

Abre **http://localhost:3000** e inicia sesión.

### Credenciales de acceso

Todos los usuarios migrados comparten la contraseña `1234` (cifrada en BD con AES-256-CBC).

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `1234` | Administrador |
| `user` | `1234` | Usuario normal |
| `vendor1`, `vendor2`, `legacy_op` | `1234` | Usuario normal |

### Variables de entorno

**`apps/api/.env`** (copiar de `.env.example`):

| Variable | Propósito | Default (dev) |
|---|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite | `file:./dev.db` |
| `PORT` | Puerto del backend | `4000` |
| `CIPHER_KEY` | Clave AES-256 (64 hex = 32 bytes) para cifrar contraseñas | provista para dev |
| `JWT_SECRET` | Secreto para firmar los JWT | provista para dev |

**`apps/web`** (opcional): `NEXT_PUBLIC_API_URL` apunta al backend. Si no se define, usa
`http://localhost:4000` por defecto.

> En producción **reemplaza** `CIPHER_KEY` y `JWT_SECRET` por secretos fuertes.

---

## Estructura del monorepo

Monorepo gestionado con **Turborepo** + **npm workspaces**.

```
ERP-Migration/
├─ apps/
│  ├─ api/                 Backend — Node + Express + Prisma (SQLite)
│  │  ├─ prisma/
│  │  │  ├─ schema.prisma  Esquema NORMALIZADO de la BD nueva
│  │  │  ├─ seed.ts        ETL: lee el seed legacy y normaliza al esquema nuevo
│  │  │  ├─ etl-helpers.ts Helpers de normalización (fechas, montos, estatus)
│  │  │  └─ legacy/        Seed legacy INMUTABLE (solo lectura)
│  │  └─ src/
│  │     ├─ domain/        Entidades y reglas (sin framework ni SQL)
│  │     ├─ application/   Casos de uso + puertos (interfaces de repositorio)
│  │     ├─ infrastructure/Repositorios Prisma, cifrado, exportador Excel, DI
│  │     └─ interface/http/Rutas Express; entrada/salida tipada con @erp/types
│  │
│  └─ web/                 Frontend — Next.js 14 (App Router)
│     ├─ messages/         Traducciones i18n (es / en)
│     └─ src/
│        ├─ app/(app)/     Rutas por módulo (catalog, inventory, refunds, reports…)
│        ├─ domain/        Modelos del frontend (independientes de DTOs)
│        ├─ application/   Puertos + casos de uso
│        ├─ infrastructure/Adapters HTTP contra apps/api + contenedor DI
│        └─ presentation/  ViewModels (hooks MVVM) + Views (componentes antd)
│
├─ packages/
│  ├─ types/               @erp/types — contratos compartidos FE/BE (DTOs)
│  └─ ui/                  @erp/ui — componentes visuales compartidos
│
├─ JOURNAL.md              Bitácora de decisiones por fase
├─ turbo.json              Pipeline de Turborepo
└─ tsconfig.base.json      Configuración TypeScript base
```

### Arquitectura por capas (Clean Architecture)

Tanto `apps/api` como `apps/web` siguen **Clean Architecture** con inversión de
dependencias: las capas internas (domain, application) no conocen a las externas
(infrastructure, interface). El frontend añade **MVVM** — cada pantalla tiene un
`use<Modulo>ViewModel` (estado y lógica) y una `<Modulo>View` (presentación pura).

El flujo de una petición es siempre el mismo:

```
Vista → ViewModel → caso de uso → puerto (interface)
                                      ↑
                          adapter HTTP / Prisma (infrastructure)
```

---

## Comandos útiles

Desde la raíz (vía Turborepo, ejecutan sobre todos los workspaces):

```bash
npm run build       # build de api + web + packages
npm run typecheck   # tsc --noEmit en todo el monorepo
npm run lint        # lint de todo el monorepo
```

Por aplicación:

```bash
cd apps/api && npm test     # tests del backend (Vitest)
cd apps/web && npm test     # tests del frontend (Vitest + Testing Library)
```

---

## Decisiones técnicas

### Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Monorepo | Turborepo + npm workspaces | Compartir tipos FE/BE sin publicar paquetes; un solo `npm install` |
| Backend | Node + Express + **Prisma** (SQLite) | Prisma da tipado de extremo a extremo y migraciones declarativas |
| Frontend | **Next.js 14** (App Router) + React 18 | SSR/routing modernos; estándar del ecosistema |
| UI | **Ant Design v5** (`@erp/ui`) | Componentes completos (tablas, paginado, tags) listos para ERP |
| i18n | **next-intl** | Textos visibles por clave; preparado para inglés |
| Tests | **Vitest** + Testing Library | Rápido, mismo runner en ambas apps |
| Auth | **JWT** (HS256, 8 h) + **AES-256-CBC** | Sesión stateless; contraseñas cifradas y descifrables |

### Corrección de deuda de datos

El seed legacy (`apps/api/prisma/legacy/`) es **inmutable**. Toda transformación ocurre en
el **ETL** (`prisma/seed.ts` + `etl-helpers.ts`) al poblar la BD nueva:

- **Estatus multivaluados → tablas catálogo.** Variantes como `Approved` / `aprobada` /
  `done` se unifican a un `code` canónico estable (`approved`, `pending`, …) en tablas
  catálogo (`refund_statuses`, `notification_kinds`). El texto visible se resuelve en el
  frontend por i18n; el `code` no cambia.
- **Montos como TEXT → `Float`.** `refunds.amount` (`"3335.5"`) se parsea a número.
- **Fechas mezcladas → `DateTime`.** ISO, `DD/MM/YYYY` y epoch unix se normalizan a fecha real.
- **Contraseñas en claro → AES-256-CBC.** Se cifran al migrar; el login las descifra y verifica.

### Patrones transversales

- **Paginado server-side** en tablas con muchos registros (catálogo: 500, inventario: 1500).
  El backend devuelve `{ items, total, page, limit, pages }`; el frontend nunca filtra en cliente.
- **Búsqueda por endpoint dedicado** (`/search/<campo>`) disparada por botón, no mientras se escribe.
- **Exportación a Excel** (`.xlsx` con ExcelJS) en reportes — reemplaza el JSON crudo del legacy.

---

## Dominios incluidos en el alcance

| Dominio | Estado | Características |
|---|---|---|
| **Auth** | ✅ | Login con JWT; roles (admin / normal) por tabla catálogo; contraseñas AES-256 |
| **Catálogo** | ✅ | 500 productos; paginado server-side; búsqueda por nombre y por SKU (con padding) |
| **Inventario** | ✅ | 1500 filas de stock; paginado; filtro por almacén; búsqueda por producto |
| **Devoluciones** | ✅ | Estatus unificado por catálogo; monto y fecha normalizados; aprobar / rechazar |
| **Notificaciones** | ✅ | Tipo por tabla catálogo; notificaciones por usuario de sesión; marcar como leída |
| **Reportes** | ✅ | Resúmenes por categoría / proveedor / agregado; **exportación a Excel (.xlsx)** |
| Ventas | ⏳ parcial | Tablas migradas (lectura) para alimentar reportes; CRUD pendiente |
| Compras | ⏳ pendiente | Ruta presente (placeholder) |

---

## Documentación

- **[Architecture Decision Records](./docs/adr/)** — las decisiones técnicas clave (monorepo,
  tablas catálogo, cifrado, paginado server-side, ETL) con contexto, opciones y consecuencias.
- **[`JOURNAL.md`](./JOURNAL.md)** — bitácora por fase con el detalle de qué se exploró y por qué.
