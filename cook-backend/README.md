# CookSync Backend

API RESTful para la plataforma CookSync, construida con NestJS y Prisma ORM.

## 🛠️ Tecnologías

- **NestJS**: Framework de Node.js.
- **Prisma**: ORM para la base de datos.
- **MySQL**: Base de datos relacional.
- **JWT**: Autenticación segura.

## 🚀 Configuración e Inicio

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

Asegúrate de tener un archivo `.env` con la variable `DATABASE_URL` configurada.

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar esquema con la BD
npx prisma db push
```

### 3. Iniciar Servidor

```bash
# Modo desarrollo (recomendado)
npm run start:dev

# Modo producción
npm run start:prod
```

El servidor correrá en `http://localhost:3002`.

## 🗄️ Gestión de Base de Datos

Puedes visualizar y editar los datos directamente usando Prisma Studio:

```bash
npx prisma studio
```

## 🧪 Estructura de Carpetas

- `src/`: Código fuente.
  - `auth/`: Módulo de autenticación.
  - `admin/`: Panel de administración.
  - `recipes/`, `products/`, etc.: Módulos de negocio.
- `prisma/`: Esquema de base de datos y migraciones.

---
© 2025 CookSync Team
