# Ticketera Help Desk · Portal & Soporte (Jira-lite)

Aplicación **Help Desk / Ticketera** estilo Jira / InvGate, desarrollada con **Next.js (App Router)**, **Prisma** y **PostgreSQL**.
Pensada como **proyecto de portfolio real**, con flujo completo USER → AGENT → cierre validado por el usuario.

---

## ✨ Funcionalidades principales

### 🎫 Gestión de tickets
- Crear tickets con **título, descripción, prioridad y categoría**
- Código automático por ticket (ej: `TCK-001`)
- Estados:
  - `OPEN` → Abierto
  - `IN_PROGRESS` → En progreso
  - `PENDING` → Pendiente
  - `RESOLVED` → Resuelto (espera confirmación del usuario)
  - `CLOSED` → Cerrado (finalizado)

### 👤 Portal de Usuario (USER)
- Portal independiente (`/portal`)
- Crear nuevas solicitudes
- Ver **tickets activos y cerrados**
- Ver **detalle completo del ticket** (historial + comentarios)
- Confirmar solución → pasa el ticket a **CLOSED**
- Adjuntar imágenes en comentarios (Ctrl+V o archivo)

### 🧑‍💻 Panel de Agentes (AGENT)
- Bandejas:
  - Tickets **sin asignar**
  - Tickets **asignados al agente**
- Tomar tickets desde la cola
- Responder tickets con comentarios e imágenes
- Marcar tickets como **RESOLVED**

### 🛠️ Administración (ADMIN)
- Ver todos los tickets
- Filtrar por:
  - Sin asignar
  - Por agente (dropdown)
  - Todos
- Control total del sistema

---

## 🗂️ Categorías de ticket

Definidas en Prisma:

```prisma
 enum TicketCategory {
  ACCESS
  HARDWARE
  SOFTWARE
  NETWORK
  BUG
  OTHER
  FEATURE
  PAYMENTS
}

```

Seleccionables tanto por **USER** como por **AGENT** al crear tickets.

---

## 💬 Comentarios con adjuntos
- Comentarios en tiempo real por ticket
- Subida de imágenes
- Pegado directo desde el portapapeles
- Historial completo visible para USER y AGENT

---

## 🔐 Autenticación y seguridad
- Login con email + contraseña
- JWT en **cookies HTTP-only**
- Middleware de Next.js para protección de rutas
- Roles:
  - `USER`
  - `AGENT`
  - `ADMIN`

---

## 🧱 Stack técnico

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend
- API Routes (Next.js)
- Prisma ORM
- PostgreSQL

### Auth
- JWT
- Cookies HTTP-only
- Middleware (`middleware.ts`)

---

## 📂 Estructura del proyecto (resumen)

```txt
app/
  (auth)/
    login/
    register/

  (dashboard)/
    tickets/
      page.tsx
      [id]/

  (portal)/
    portal/
      page.tsx
      my/
      tickets/
        [id]/

  api/
    auth/
    tickets/
      route.ts
      [id]/
        route.ts
        comments/
        close/
        assign/
    users/
    upload/

components/
lib/
prisma/
public/uploads/
```

---

## ⚙️ Configuración local

### 1. Requisitos
- Node.js 18+
- PostgreSQL

### 2. Instalación
```bash
npm install
```

### 3. Variables de entorno
```env
DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/ticketera"
AUTH_SECRET="secreto-largo"
```

### 4. Migraciones
```bash
npx prisma migrate dev
```

### 5. Usuario demo
```bash
POST /api/seed-user
```

Usuarios demo:
- `demian@example.com` / 1234 (USER)
- `agent@example.com` / 1234 (AGENT)

### 6. Levantar proyecto
```bash
npm run dev
```

---

## 🛣️ Roadmap futuro
- Página de **configuración de usuario**
- Métricas y SLA
- Notificaciones
- Kanban drag & drop
- Auditoría de cambios

---

## 👤 Autor
**Demian Tomás Torillo**  
Proyecto Full Stack · Portfolio
