# Ticketera Help Desk · Jira-lite by Demian

Ticketera / Help Desk estilo **Jira-lite** construida con **Next.js 14 (App Router)**, **Prisma** y **PostgreSQL**.

Proyecto pensado para portfolio como aplicación real de soporte: tickets, comentarios con capturas de pantalla, autenticación con JWT, roles de usuario y una interfaz moderna tipo panel.

---

## ✨ Features principales

- 🎫 **Gestión de tickets**
  - Crear tickets con título, descripción y prioridad
  - Listado de tickets con estado, prioridad, creador y fecha
  - Vista de detalle por ticket

- 🔐 **Autenticación y roles**
  - Login con email + contraseña
  - JWT en cookie **HTTP-only**
  - Middleware que protege las rutas del dashboard
  - Roles:
    - `USER` → ve solo sus tickets
    - `AGENT` → ve todos los tickets y puede gestionarlos
    - `ADMIN` → pensado para administración avanzada

- 💬 **Comentarios con adjuntos**
  - Comentarios por ticket
  - Adjuntar **capturas de pantalla** en los comentarios
  - Soporte para **pegar imágenes con Ctrl+V** desde el portapapeles
  - Visualización de la miniatura de la imagen en el detalle del ticket

- 🧑‍💻 **Experiencia de agente**
  - Panel de tickets activos
  - Cambio de estado (Abierto, En progreso, Pendiente, Resuelto, Cerrado)
  - Cambio de prioridad (Baja, Media, Alta, Urgente)

- 🖥️ **UI / UX**
  - Layout con sidebar + topbar
  - Dark theme con Tailwind CSS
  - Diseño responsive básico

---

## 🧱 Stack técnico

- **Frontend**
  - Next.js 14 (App Router)
  - React
  - Tailwind CSS

- **Backend**
  - Next.js API Routes (dentro de `app/api`)
  - Prisma ORM
  - PostgreSQL

- **Auth**
  - JWT con `jose`
  - Cookies HTTP-only
  - Middleware de Next.js (`middleware.ts`)

---

## 📂 Estructura del proyecto (resumen)

```txt
app/
  (auth)/
    login/
      page.tsx
  (dashboard)/
    layout.tsx
    tickets/
      page.tsx
      [id]/
        page.tsx

  api/
    auth/
      login/route.ts
      logout/route.ts
      me/route.ts
    tickets/
      route.ts
      [id]/
        route.ts
        comments/
          route.ts
    upload/
      route.ts
    seed-user/
      route.ts

components/
  UserBadge.tsx
  LogoutButton.tsx

lib/
  prisma.ts
  auth.ts

prisma/
  schema.prisma

public/
  uploads/
```

---

## ⚙️ Configuración y ejecución local

### 1. Requisitos

- Node.js 18+
- PostgreSQL
- npm o pnpm

### 2. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/ticketera-next.git
cd ticketera-next
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Variables de entorno

Crear `.env`:

```env
DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/ticketera"
AUTH_SECRET="cambia-esto-por-un-secreto-largo"
```

### 5. Migraciones

```bash
npx prisma migrate dev --name init
```

### 6. Usuario demo

```js
fetch("/api/seed-user", { method: "POST" })
```

Usuario:
- **Email:** demian@example.com  
- **Pass:** 1234

### 7. Levantar servidor

```bash
npm run dev
```

---

## 🛣️ Roadmap

- Kanban drag & drop  
- Métricas y dashboard  
- SLA  
- Notificaciones en tiempo real  
- Gestión de usuarios  

---

## 👤 Autor

Desarrollado por **Demian Tomás Torillo** como proyecto de portfolio Full Stack.
