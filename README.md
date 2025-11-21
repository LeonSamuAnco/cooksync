# CookSync - Plataforma de Gestión Culinaria y Estilo de Vida

Este repositorio contiene el código fuente de la plataforma CookSync, dividida en Backend (NestJS) y Frontend (React).

## 🚀 Estructura del Proyecto

- **/cook-backend**: API RESTful construida con NestJS y Prisma ORM.
- **/cook-frontend**: Aplicación web construida con React.
- **/docs**: Documentación del proyecto y diagramas UML.

## 🛠️ Requisitos Previos

- **Node.js**: v18 o superior.
- **MySQL**: Base de datos relacional.
- **NPM**: Gestor de paquetes.

## 🏁 Guía de Inicio Rápido

Sigue estos pasos para ejecutar el proyecto localmente.

### 1. Configuración e Inicio del Backend

El backend maneja la lógica de negocio y la conexión a la base de datos.

```bash
cd cook-backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crea un archivo .env basado en .env.example y configura tus credenciales de BD

# 3. Sincronizar base de datos (Prisma)
npx prisma generate
npx prisma db push

# 4. Iniciar servidor en modo desarrollo
npm run start:dev
```

El servidor backend iniciará en `http://localhost:3002`.
Puedes acceder a **Prisma Studio** para ver la BD con: `npx prisma studio`.

### 2. Configuración e Inicio del Frontend

La interfaz de usuario para interactuar con la plataforma.

```bash
cd cook-frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar aplicación React
npm start
```

La aplicación abrirá automáticamente en `http://localhost:3000`.

## 📚 Documentación Adicional

Puedes encontrar diagramas de arquitectura, casos de uso y documentación teórica en la carpeta `/docs`.

## 🔒 Credenciales por Defecto (Desarrollo)

- **Admin User**: admin@cooksync.com / admin123 (Si se ha ejecutado el seed)

---
© 2025 CookSync Team
