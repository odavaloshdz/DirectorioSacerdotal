import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Iniciando reset completo de base de datos...')
    
    // First, test connection
    await prisma.$connect()
    console.log('✅ Conexión a PostgreSQL establecida')
    
    console.log('🗑️ Eliminando tablas existentes...')
    
    // Drop all tables and types (in reverse order of dependencies)
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "profileSuggestions" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "priest_specialties" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "priestSpecialties" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "priests" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "parishes" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "specialties" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "cities" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "sessions" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "accounts" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "verification_tokens" CASCADE;`
      await prisma.$executeRaw`DROP TABLE IF EXISTS "users" CASCADE;`
      
      // Drop enums
      await prisma.$executeRaw`DROP TYPE IF EXISTS "SuggestionStatus" CASCADE;`
      await prisma.$executeRaw`DROP TYPE IF EXISTS "PriestStatus" CASCADE;`
      await prisma.$executeRaw`DROP TYPE IF EXISTS "Role" CASCADE;`
    } catch (e) {
      console.log('Algunas tablas no existían, continuando...')
    }
    
    console.log('📋 Creando tipos de datos...')
    
    // Create enum types
    await prisma.$executeRaw`
      CREATE TYPE "Role" AS ENUM ('USER', 'PRIEST', 'ADMIN');
    `
    
    await prisma.$executeRaw`
      CREATE TYPE "PriestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    `
    
    await prisma.$executeRaw`
      CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    `
    
    console.log('📋 Creando tablas...')
    
    // Create tables with correct schema
    await prisma.$executeRaw`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "password" TEXT,
        "image" TEXT,
        "role" "Role" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "cities" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "parishes" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "cityId" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "parishes_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "specialties" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "priests" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "ordainedDate" TIMESTAMP(3),
        "parishId" TEXT,
        "phone" TEXT,
        "biography" TEXT,
        "profileImage" TEXT,
        "status" "PriestStatus" NOT NULL DEFAULT 'PENDING',
        "approvedAt" TIMESTAMP(3),
        "approvedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "priests_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "priest_specialties" (
        "id" TEXT NOT NULL,
        "priestId" TEXT NOT NULL,
        "specialtyId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "priest_specialties_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE "profileSuggestions" (
        "id" TEXT NOT NULL,
        "priestId" TEXT NOT NULL,
        "field" TEXT NOT NULL,
        "currentValue" TEXT,
        "suggestedValue" TEXT NOT NULL,
        "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "profileSuggestions_pkey" PRIMARY KEY ("id")
      );
    `
    
    console.log('📋 Creando índices...')
    
    // Create unique indexes
    await prisma.$executeRaw`CREATE UNIQUE INDEX "users_email_key" ON "users"("email");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "priests_userId_key" ON "priests"("userId");`
    await prisma.$executeRaw`CREATE UNIQUE INDEX "priest_specialties_priestId_specialtyId_key" ON "priest_specialties"("priestId", "specialtyId");`
    
    console.log('📋 Creando relaciones...')
    
    // Create foreign key constraints
    await prisma.$executeRaw`ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "parishes" ADD CONSTRAINT "parishes_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "priests" ADD CONSTRAINT "priests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "priests" ADD CONSTRAINT "priests_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "priest_specialties" ADD CONSTRAINT "priest_specialties_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "priest_specialties" ADD CONSTRAINT "priest_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "profileSuggestions" ADD CONSTRAINT "profileSuggestions_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
    await prisma.$executeRaw`ALTER TABLE "profileSuggestions" ADD CONSTRAINT "profileSuggestions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;`
    
    // Test that tables were created correctly
    await prisma.user.findFirst()
    console.log('✅ Verificación de tablas exitosa')
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos reinicializada correctamente',
      details: 'Todas las tablas han sido eliminadas y recreadas con el schema correcto. Ahora puedes ejecutar /api/setup-production'
    })
    
  } catch (error: any) {
    console.error('❌ Error al reinicializar base de datos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al reinicializar la base de datos',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 