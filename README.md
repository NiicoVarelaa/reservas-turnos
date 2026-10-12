# Reservas Turnos

Sistema de reservas y agendamiento online con landing pública, flujo de reserva como invitado y panel profesional multi-tenant.

## Stack

| Capa | Tecnologías |
|------|------------|
| Frontend | React 18, JavaScript, Tailwind CSS, Shadcn UI, TanStack Query, Zustand, React Router, Zod, Axios |
| Backend | Node.js, Express, Supabase (PostgreSQL), Stripe, Meta WhatsApp Cloud API |
| Auth | JWT custom (access + refresh tokens) |

## Screenshots

### Landing pública

> ![](screenshots/landing.png)
> *Página principal con presentación del negocio y CTA a reservar turno.*

### Servicios

> ![](screenshots/services.png)
> *Listado de servicios disponibles con precio, duración y descripción.*

### Flujo de reserva

> ![](screenshots/booking-calendar.png)
> *Paso 1: selección de fecha.*

> ![](screenshots/booking-time.png)
> *Paso 2: selección de horario.*

> ![](screenshots/booking-form.png)
> *Paso 3: datos del cliente.*

### Inicio de sesión

> ![](screenshots/login.png)
> *Login con tabs para profesional y cliente.*

### Dashboard

> ![](screenshots/dashboard.png)
> *Panel principal con estadísticas y próximas reservas.*

### Reservas

> ![](screenshots/bookings.png)
> *Listado de reservas con filtro por estado y búsqueda.*

### Horarios

> ![](screenshots/schedule.png)
> *Configuración de disponibilidad semanal.*

### Confirmación

> ![](screenshots/confirm.png)
> *Pantalla de confirmación post-pago.*

---

## Funcionalidades principales

### Usuario invitado
- Ver landing del negocio
- Explorar servicios
- Reservar turno sin registrarse
- Pagar con Stripe
- Recibir confirmación por WhatsApp

### Profesional
- Dashboard con estadísticas (totales, hoy, pendientes, ingresos)
- Gestión de reservas (búsqueda, filtro por estado)
- Configuración de horarios (días y horas laborales)
- Gestión de servicios

### Técnicas
- Estado de servidor con TanStack Query (queries y mutations por dominio)
- Zustand limitado a estado de UI (flujo de reserva)
- Code splitting por ruta y vendor (React.lazy + manualChunks en Vite)
- Validación con Zod (esquemas compartidos frontend/backend)
- JWT con refresh tokens automáticos
- Stripe Checkout para pagos
- Recordatorios automáticos por WhatsApp
- Accesibilidad: focus-visible, aria-current, targets táctiles de 44px y `prefers-reduced-motion` en animaciones
- Diseño mobile-first y responsive (header, footer y sidebar compartidos)
- SaaS multi-tenant (soporte para múltiples negocios)

## Estructura del proyecto

```
reservas-turnos/
├── backend/
│   ├── database/         # Migraciones SQL y seeds
│   ├── scripts/          # Utilidades de CLI
│   ├── src/
│   │   ├── config/       # Stripe, Supabase, WhatsApp
│   │   ├── controllers/  # Auth, bookings, payments, etc.
│   │   ├── middleware/    # JWT auth, validación Zod
│   │   ├── routes/       # Express routers
│   │   ├── services/     # DB, reminders, WhatsApp
│   │   └── utils/        # JWT, validators, logger
│   ├── tests/            # Jest (unit, integration, helpers)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # UI (Shadcn), booking, auth, layout, icons
│   │   ├── constants/    # Textos y copy reutilizable
│   │   ├── hooks/        # Queries y mutations por dominio (useAppointments,
│   │   │                 # useServices, useSchedules, useBusiness, useAuth, ...)
│   │   ├── lib/          # queryClient, queryKeys, supabaseClient, utils
│   │   ├── pages/        # Public, Auth, Dashboard, Onboarding
│   │   ├── services/     # API client (axios), authService
│   │   ├── store/        # Zustand (solo estado UI: bookingStore)
│   │   ├── styles/       # Tailwind globals
│   │   ├── test/         # Setup y matchers de Vitest
│   │   └── validators/   # Esquemas compartidos (Zod)
│   └── .env.example
└── README.md
```

## Inicio rápido

### 1. Backend

```bash
cd backend
cp .env.example .env   # Configurar credenciales
npm install
npm run dev            # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

### 3. Stripe y WhatsApp (local)

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Para que el backend envíe confirmaciones reales por WhatsApp, completá
`WHATSAPP_PHONE_ID` y `WHATSAPP_ACCESS_TOKEN` en `backend/.env`. Con SMTP vacío,
el link de reset de contraseña se loguea en desarrollo.

### Credenciales de prueba

```
Email:    profesional@test.com
Password: Test1234!
```

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|----------|------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key para operaciones DB |
| `STRIPE_SECRET_KEY` | Secret key de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `WHATSAPP_PHONE_ID` | Phone ID de WhatsApp Cloud API |
| `WHATSAPP_ACCESS_TOKEN` | Token de acceso WhatsApp |
| `JWT_ACCESS_SECRET` | Secreto para firmar access tokens |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens |
| `FRONTEND_URL` | URL del frontend (CORS) |

### Frontend (`.env`)

| Variable | Descripción |
|----------|------------|
| `VITE_API_URL` | URL del backend API |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (para el cliente de Google OAuth) |
| `VITE_SUPABASE_ANON_KEY` | Anon public key de Supabase (para el cliente de Google OAuth) |

## Tests

```bash
cd backend  && npm test              # Jest
cd frontend && npm test              # Vitest
```

Ambos conjuntos corren sin `.env` ni servicios externos:

- Los configs de Stripe, Supabase y WhatsApp están mockeados en
  `backend/tests/setup.js`; ningún test construye clientes reales, así que la
  suite no depende de WebSocket nativo.
- En CI (`.github/workflows/ci.yml`) se corre con Node 20, que no trae
  `WebSocket` global: si se vuelven a inicializar clientes reales de Supabase,
  los tests lo van a romper ahí.

CI también ejecuta el build de Vite en cada push, por lo que el warning de
chunks o un error de compilación frena el merge.

## Licencia

MIT
