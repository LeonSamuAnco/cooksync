# 📚 MARCO TEÓRICO Y CONCEPTUAL - COOKSYNC (PARTE 2)

## 2.5.4 Tecnologías de Autenticación y Seguridad

### JWT (JSON Web Token)

**Definición:**
JWT es un estándar abierto (RFC 7519) para crear tokens de acceso que representan claims de forma segura entre dos partes.

**Fundamento Teórico:**
- **Stateless:** El servidor no necesita guardar sesiones
- **Autosuficiente:** El token contiene toda la información necesaria
- **Criptográficamente firmado:** No puede ser alterado sin invalidarse
- **Estructura:** Header.Payload.Signature

**Estructura del JWT en CookSync:**
```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    sub: 5,                    // ID del usuario
    email: "usuario@email.com",
    role: "cliente",
    iat: 1700000000,          // Emitido en
    exp: 1700604800           // Expira en (7 días)
  },
  signature: "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}

// Uso en headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Configuración Implementada:**
```typescript
// Backend: Configuración de JWT
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '7d' },
  global: true,
})

// Validación en Guards
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) throw new UnauthorizedException();
    
    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    
    return true;
  }
}
```

**Ventajas Implementadas:**
- ✅ Autenticación sin estado (stateless)
- ✅ Expiración automática (7 días)
- ✅ Refresh tokens (planificado)
- ✅ Validación en cada petición
- ✅ Guards por rol
- ✅ Seguridad HTTPS en producción

---

### Bcrypt (Hashing de Contraseñas)

**Definición:**
Bcrypt es un algoritmo de hashing de contraseñas adaptativo que incorpora un "salt" aleatorio y es resistente a ataques de fuerza bruta.

**Fundamento Teórico:**
- **Salt:** Valor aleatorio agregado a la contraseña antes de hashear
- **Adaptive:** El costo computacional aumenta con el tiempo
- **One-way:** Imposible recuperar la contraseña original del hash
- **Resistente a rainbow tables:** Cada hash es único incluso para la misma contraseña

**Implementación en CookSync:**
```typescript
// Backend: Hashing de contraseña en registro
import * as bcrypt from 'bcrypt';

async register(createUserDto: CreateUserDto) {
  // Validar que el usuario no exista
  const existingUser = await this.prisma.user.findUnique({
    where: { email: createUserDto.email }
  });
  
  if (existingUser) {
    throw new ConflictException('El email ya está registrado');
  }
  
  // Hashear contraseña con salt de 10 rondas
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
  // Guardar usuario con contraseña hasheada
  const user = await this.prisma.user.create({
    data: {
      email: createUserDto.email,
      password: hashedPassword,
      nombre: createUserDto.nombre,
    }
  });
  
  return user;
}

// Backend: Validación de contraseña en login
async login(email: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }
  
  // Comparar contraseña ingresada con hash almacenado
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }
  
  // Generar JWT
  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role
  });
  
  return { token, user };
}
```

**Ventajas Implementadas:**
- ✅ Hashing seguro con salt aleatorio
- ✅ Resistente a ataques de fuerza bruta
- ✅ Imposible recuperar contraseña original
- ✅ Validación en cada login
- ✅ Costo computacional adaptativo

---

### Passport.js (Estrategias de Autenticación)

**Definición:**
Passport.js es middleware de autenticación flexible y modular para Node.js que soporta múltiples estrategias de autenticación.

**Fundamento Teórico:**
- **Estrategias:** Diferentes métodos de autenticación (JWT, OAuth, Local)
- **Serialización:** Conversión de usuario a/desde sesión
- **Middleware:** Integración transparente con Express/NestJS

**Estrategias Implementadas en CookSync:**
```typescript
// Estrategia JWT
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

// Estrategia Local (Email + Contraseña)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

**Ventajas Implementadas:**
- ✅ Múltiples estrategias de autenticación
- ✅ Fácil extensión con nuevas estrategias
- ✅ Integración con Guards de NestJS
- ✅ Serialización de usuario
- ✅ Manejo centralizado de autenticación

---

## 2.5.5 Tecnologías de Validación y Transformación

### class-validator (Validación de DTOs)

**Definición:**
Biblioteca que permite validar objetos TypeScript usando decoradores, proporcionando validación declarativa y type-safe.

**Fundamento Teórico:**
- **Decoradores:** Metaprogramación para agregar validación
- **Validación declarativa:** Reglas definidas en la clase
- **Type-safe:** Validación en tiempo de compilación y ejecución
- **Composable:** Validadores pueden combinarse

**Ejemplo: DTO de Crear Receta:**
```typescript
import { IsString, IsInt, IsArray, Min, Max, MaxLength } from 'class-validator';

export class CreateRecipeDto {
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  titulo: string;
  
  @IsString()
  @MaxLength(2000)
  descripcion: string;
  
  @IsInt({ message: 'El tiempo debe ser un número entero' })
  @Min(1, { message: 'El tiempo mínimo es 1 minuto' })
  @Max(480, { message: 'El tiempo máximo es 480 minutos' })
  tiempoTotal: number;
  
  @IsInt()
  @Min(1)
  porciones: number;
  
  @IsArray({ message: 'Los ingredientes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredientes: RecipeIngredientDto[];
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeInstructionDto)
  instrucciones: RecipeInstructionDto[];
}

export class RecipeIngredientDto {
  @IsInt()
  ingredienteId: number;
  
  @IsNumber()
  cantidad: number;
  
  @IsInt()
  unidadMedidaId: number;
}
```

**Validadores Utilizados:**
```typescript
// Validadores de tipo
@IsString()      // Debe ser string
@IsInt()         // Debe ser entero
@IsNumber()      // Debe ser número
@IsBoolean()     // Debe ser booleano
@IsArray()       // Debe ser array
@IsObject()      // Debe ser objeto

// Validadores de tamaño
@MinLength(3)    // Mínimo 3 caracteres
@MaxLength(255)  // Máximo 255 caracteres
@Min(1)          // Valor mínimo 1
@Max(100)        // Valor máximo 100

// Validadores de formato
@IsEmail()       // Debe ser email válido
@IsUrl()         // Debe ser URL válida
@IsDateString()  // Debe ser fecha ISO
@IsEnum(Role)    // Debe ser valor del enum

// Validadores condicionales
@ValidateIf((o) => o.tipo === 'especial')
@IsNotEmpty()
especial: string;

// Validadores anidados
@ValidateNested({ each: true })
@Type(() => IngredienteDto)
ingredientes: IngredienteDto[];
```

**Ventajas Implementadas:**
- ✅ Validación declarativa y legible
- ✅ Mensajes de error personalizados
- ✅ Validación anidada de objetos
- ✅ Validadores condicionales
- ✅ Transformación automática de tipos
- ✅ Integración con NestJS ValidationPipe

---

### class-transformer (Transformación de Datos)

**Definición:**
Biblioteca que permite transformar objetos planos a instancias de clases y viceversa, con soporte para tipos complejos.

**Fundamento Teórico:**
- **Serialización:** Convertir objetos a JSON
- **Deserialización:** Convertir JSON a objetos tipados
- **Transformación:** Cambiar estructura de datos
- **Exclusión:** Omitir propiedades sensibles

**Ejemplo de Transformación:**
```typescript
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;
  
  @Expose()
  email: string;
  
  @Expose()
  nombre: string;
  
  @Exclude()  // No incluir en respuesta
  password: string;
  
  @Exclude()
  createdAt: Date;
  
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
  
  @Expose()
  @Type(() => RoleDto)
  role: RoleDto;
}

export class RoleDto {
  @Expose()
  id: number;
  
  @Expose()
  nombre: string;
}
```

**Uso en Controlador:**
```typescript
@Get(':id')
async getUser(@Param('id') id: number) {
  const user = await this.userService.findOne(id);
  // Transformar automáticamente
  return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
}
```

**Ventajas Implementadas:**
- ✅ Exclusión automática de campos sensibles
- ✅ Transformación de tipos complejos
- ✅ Serialización consistente
- ✅ Validación y transformación combinadas
- ✅ Respuestas API limpias y seguras

---

## 2.5.6 Tecnologías de Desarrollo y Herramientas

### TypeScript

**Definición:**
Superset de JavaScript que añade tipado estático, permitiendo detectar errores en tiempo de compilación.

**Fundamento Teórico:**
- **Tipado estático:** Validación de tipos en compilación
- **Interfaces:** Contratos para estructuras de datos
- **Genéricos:** Reutilización de código type-safe
- **Decoradores:** Metaprogramación

**Ventajas en CookSync:**
- ✅ Detección de errores temprana
- ✅ Autocompletado mejorado en IDE
- ✅ Documentación automática
- ✅ Refactorización segura
- ✅ Mejor mantenibilidad

---

### Git y GitHub

**Definición:**
Sistema de control de versiones distribuido y plataforma de colaboración para gestión del ciclo de vida del desarrollo.

**Fundamento Teórico:**
- **Control de versiones:** Historial de cambios
- **Ramas:** Desarrollo paralelo de features
- **Commits:** Snapshots del código
- **Pull Requests:** Revisión de código

**Workflow Implementado:**
```
main (producción)
  ↑
  ├─ develop (desarrollo)
  │   ├─ feature/auth
  │   ├─ feature/recipes
  │   ├─ feature/recommendations
  │   └─ bugfix/session-persistence
  │
  └─ hotfix/security-patch
```

**Ventajas Implementadas:**
- ✅ Historial completo de cambios
- ✅ Colaboración entre desarrolladores
- ✅ Revisión de código con PRs
- ✅ Rollback a versiones anteriores
- ✅ CI/CD integrado

---

### Jest (Testing Framework)

**Definición:**
Framework de testing para JavaScript/TypeScript que proporciona herramientas para escribir, ejecutar y reportar tests.

**Fundamento Teórico:**
- **Unit Tests:** Pruebas de funciones individuales
- **Integration Tests:** Pruebas de módulos integrados
- **Mocking:** Simulación de dependencias
- **Coverage:** Porcentaje de código testeado

**Configuración en CookSync:**
```typescript
// Ejemplo: Test de servicio de autenticación
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should hash password on registration', async () => {
    const dto = { email: 'test@test.com', password: 'password123' };
    
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: 1,
      email: dto.email,
      password: expect.any(String), // Hash
    });

    const result = await service.register(dto);
    
    expect(result.password).not.toBe(dto.password);
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
```

**Ventajas Implementadas:**
- ✅ Tests unitarios para servicios
- ✅ Tests de integración para endpoints
- ✅ Mocking de dependencias
- ✅ Coverage reports
- ✅ Integración con CI/CD

---

## 2.5.7 Patrones de Arquitectura Implementados

### Patrón MVC (Model-View-Controller)

**Definición:**
Patrón que separa la aplicación en tres componentes: Modelo (datos), Vista (presentación) y Controlador (lógica).

**Aplicación en CookSync:**
```
Backend (NestJS):
├─ Models (Prisma)      → Definición de tablas y relaciones
├─ Controllers          → Endpoints HTTP
├─ Services             → Lógica de negocio
└─ DTOs                 → Validación de entrada/salida

Frontend (React):
├─ Models (TypeScript)  → Interfaces de datos
├─ Components           → Presentación (JSX)
├─ Services             → Lógica de negocio
└─ Hooks                → Lógica reutilizable
```

---

### Patrón Repository

**Definición:**
Patrón que abstrae el acceso a datos, permitiendo cambiar la fuente de datos sin afectar la lógica de negocio.

**Aplicación en CookSync:**
```typescript
// Interfaz del repositorio
interface IRecipeRepository {
  findAll(): Promise<Recipe[]>;
  findById(id: number): Promise<Recipe>;
  create(data: CreateRecipeDto): Promise<Recipe>;
  update(id: number, data: UpdateRecipeDto): Promise<Recipe>;
  delete(id: number): Promise<void>;
}

// Implementación con Prisma
@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      include: { categoria: true, ingredientes: true }
    });
  }

  async findById(id: number): Promise<Recipe> {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: { categoria: true, ingredientes: true }
    });
  }

  // ... más métodos
}

// Uso en servicio
@Injectable()
export class RecipeService {
  constructor(private recipeRepository: RecipeRepository) {}

  async getAllRecipes(): Promise<Recipe[]> {
    return this.recipeRepository.findAll();
  }
}
```

---

### Patrón Dependency Injection

**Definición:**
Patrón que proporciona las dependencias de una clase en lugar de que la clase las cree.

**Aplicación en CookSync:**
```typescript
// Sin Dependency Injection (acoplado)
export class RecipeService {
  private prisma = new PrismaService(); // Acoplado
  
  async getRecipes() {
    return this.prisma.recipe.findMany();
  }
}

// Con Dependency Injection (desacoplado)
@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {} // Inyectado
  
  async getRecipes() {
    return this.prisma.recipe.findMany();
  }
}

// NestJS inyecta automáticamente
@Module({
  providers: [RecipeService, PrismaService],
})
export class RecipeModule {}
```

**Ventajas:**
- ✅ Desacoplamiento de dependencias
- ✅ Testing más fácil (mocking)
- ✅ Reutilización de código
- ✅ Mantenibilidad mejorada

---

## 2.5.8 Principios SOLID Aplicados

### Single Responsibility Principle (SRP)

Cada clase debe tener una única responsabilidad.

**Aplicación:**
```typescript
// ❌ Mal: Múltiples responsabilidades
export class RecipeService {
  async getRecipes() { /* ... */ }
  async validateRecipe() { /* ... */ }
  async sendEmail() { /* ... */ }
  async generatePDF() { /* ... */ }
}

// ✅ Bien: Una responsabilidad por clase
export class RecipeService {
  async getRecipes() { /* ... */ }
}

export class RecipeValidationService {
  async validateRecipe() { /* ... */ }
}

export class EmailService {
  async sendEmail() { /* ... */ }
}

export class PDFService {
  async generatePDF() { /* ... */ }
}
```

---

### Open/Closed Principle (OCP)

Las clases deben estar abiertas para extensión pero cerradas para modificación.

**Aplicación:**
```typescript
// ❌ Mal: Modificar para agregar nuevas estrategias
export class RecommendationService {
  getRecommendations(type: string) {
    if (type === 'collaborative') {
      // lógica colaborativa
    } else if (type === 'content') {
      // lógica de contenido
    } else if (type === 'hybrid') {
      // lógica híbrida
    }
  }
}

// ✅ Bien: Extensible sin modificación
interface RecommendationStrategy {
  getRecommendations(userId: number): Promise<Recipe[]>;
}

export class CollaborativeStrategy implements RecommendationStrategy {
  async getRecommendations(userId: number) { /* ... */ }
}

export class ContentStrategy implements RecommendationStrategy {
  async getRecommendations(userId: number) { /* ... */ }
}

export class RecommendationService {
  constructor(private strategy: RecommendationStrategy) {}
  
  async getRecommendations(userId: number) {
    return this.strategy.getRecommendations(userId);
  }
}
```

---

### Liskov Substitution Principle (LSP)

Los objetos de una clase derivada deben poder sustituir objetos de la clase base.

**Aplicación:**
```typescript
// Interfaz base
interface UserRepository {
  findById(id: number): Promise<User>;
  create(user: User): Promise<User>;
}

// Implementaciones intercambiables
export class PrismaUserRepository implements UserRepository {
  async findById(id: number) { /* ... */ }
  async create(user: User) { /* ... */ }
}

export class MongoUserRepository implements UserRepository {
  async findById(id: number) { /* ... */ }
  async create(user: User) { /* ... */ }
}

// Ambas son intercambiables
const repository: UserRepository = 
  process.env.DB === 'prisma' 
    ? new PrismaUserRepository()
    : new MongoUserRepository();
```

---

### Interface Segregation Principle (ISP)

Los clientes no deben depender de interfaces que no usan.

**Aplicación:**
```typescript
// ❌ Mal: Interfaz muy grande
interface UserService {
  getUser(): Promise<User>;
  updateUser(): Promise<User>;
  deleteUser(): Promise<void>;
  sendEmail(): Promise<void>;
  generateReport(): Promise<Report>;
}

// ✅ Bien: Interfaces segregadas
interface IUserRepository {
  getUser(): Promise<User>;
  updateUser(): Promise<User>;
  deleteUser(): Promise<void>;
}

interface IEmailService {
  sendEmail(): Promise<void>;
}

interface IReportService {
  generateReport(): Promise<Report>;
}

export class UserService implements IUserRepository {
  async getUser() { /* ... */ }
  async updateUser() { /* ... */ }
  async deleteUser() { /* ... */ }
}
```

---

### Dependency Inversion Principle (DIP)

Las clases de alto nivel no deben depender de clases de bajo nivel. Ambas deben depender de abstracciones.

**Aplicación:**
```typescript
// ❌ Mal: Dependencia de implementación concreta
export class RecipeService {
  constructor(private prisma: PrismaService) {}
}

// ✅ Bien: Dependencia de abstracción
interface IRecipeRepository {
  findAll(): Promise<Recipe[]>;
}

export class RecipeService {
  constructor(private repository: IRecipeRepository) {}
}

// Implementación puede cambiar sin afectar RecipeService
export class PrismaRecipeRepository implements IRecipeRepository {
  async findAll() { /* ... */ }
}
```

---

## 2.5.9 Conclusión del Marco Teórico

El proyecto CookSync implementa un conjunto coherente de teorías, tecnologías y patrones que garantizan:

1. **Escalabilidad:** Arquitectura modular que permite crecer sin limitaciones
2. **Mantenibilidad:** Código limpio, bien organizado y fácil de modificar
3. **Seguridad:** Autenticación robusta, validación de datos y protección de contraseñas
4. **Rendimiento:** Caché inteligente, índices optimizados y búsqueda rápida
5. **Experiencia de Usuario:** Interfaz intuitiva, responsive y con feedback en tiempo real
6. **Confiabilidad:** Testing, transacciones ACID y manejo de errores robusto

Esta combinación de fundamentos teóricos sólidos y tecnologías modernas posiciona a CookSync como una plataforma robusta, escalable y lista para producción.

---

**Fin del Marco Teórico y Conceptual**

**Total de páginas:** ~25 páginas
**Tecnologías documentadas:** 20+
**Patrones implementados:** 4
**Principios SOLID:** 5
