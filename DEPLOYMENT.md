# 🚀 Guía de Deployment en Vercel

## Preparativos Previos

### 1. Configurar Base de Datos PostgreSQL

**Opción A: Vercel Postgres (Recomendado)**
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a la pestaña "Storage"
3. Crea una nueva base de datos Postgres
4. Copia las variables de entorno generadas

**Opción B: Neon, Supabase, u otro proveedor**
1. Crea una cuenta en [Neon](https://neon.tech) o [Supabase](https://supabase.com)
2. Crea una nueva base de datos PostgreSQL
3. Obtén la URL de conexión

### 2. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```bash
# Base de datos (PostgreSQL)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://username:password@hostname:port/database_name?sslmode=require
DIRECT_URL=postgresql://username:password@hostname:port/database_name?sslmode=require

# NextAuth
NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui-cambiar-en-produccion
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

**⚠️ IMPORTANTE:** 
- Usa un `NEXTAUTH_SECRET` único y seguro (genera uno en https://generate-secret.vercel.app/32)
- Reemplaza `tu-dominio.vercel.app` con tu dominio real de Vercel

## 🔧 Pasos de Deployment

### 1. Preparar el Repositorio

```bash
# Asegúrate de que todos los cambios estén commitados
git add .
git commit -m "🚀 Preparar para producción"
git push origin main
```

### 2. Configurar en Vercel

1. **Conectar Repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Conecta tu repositorio de GitHub

2. **Configurar Build:**
   - Framework Preset: `Next.js`
   - Node.js Version: `22.x`
   - Build Command: `npm run build`
   - Install Command: `npm install`

3. **Variables de Entorno:**
   - Agrega todas las variables mencionadas arriba
   - Marca como "Production" y "Preview"

### 3. Deploy Inicial

1. Click "Deploy" en Vercel
2. Espera a que termine el build
3. Una vez completado, ve a la URL de tu proyecto

### 4. Configurar Base de Datos

Ejecuta el setup de producción visitando:
```
https://tu-dominio.vercel.app/api/setup-production
```

O ejecuta manualmente desde Vercel CLI:
```bash
vercel env pull .env.local
npm run setup:production
```

## 🎯 Post-Deployment

### 1. Verificar Funcionalidad

1. **Login de Administrador:**
   - Ve a `https://tu-dominio.vercel.app/auth/signin`
   - Email: `admin@diocesisdesanjuan.org`
   - Contraseña: `Admin123!`
   - **¡CAMBIA LA CONTRASEÑA INMEDIATAMENTE!**

2. **Probar Funciones:**
   - ✅ Panel de administración
   - ✅ Gestión de sacerdotes
   - ✅ Gestión de catálogos
   - ✅ Gestión de sugerencias
   - ✅ Registro de sacerdotes
   - ✅ Directorio público

### 2. Configuraciones de Seguridad

1. **Cambiar Contraseña del Admin:**
   - Login como admin
   - Ve a configuración de perfil
   - Cambia la contraseña por una segura

2. **Verificar Variables de Entorno:**
   - Asegúrate de que `NEXTAUTH_SECRET` sea único
   - Verifica que las URLs sean correctas

## 🔍 Troubleshooting

### Error: "Database connection failed"
- Verifica las variables `DATABASE_URL` y `DIRECT_URL`
- Asegúrate de que la base de datos esté accesible
- Revisa que el proveedor permita conexiones externas

### Error: "NextAuth configuration error"
- Verifica `NEXTAUTH_SECRET` y `NEXTAUTH_URL`
- Asegúrate de que la URL sea exactamente tu dominio de Vercel

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Asegúrate de que Node.js version sea 22.x
- Verifica que `package.json` tenga `postinstall: prisma generate`

## 📊 Monitoreo

### Logs y Analytics
- Ve a Vercel Dashboard → Functions → View Function Logs
- Monitorea errores en tiempo real
- Configura alertas para errores críticos

### Base de Datos
- Usa Prisma Studio: `npx prisma studio`
- Monitorea performance de queries
- Configura backups automáticos

## 🔄 Updates Futuros

Para actualizar la aplicación:

```bash
git add .
git commit -m "✨ Nueva funcionalidad"
git push origin main
```

Vercel automáticamente:
1. Detecta el push
2. Ejecuta el build
3. Deploya la nueva versión
4. Actualiza el dominio

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Consulta la documentación de [Vercel](https://vercel.com/docs) y [Prisma](https://www.prisma.io/docs/)

---

**🎉 ¡Tu Directorio Sacerdotal está listo para producción!** 