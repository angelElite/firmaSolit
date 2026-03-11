# SGPC — Sistema de Gestión de Pedidos y Clientes

Monorepo con backend **Django REST Framework** y frontend **React + Vite + TailwindCSS**.

---

## Estructura del proyecto

```
firmaSolit/
├── backend/          # Django + DRF API
│   ├── apps/
│   │   ├── users/        # Usuarios y autenticación JWT
│   │   ├── clients/      # Clientes
│   │   ├── orders/       # Pedidos e ítems
│   │   ├── payments/     # Pagos
│   │   ├── deliveries/   # Entregas
│   │   ├── catalogs/     # Catálogos (materiales, acabados, etc.)
│   │   └── audit/        # Historial de cambios
│   ├── sgpc/             # Configuración del proyecto Django
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/        # Páginas (Login, Dashboard, Clientes, Pedidos)
    │   ├── layouts/      # Layouts (MainLayout con sidebar)
    │   ├── components/   # Componentes (ProtectedRoute, etc.)
    │   ├── services/     # Axios API client y endpoints
    │   └── store/        # Estado global con Zustand
    ├── package.json
    └── vite.config.js
```

---

## Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm / yarn | 9+ |
| PostgreSQL | 14+ |

---

## Configuración rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/angelElite/firmaSolit.git
cd firmaSolit
```

### 2. Backend (Django)

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

#### Crear base de datos PostgreSQL

```sql
-- En psql o pgAdmin:
CREATE DATABASE sgpc_db;
```

#### Aplicar migraciones y crear superusuario

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Iniciar servidor backend

```bash
python manage.py runserver
# API disponible en: http://localhost:8000
# Admin Django:      http://localhost:8000/admin
```

---

### 3. Frontend (React + Vite)

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# Frontend disponible en: http://localhost:5173
```

> El frontend ya está configurado con proxy para `/api` → `http://localhost:8000`, por lo que no necesitas configurar CORS manualmente en desarrollo.

---

## Puertos por defecto

| Servicio | URL |
|---|---|
| Backend (Django) | http://localhost:8000 |
| Frontend (React) | http://localhost:5173 |
| Admin Django | http://localhost:8000/admin |

---

## Variables de entorno del backend (`.env`)

Copia `.env.example` a `.env` y ajusta según tu entorno:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=sgpc_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## API REST — Endpoints principales

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Obtener tokens JWT |
| POST | `/api/auth/refresh/` | Renovar access token |
| GET | `/api/auth/me/` | Datos del usuario autenticado |

### Clientes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clients/` | Listar clientes |
| POST | `/api/clients/` | Crear cliente |
| GET | `/api/clients/{id}/` | Detalle cliente |
| PUT | `/api/clients/{id}/` | Actualizar cliente |

### Pedidos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/orders/` | Listar pedidos |
| POST | `/api/orders/` | Crear pedido |
| GET | `/api/orders/{id}/` | Detalle pedido |
| PUT | `/api/orders/{id}/` | Actualizar pedido |
| POST | `/api/orders/{id}/change-status/` | Cambiar estado |
| GET | `/api/orders/{id}/history/` | Historial de cambios |
| GET/POST | `/api/orders/{id}/items/` | Ítems del pedido |
| GET/POST | `/api/payments/orders/{id}/payments/` | Pagos del pedido |

---

## Roles de usuario

| Rol | Descripción |
|---|---|
| `ADMINISTRADOR` | Acceso total al sistema |
| `ADMINISTRACION` | Gestión de clientes, pedidos y pagos |
| `PRODUCCION` | Vista y actualización de producción |
| `CHOFER` | Vista y actualización de entregas |

---

## Estados de pedido y flujo

```
NUEVO → ANTICIPO_PENDIENTE → CONFIRMADO → PROGRAMADO
    → EN_PRODUCCION → EN_ACABADO → LISTO_ENTREGA → EN_RUTA → ENTREGADO
```

Reglas de negocio:
- No se puede pasar a `EN_PRODUCCION` si el estado es `NUEVO` o `ANTICIPO_PENDIENTE`.
- No se puede marcar `ENTREGADO` sin pasar por `LISTO_ENTREGA` y `EN_RUTA`.
- Todo cambio de estado queda registrado en el historial.

---

## Stack tecnológico

### Backend
- Python 3.10+ / Django 4.2
- Django REST Framework 3.14
- SimpleJWT (autenticación)
- django-cors-headers
- PostgreSQL

### Frontend
- React 18 + Vite 5
- TailwindCSS 3
- React Router 6
- Axios
- Zustand (estado global)
- React Hook Form + Zod (validaciones)
