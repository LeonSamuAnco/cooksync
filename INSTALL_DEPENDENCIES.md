# 📦 DEPENDENCIAS NECESARIAS PARA SISTEMA DE NOTIFICACIONES

## Backend (NestJS)

```bash
cd cook-backend

# Instalar dependencias de WebSockets
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Instalar dependencias de tareas programadas
npm install @nestjs/schedule

# Instalar tipos de TypeScript
npm install --save-dev @types/socket.io
```

## Frontend (React)

```bash
cd cook-frontend

# Instalar cliente de Socket.IO
npm install socket.io-client

# Verificar que React Router esté instalado
npm install react-router-dom
```

## Verificar Instalación

### Backend:
```bash
cd cook-backend
npm list @nestjs/websockets @nestjs/schedule
```

### Frontend:
```bash
cd cook-frontend
npm list socket.io-client
```

## Notas Importantes

1. **@nestjs/schedule**: Permite crear tareas programadas (cron jobs)
2. **@nestjs/websockets**: Gateway de WebSockets para NestJS
3. **socket.io**: Librería de WebSockets para el servidor
4. **socket.io-client**: Cliente de WebSockets para React

## Versiones Recomendadas

- @nestjs/websockets: ^10.0.0
- @nestjs/platform-socket.io: ^10.0.0
- @nestjs/schedule: ^4.0.0
- socket.io: ^4.6.0
- socket.io-client: ^4.6.0
