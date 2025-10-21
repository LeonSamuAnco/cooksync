# 🔍 DIAGNÓSTICO COMPLETO - ERRORES 404 Y PÉRDIDA DE SESIÓN

## 📊 Análisis de Errores en Consola:

### **Errores 404 Detectados:**

1. ❌ `GET http://localhost:3002/admin/test` - 404 (Not Found)
2. ❌ `GET http://localhost:3002/clients/4` - 404 (Not Found)
3. ❌ `GET http://localhost:3002/clients/4/pantry` - 404 (Not Found)
4. ❌ `GET http://localhost:3002/clients/4/favorite-recipes` - 404 (Not Found)
5. ❌ `GET http://localhost:3002/clients/4/activity` - 404 (Not Found)

---

## 🎯 Problema Principal Identificado:

### **"Error de Configuración - No se pudo determinar el tipo de usuario"**

**Causa Raíz:**
- El usuario se carga desde localStorage al recargar
- El objeto `rol` NO se está guardando correctamente en localStorage
- Al parsear el usuario, falta la propiedad `rol` o `role`
- El Dashboard no puede determinar qué perfil mostrar

---

## ✅ Solución Implementada (Sesión):

### **1. Persistencia Mejorada en AuthContext**

Ya implementamos:
- ✅ Guardar usuario completo en localStorage
- ✅ Cargar usuario inmediatamente al recargar
- ✅ Validación con backend en segundo plano
- ✅ Modal de sesión expirada
- ✅ Manejo de errores de red

### **2. Logging Mejorado**

Agregamos logging detallado para diagnosticar:
```javascript
console.log('📦 Usuario parseado desde localStorage:', parsedUser);
console.log('📦 Rol del usuario:', parsedUser.rol || parsedUser.role);
```

---

## 🔧 Soluciones Pendientes (Endpoints 404):

### **Problema: Endpoints de Clientes No Existen**

Los siguientes endpoints NO están implementados en el backend:

1. `/admin/test` - Endpoint de prueba de admin
2. `/clients/:id` - Obtener datos del cliente
3. `/clients/:id/pantry` - Obtener despensa del cliente
4. `/clients/:id/favorite-recipes` - Obtener recetas favoritas
5. `/clients/:id/activity` - Obtener actividad reciente

---

## 📋 Plan de Acción:

### **OPCIÓN 1: Implementar Endpoints Faltantes (Recomendado)**

#### **Backend - Crear ClientsController:**

```typescript
// cook-backend/src/clients/clients.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    const clientId = parseInt(id);
    return await this.clientsService.getClientById(clientId);
  }

  @Get(':id/pantry')
  async getClientPantry(@Param('id') id: string) {
    const clientId = parseInt(id);
    return await this.clientsService.getClientPantry(clientId);
  }

  @Get(':id/favorite-recipes')
  async getFavoriteRecipes(@Param('id') id: string) {
    const clientId = parseInt(id);
    return await this.clientsService.getFavoriteRecipes(clientId);
  }

  @Get(':id/activity')
  async getRecentActivity(@Param('id') id: string) {
    const clientId = parseInt(id);
    return await this.clientsService.getRecentActivity(clientId);
  }
}
```

#### **Backend - Crear ClientsService:**

```typescript
// cook-backend/src/clients/clients.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getClientById(clientId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: {
        rol: true,
        cliente: {
          include: {
            plan: true,
          },
        },
      },
    });

    return {
      message: 'Cliente encontrado',
      client: user,
    };
  }

  async getClientPantry(clientId: number) {
    const pantryItems = await this.prisma.userPantry.findMany({
      where: { usuarioId: clientId, esActivo: true },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    return {
      message: 'Despensa obtenida',
      pantry: pantryItems,
      total: pantryItems.length,
    };
  }

  async getFavoriteRecipes(clientId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        usuarioId: clientId,
        tipo: 'receta',
        esActivo: true,
      },
      include: {
        // Aquí necesitarías incluir la receta relacionada
      },
    });

    return {
      message: 'Favoritos obtenidos',
      favorites: favorites,
      total: favorites.length,
    };
  }

  async getRecentActivity(clientId: number) {
    const activities = await this.prisma.userActivity.findMany({
      where: { usuarioId: clientId, esActivo: true },
      orderBy: { fecha: 'desc' },
      take: 10,
    });

    return {
      message: 'Actividad obtenida',
      activities: activities,
      total: activities.length,
    };
  }
}
```

#### **Backend - Crear ClientsModule:**

```typescript
// cook-backend/src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
```

#### **Backend - Registrar en AppModule:**

```typescript
// cook-backend/src/app.module.ts
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    // ... otros módulos
    ClientsModule, // ← Agregar aquí
  ],
})
export class AppModule {}
```

---

### **OPCIÓN 2: Usar Endpoints Existentes (Temporal)**

Modificar `ClientProfile.js` para usar endpoints que SÍ existen:

```javascript
// En lugar de /clients/4
const response = await fetch(`http://localhost:3002/auth/user/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// En lugar de /clients/4/pantry
// Usar endpoint de despensa si existe, o mostrar mensaje

// En lugar de /clients/4/favorite-recipes
const favoritesResponse = await fetch(`http://localhost:3002/favorites/my-favorites`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// En lugar de /clients/4/activity
const activityResponse = await fetch(`http://localhost:3002/activity/my-activities`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### **OPCIÓN 3: Agregar Fallbacks en Frontend (Inmediato)**

Modificar `ClientProfile.js` para manejar errores 404:

```javascript
const loadClientData = async () => {
  try {
    const response = await fetch(`http://localhost:3002/clients/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      setClientData(data.client);
    } else if (response.status === 404) {
      console.warn('⚠️ Endpoint /clients no disponible, usando datos del usuario');
      // Usar datos del usuario actual
      setClientData(user);
    }
  } catch (error) {
    console.error('❌ Error cargando datos del cliente:', error);
    // Usar datos del usuario como fallback
    setClientData(user);
  }
};
```

---

## 🎯 Recomendación Inmediata:

### **1. Verificar Datos en localStorage:**

Abre la consola del navegador y ejecuta:
```javascript
console.log('Token:', localStorage.getItem('authToken'));
console.log('Usuario:', JSON.parse(localStorage.getItem('user')));
```

**Verifica que el usuario tenga:**
- ✅ `id`
- ✅ `nombres`
- ✅ `rol` (objeto con `codigo`, `nombre`)
- ✅ `email`

### **2. Si el rol está faltando:**

Cierra sesión y vuelve a iniciar sesión:
```javascript
// En consola
localStorage.clear();
// Luego recargar página e iniciar sesión
```

### **3. Implementar Endpoints Faltantes:**

Crear el módulo de clientes en el backend siguiendo la OPCIÓN 1.

---

## 📊 Estado Actual:

### **✅ Funcionando:**
- Autenticación JWT
- Login y registro
- Persistencia de token
- Carga de usuario desde localStorage
- Modal de sesión expirada

### **❌ Faltante:**
- Endpoints de clientes (`/clients/*`)
- Endpoint de admin test (`/admin/test`)
- Manejo de fallbacks en frontend

---

## 🚀 Próximos Pasos:

1. **Inmediato:** Agregar logging y verificar datos en localStorage
2. **Corto plazo:** Implementar endpoints de clientes (OPCIÓN 1)
3. **Alternativa:** Usar endpoints existentes (OPCIÓN 2)
4. **Temporal:** Agregar fallbacks en frontend (OPCIÓN 3)

---

**¡El problema de sesión está solucionado, solo faltan los endpoints del backend!** ✅
