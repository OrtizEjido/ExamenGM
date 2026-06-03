# JOURNAL — Migración Legacy Nexus → ERP-Migration

> Bitácora cronológica del refactor. Cada entrada incluye: marca de tiempo, qué se
> exploró/decidió/implementó, hallazgos relevantes del legacy, y decisiones tomadas
> con sus razones. Al final se mantiene el **historial de prompts** utilizados
> (asistencia de IA permitida por el examen).

---

## Entrada 1 — 2026-06-03 14:16 (PDT) — Análisis inicial + arranque del monorepo

### Resumen del prompt
Se solicitó:
1. Crear, en la raíz del workspace, la carpeta **`ERP-Migration`** que albergará el refactor.
2. Crear este **`JOURNAL.md`** con los datos que pide el examen en forma resumida; dejar
   los apartados *"Qué exploré"* y *"Decisiones tomadas y razones"* como secciones vacías
   (las completará la persona evaluada), e incluir una sección **"Resumen del prompt"**.
3. Iniciar la migración **por el tipado primero**, montando un **monorepo con Turborepo**
   para compartir los tipos entre frontend (React) y backend (Node), aprovechando TypeScript.
4. Hacer la migración lo más **1:1 posible** respecto al legacy; **aún no** corregir errores
   ni normalizar las inconsistencias de datos (eso vendrá en una fase posterior).

### Qué exploré
<!-- Por completar -->

### Hallazgos relevantes sobre el legacy (resumen)
- **Stack legacy:** Flask 1.0.4 + JS vanilla + SQLite, SQL crudo (sin ORM), conexión global
  única, `PRAGMA foreign_keys = OFF` → **cero FKs** declaradas en todo el esquema.
- **Inconsistencias de datos (a normalizar después, no ahora):**
  - `sales.total` y `refunds.amount` guardados como **TEXT** en vez de numérico.
  - `created_at` con **3 formatos mezclados** en la misma columna: ISO `YYYY-MM-DD`,
    `DD/MM/YYYY` y epoch unix (`'1735862400'`).
  - Campos `status` con múltiples variantes equivalentes: ventas
    (`completed/COMPLETED/done/finalizada`), reembolsos
    (`Approved/aprobada/done/pending/rejected`), notificaciones (`read/READ/leido/unread`).
- **Lógica de negocio duplicada** en frontend + backend + triggers de la BD (IVA 0.16,
  descuento `LEGACY_A` 0.85, descuentos por volumen).
- **Seguridad (NO se toca en esta fase 1:1):** SQL injection por concatenación, `is_admin`
  enviado por el cliente, passwords en texto plano. Se documenta en los tipos pero se migra tal cual.
- **Restos arquitectónicos:** `models/` y `repositories/` existen pero casi no se usan;
  `audit_log` e `inventory_movements` vacías; `sales.product_id` es columna fantasma
  (la verdad está en `sale_items`).

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- Esqueleto del monorepo Turborepo: `package.json` (workspaces), `turbo.json`,
  `tsconfig.base.json`, `.gitignore`.
- Paquete compartido **`@erp/types`** (`packages/types`) con el tipado migrado **1:1**:
  - `domain` por bounded context (identity, catalog, inventory, sales, purchasing,
    reporting, notifications, refunds) modelando las filas reales de la BD.
  - DTOs de request/response por endpoint, espejo de la API Flask actual.
  - `common.ts` con escalares que documentan las inconsistencias legacy
    (`MoneyString`, `LegacyDateString`, `IntBool`) para normalizarlas en una fase futura.

---

## Entrada 2 — 2026-06-03 14:28 (PDT) — Frontend: componentes visuales compartidos (Ant Design)

### Resumen del prompt
Crear los **componentes visuales compartidos en React** para iniciar el frontend:
ventanas de advertencia, botones de guardado y la navegación como **sidebar**. Usar
**Next.js** para las rutas y aplicar **Ant Design** a todo lo visual.

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- Paquete compartido **`@erp/ui`** (Ant Design v5) con:
  - `SaveButton` — botón de guardado (primario + ícono, `htmlType=submit`, `loading`).
  - `WarningDialog` — ventana de advertencia/confirmación controlada (con variante `danger`).
  - `Sidebar` — navegación lateral colapsable (`Layout.Sider` + `Menu`), agnóstica al
    router vía callback `onNavigate` (no depende de Next).
  - `AppLayout` — shell (sidebar + header + content).
  - `UiProvider` — `ConfigProvider` (tema `erpTheme` + locale es-ES) + `App` de antd.
- App **`apps/web`** (Next.js 14 App Router) consumiendo `@erp/ui` y `@erp/types`:
  - `AntdRegistry` (`@ant-design/nextjs-registry`) para estilos SSR.
  - `AppFrame` (client) cablea el `Sidebar` con `usePathname`/`useRouter` de Next.
  - Dashboard demo + páginas placeholder por módulo (patrón de estado vacío con `Empty`).
- Config monorepo: `transpilePackages: ["@erp/ui", "@erp/types"]` (paquetes en TS fuente).

### Hallazgos / notas
- Se fijó **React 18 + Next 14 + antd v5** para evitar la capa de compatibilidad que
  antd requiere con React 19.
- Accesibilidad básica: `aria-label` en botones de acción del diálogo, `lang="es"`.
- **Verificación:** `tsc --noEmit` OK en `@erp/types`, `@erp/ui` y `apps/web`;
  `next build` exitoso (11 rutas estáticas generadas).

---

## Entrada 3 — 2026-06-03 14:45 (PDT) — Alineación a Clean Architecture + MVVM + SOLID

### Resumen del prompt
Adoptar **Clean Architecture + MVVM** y **SOLID**; corregir lo necesario para alinear el
código existente a estos principios **antes de continuar**. Además, crear una entrada en el
journal y opinar si conviene una skill para las entradas del journal.

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- Reestructuré `apps/web/src` en capas con **regla de dependencia hacia adentro**:
  `domain/` → `application/` (ports + use cases) → `infrastructure/` (adapters + DI) →
  `presentation/` (Views + ViewModels). El `app/` quedó como enrutado delgado.
- **Vertical slice de referencia (Dashboard)** que demuestra el flujo completo con DIP:
  `DashboardSummary` (domain) ← `GetDashboardSummary` (use case) ← `DashboardRepository`
  (port) ← `InMemoryDashboardRepository` (adapter) ← `container` (composition root) ←
  `ServicesProvider`/`useServices` (DI en React) ← `useDashboardViewModel` (ViewModel) ←
  `DashboardView` (View).
- **MVVM**: saqué la lógica del `page.tsx`; ahora la View es "tonta" (carga/error/datos) y
  el ViewModel orquesta el caso de uso.
- Moví `AppFrame`/`ComingSoon` a `presentation/shared`; actualicé imports de las 8 páginas.
- Documenté todo en `apps/web/ARCHITECTURE.md` (regla de dependencia, mapeo MVVM, SOLID).

### Hallazgos / notas
- El dominio **no** importa `@erp/types` (DTOs = detalle de adapter); la infraestructura
  mapeará DTOs → modelos de dominio. Esto mantiene la independencia de la capa de dominio.
- El adapter actual es in-memory (conteos del seed); se sustituirá por uno HTTP contra
  `apps/api` cambiando solo el `container` (OCP).
- **Verificación:** `tsc --noEmit` OK; `next build` exitoso (11 rutas).

---

## Entrada 4 — 2026-06-03 14:47 (PDT) — Skill de journal + vista de inicio (login)

### Resumen del prompt
Crear la skill `erp-journal` para registrar entradas del journal con plantilla fija, y crear
la **vista de inicio** (login) sin lógica que, al hacer clic, avance a la pantalla principal
donde se ve el sidebar.

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- Skill `erp-journal` en `.claude/skills/erp-journal/SKILL.md` (registrada e invocable):
  inserta la entrada con timestamp real, rellena resumen/implementado/hallazgos, deja
  "Qué exploré" y "Decisiones" vacías, y agrega el prompt al historial numerado.
- Reestructuré las rutas de `apps/web` con **route groups** de Next.js:
  - `/` → `LoginView` (vista de inicio, **sin** sidebar; credenciales `admin/1234` precargadas).
  - Grupo `(app)/` con `layout.tsx` que monta `ServicesProvider` + `AppFrame` (sidebar).
  - `/dashboard` y los 7 módulos viven dentro de `(app)/`.
  - `LoginView` usa `useRouter().push("/dashboard")` al enviar el formulario.
- Actualicé el NAV del sidebar (Dashboard → `/dashboard`).

### Hallazgos / notas
- Esta entrada se registró **usando la propia skill `erp-journal`** (primera prueba real).
- El formulario de login usa validación visual de Ant Design (campos requeridos).
- **Verificación:** `tsc --noEmit` OK; `next build` exitoso (rutas `/`, `/dashboard` + 7 módulos).
  Nota: un `tsc` previo mostró errores de `.next/types` *stale*; se resolvió regenerando `.next`.

---

## Entrada 5 — 2026-06-03 15:02 (PDT) — Capa de idioma (i18n) y externalización de textos

### Resumen del prompt
Antes de los módulos, crear una **capa de idioma** preparada para inglés futuro (aunque no
se complete en el examen): mover todos los textos de los componentes visuales a esa capa y
recomendar librería/herramienta de multi-idioma. Crear entrada de journal.

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- **Librería elegida: `next-intl`** (modo sin routing de locale), por integración nativa con
  App Router, mensajes **tipados** y soporte server/client.
- Capa i18n en `apps/web`: `messages/es.json` + `messages/en.json` (EN ya traducido y listo),
  `src/i18n/request.ts` (locale fijo `es` hoy, conmutable a futuro), plugin en `next.config.mjs`,
  y `global.d.ts` que tipa las claves (`IntlMessages`) para autocompletado/verificación en TS.
- `layout.tsx` ahora provee `NextIntlClientProvider` y genera metadata vía `getTranslations`.
- **`@erp/ui` quedó agnóstico a idioma**: quité los literales en español de `SaveButton`,
  `WarningDialog` y `Sidebar` (los textos se inyectan por props); `UiProvider` acepta `locale`
  de Ant Design (default es-ES).
- Externalicé todos los textos de `AppFrame`, `ComingSoon`, `LoginView` y `DashboardView`
  a las claves de i18n; el `useDashboardViewModel` ya no contiene texto de UI.

### Hallazgos / notas
- Entrada registrada con la skill `erp-journal`.
- Los textos OK/Cancel de Ant Design se localizan solos vía el `locale` del `ConfigProvider`.
- **Verificación:** `tsc --noEmit` OK en `@erp/ui` y `apps/web` (claves i18n tipadas);
  `next build` exitoso; server dev sirviendo `/`, `/dashboard`, `/catalog` (HTTP 200) con
  los textos provenientes del catálogo es.

---

## Entrada 6 — 2026-06-03 15:15 (PDT) — Tema claro/oscuro en los componentes visuales

### Resumen del prompt
Implementar tema **claro y oscuro** en los componentes visuales actuales (y a futuro en los
módulos), y recomendar si hace falta una librería.

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- **Sin librería para el estilo**: Ant Design v5 cambia la paleta con
  `theme.darkAlgorithm` / `defaultAlgorithm`. **`next-themes`** (recomendado) gestiona el modo:
  persistencia, preferencia del sistema y anti-flash en SSR.
- `@erp/ui` quedó agnóstico al tema:
  - `UiProvider` recibe `mode` ("light"|"dark") y aplica el algoritmo de antd.
  - `theme.ts` dejó de fijar fondos (los resuelve el algoritmo).
  - `AppLayout` usa tokens (`colorBgContainer`, `colorBorderSecondary`) en el header.
  - `Sidebar` recibe `theme` y adapta fondo y color de marca.
  - Nuevo componente **`ThemeToggle`** (presentacional, recibe `isDark`/`onChange`).
- App: `AppThemeProvider` puentea next-themes → `UiProvider`; `layout.tsx` envuelve con
  `ThemeProvider` (system + anti-flash); `ThemeToggle` en el header (AppFrame) y en el login;
  fondos del login por token; `html.dark` en `globals.css` para reducir flash.
- i18n: añadida la clave `app.themeToggle` (es/en).

### Hallazgos / notas
- Entrada registrada con la skill `erp-journal`.
- El `next build` hizo OOM en el entorno por presión de memoria (prerender estático de 12
  páginas con antd); se resolvió con `NODE_OPTIONS=--max-old-space-size=4096`. En máquina con
  RAM normal el heap por defecto basta. **Importante:** apagar el dev server antes de buildear.
- **Verificación:** `tsc --noEmit` OK en `@erp/ui` y `apps/web`; `next build` exitoso (12/12);
  dev server sirviendo `/` y `/dashboard` (HTTP 200) con el `ThemeToggle` presente en ambos.

---

## Entrada 7 — 2026-06-03 15:27 (PDT) — Sidebar fijo + inicialización de git y commits segmentados

### Resumen del prompt
Autorizar el apagado del dev server en cada build; dejar el sidebar del **mismo color en
ambos temas**; iniciar git, crear el repo remoto donde se subirá, y **segmentar los commits**
(primero los modelos, luego lo visual).

### Qué exploré
<!-- Por completar -->

### Decisiones tomadas y razones
<!-- Por completar -->

### Qué implementé (resumen)
- `Sidebar` fijado en oscuro en ambos temas (`theme="dark"` en `AppFrame`); el `ThemeToggle`
  sigue cambiando el resto de la UI (header, contenido, cards, login).
- Autorización "apagar dev server antes de cada build" guardada en memoria.
- `git init -b main` en `ERP-Migration`; corregido `.gitignore` (faltaba `.next/`, `out/`,
  `next-env.d.ts`).
- Commits segmentados:
  - `c91e03a` — modelos: scaffold del monorepo + `@erp/types`.
  - `d64d57f` — visual: `@erp/ui` + `apps/web` (i18n, tema, Clean Architecture/MVVM).

### Hallazgos / notas
- Entrada registrada con la skill `erp-journal`.
- **`gh` (GitHub CLI) no está instalado** → el repo remoto queda pendiente de definir método
  (instalar gh + auth, o crear repo vacío en github.com y hacer push a esa URL).
- `next build` volvió a hacer OOM en el prerender estático (entorno con poca RAM); el código
  **compila y typechquea OK** (`tsc --noEmit` verde en `@erp/ui` y `apps/web`). El runtime ya
  se validó en dev en turnos previos.

---

## Historial de prompts

1. **Prompt 1** — Contexto del examen: leer y entender las instrucciones del archivo
   `EXAMEN PRÁCTICO.txt` sin ejecutar acciones todavía.
2. **Prompt 2** — Ejecutar el análisis del sistema ERP usando la skill `erp-analyzer`
   y reportar cualquier dato relevante adicional al final.
3. **Prompt 3** — Crear la carpeta `ERP-Migration` con este `JOURNAL.md`; arrancar el
   monorepo con Turborepo y migrar **primero el tipado**, lo más 1:1 posible, sin corregir
   aún las inconsistencias de datos.
4. **Prompt 4** — Crear componentes visuales compartidos en React (ventanas de
   advertencia, botones de guardado, navegación como sidebar), usar Next.js para las
   rutas y aplicar Ant Design a todo lo visual; así inicia la parte del frontend.
5. **Prompt 5** — Adoptar Clean Architecture + MVVM y SOLID; corregir el código para
   alinearlo antes de continuar, crear entrada de journal y evaluar una skill para el journal.
6. **Prompt 6** — Crear la skill `erp-journal` y la vista de inicio (login) sin lógica que,
   al hacer clic, avance a la pantalla principal con sidebar.
7. **Prompt 7** — Crear una capa de idioma (i18n) para inglés futuro, externalizar todos los
   textos de los componentes visuales y recomendar librería de multi-idioma.
8. **Prompt 8** — Implementar tema claro/oscuro en los componentes visuales (y a futuro en
   los módulos) y recomendar si hace falta una librería.
9. **Prompt 9** — Autorizar apagar el dev server en cada build, dejar el sidebar del mismo
   color en ambos temas, iniciar git y crear el repo remoto, y segmentar los commits
   (primero los modelos, luego lo visual).
