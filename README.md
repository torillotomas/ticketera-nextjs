# Ticketera Help Desk · Portal & Soporte (Jira-lite)

Aplicación **Help Desk / Ticketera** estilo Jira / InvGate, desarrollada con **Next.js (App Router)**, **Prisma** y **PostgreSQL**.  
Pensada como **proyecto de portfolio real**, con flujo completo **USER → AGENT → resolución → cierre validado**.

---

## ✨ Funcionalidades principales

### 🎫 Gestión de tickets
- Crear tickets con **título, descripción, prioridad y categoría**
- Código automático por ticket (ej: `TCK-001`)
- Estados del ticket:
  - `OPEN` → Abierto
  - `IN_PROGRESS` → En progreso
  - `PENDING` → Pendiente
  - `RESOLVED` → Resuelto (espera confirmación del usuario)
  - `CLOSED` → Cerrado (finalizado)

---

### 👤 Portal de Usuario (USER)
- Portal independiente (`/portal`)
- Crear nuevas solicitudes
- Ver **tickets activos y cerrados**
- Ver **detalle completo del ticket** (historial + comentarios)
- Confirmar solución → pasa el ticket a **CLOSED**
- Adjuntar imágenes en comentarios (archivo o pegar desde portapapeles)

---

### 🧑‍💻 Panel de Agentes (AGENT)
- Bandejas:
  - Tickets **sin asignar**
  - Tickets **asignados al agente**
- Tomar tickets desde la cola
- Responder tickets con comentarios e imágenes
- Marcar tickets como **RESOLVED**

---

### 🛠️ Administración (ADMIN)
- Ver todos los tickets del sistema
- Filtros:
  - Sin asignar
  - Por agente
  - Todos
- Control completo del flujo de tickets

---

## ⚙️ Configuración de usuario (`/settings`)

- Editar **nombre**, **avatar**, **zona horaria**
- Preferencias de **notificaciones**
- Cambio de contraseña
- **Cerrar sesión en todos los dispositivos**
- Subida de avatar con imagen (upload real al servidor)

> La sesión se invalida globalmente mediante `tokenVersion` (logout-all real, estilo apps productivas).

---

## 🖼️ Avatar de usuario
- Avatar por defecto con **inicial del nombre**
- Subida de imagen desde configuración
- Persistencia en base de datos
- Visualización automática en el header

---

## 💬 Comentarios con adjuntos
- Comentarios por ticket
- Subida de imágenes
- Historial completo visible para USER y AGENT

---

## 🔐 Autenticación y seguridad
- Login con email + contraseña
- JWT firmado (JOSE)
- Cookies **HTTP-only**
- Roles:
  - `USER`
  - `AGENT`
  - `ADMIN`
- Invalidación global de sesiones (**logout en todos los dispositivos**)
- Protección de rutas con:
  - Middleware (solo UI)
  - Validación server-side en layouts

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
- JWT (JOSE)
- Cookies HTTP-only
- Middleware + Server Components

---

## 📂 Estructura del proyecto (resumen)

```txt
app/
  (auth)/
    login/
    register/

  (dashboard)/
    layout.tsx
    tickets/
      page.tsx
      [id]/
    settings/
      page.tsx

  (portal)/
    portal/
      page.tsx
      tickets/
        [id]/

  api/
    auth/
      login/
      logout/
      logout-all/
      me/
    users/
      me/
    tickets/
    upload/
      avatar/

components/
lib/
prisma/
public/uploads/avatars/
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
- `demian@example.com` / `1234` (USER)
- `agent@example.com` / `1234` (AGENT)

### 6. Levantar proyecto
```bash
npm run dev
```

---

## 🛣️ Roadmap futuro
- Métricas y SLA
- Notificaciones en tiempo real
- Kanban drag & drop
- Auditoría de cambios
- Integración con storage externo (S3 / Cloudinary)

---

## 👤 Autor
**Demian Tomás Torillo**  
Proyecto Full Stack · Portfolio
