# 📖 Directorio Sacerdotal - Diócesis de San Juan de los Lagos

Sistema completo de gestión y directorio de sacerdotes desarrollado con Next.js 14, TypeScript, Prisma ORM y Tailwind CSS.

## 🚀 Características Principales

### 👥 **Gestión de Usuarios**
- ✅ Sistema de autenticación completo con NextAuth.js
- ✅ Roles diferenciados: Usuario, Sacerdote, Administrador
- ✅ Registro y aprobación de sacerdotes
- ✅ Gestión de perfiles con imágenes

### 🏛️ **Panel de Administración**
- ✅ **Gestión de Sacerdotes**: CRUD completo con aprobación/rechazo
- ✅ **Gestión de Catálogos**: Ciudades, Parroquias y Especialidades
- ✅ **Gestión de Sugerencias**: Revisión y aprobación de cambios
- ✅ **Dashboard con Estadísticas**: Métricas en tiempo real

### 📋 **Directorio Público**
- ✅ Listado público de sacerdotes aprobados
- ✅ Búsqueda por nombre, parroquia y especialidades
- ✅ Información detallada de cada sacerdote
- ✅ Tiempo de ordenación calculado automáticamente

### 💬 **Sistema de Sugerencias**
- ✅ Sacerdotes pueden sugerir cambios en su perfil
- ✅ Administradores revisan y aprueban/rechazan
- ✅ Historial completo de sugerencias
- ✅ Notificaciones visuales para administradores

## 🛠️ **Tecnologías Utilizadas**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Deployment**: Vercel

## 🚀 **Deployment en Producción**

### Requisitos Previos
- Cuenta en Vercel
- Base de datos PostgreSQL (Vercel Postgres, Neon, Supabase, etc.)

### Variables de Entorno Requeridas
```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DIRECT_URL=postgresql://username:password@host:port/database?sslmode=require
NEXTAUTH_SECRET=tu-secreto-de-32-caracteres-minimo
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### Pasos de Deployment
1. Configurar variables de entorno en Vercel
2. Conectar repositorio de GitHub
3. Configurar Node.js version 22.x
4. Deploy automático
5. Ejecutar setup de producción: `/api/setup-production`

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

## 👨‍💻 **Desarrollo Local**

### Instalación
```bash
git clone https://github.com/tu-usuario/DirectorioSacerdotal.git
cd DirectorioSacerdotal
npm install
```

### Configuración
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### Base de Datos
```bash
npm run db:push
npm run setup:all
```

### Desarrollo
```bash
npm run dev
```

## 📊 **Credenciales de Acceso**

### Desarrollo
- **Admin**: `admin@diocesisdesanjuan.org` / `admin123`

### Producción
- **Admin**: `admin@diocesisdesanjuan.org` / `Admin123!`
- ⚠️ **Cambiar contraseña inmediatamente después del primer login**

## 📁 **Estructura del Proyecto**

```
DirectorioSacerdotal/
├── app/                    # App Router de Next.js 14
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── directorio/        # Directorio público
│   └── profile/           # Perfil de sacerdotes
├── components/            # Componentes reutilizables
│   └── admin/            # Componentes del panel admin
├── lib/                   # Utilidades y configuraciones
├── prisma/               # Schema y configuración de BD
├── public/               # Archivos estáticos
└── scripts/              # Scripts de configuración
```

## 🔧 **Scripts Disponibles**

```bash
npm run dev          # Desarrollo local
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con BD
npm run db:studio    # Prisma Studio
npm run setup:production  # Setup inicial de producción
```

## 📝 **Funcionalidades Detalladas**

### Para Administradores
- ✅ Aprobar/rechazar registro de sacerdotes
- ✅ Gestión completa de sacerdotes (CRUD)
- ✅ Administrar catálogos (ciudades, parroquias, especialidades)
- ✅ Revisar y procesar sugerencias de cambios
- ✅ Dashboard con estadísticas y métricas

### Para Sacerdotes
- ✅ Registro con validación administrativa
- ✅ Perfil personal con imagen y datos completos
- ✅ Envío de sugerencias de cambios
- ✅ Seguimiento del estado de sugerencias
- ✅ Acceso al directorio de colegas

### Para Visitantes
- ✅ Directorio público de sacerdotes
- ✅ Búsqueda y filtros avanzados
- ✅ Información de contacto y especialidades
- ✅ Interfaz responsive y accesible

## 📱 **Responsive Design**

- ✅ Optimizado para móviles, tablets y escritorio
- ✅ Interfaz adaptativa con Tailwind CSS
- ✅ Experiencia de usuario consistente
- ✅ Accesibilidad web implementada

## 🔒 **Seguridad**

- ✅ Autenticación JWT con NextAuth.js
- ✅ Protección de rutas por roles
- ✅ Validación de datos en frontend y backend
- ✅ Headers de seguridad configurados
- ✅ Sanitización de inputs

## 📈 **Performance**

- ✅ Server-Side Rendering (SSR)
- ✅ Optimización de imágenes con Next.js
- ✅ Lazy loading de componentes
- ✅ Caching estratégico
- ✅ Bundle splitting automático

## 🌐 **Deploy Status**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/DirectorioSacerdotal)

## 📄 **Licencia**

Este proyecto está desarrollado para la Diócesis de San Juan de los Lagos.

## 🤝 **Contribuciones**

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Ejecuta las pruebas
5. Envía un Pull Request

## 📞 **Soporte**

Para soporte técnico o consultas:
- Email: soporte@diocesisdesanjuan.org
- Documentación: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Desarrollado con ❤️ para la Diócesis de San Juan de los Lagos** 