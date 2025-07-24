import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Iniciando inicialización de base de datos...')
    
    // First, test connection
    await prisma.$connect()
    console.log('✅ Conexión a PostgreSQL establecida')
    
    console.log('📋 Creando tipos de datos...')
    
    // Create enum types one by one
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "Role" AS ENUM ('USER', 'PRIEST', 'ADMIN');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) { console.log('Role enum already exists') }
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "PriestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) { console.log('PriestStatus enum already exists') }
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) { console.log('SuggestionStatus enum already exists') }
    
    console.log('📋 Creando tablas...')
    
    // Create tables one by one
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
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
      CREATE TABLE IF NOT EXISTS "accounts" (
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
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "cities" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "parishes" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "cityId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "parishes_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "specialties" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "priests" (
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
      CREATE TABLE IF NOT EXISTS "priestSpecialties" (
        "id" TEXT NOT NULL,
        "priestId" TEXT NOT NULL,
        "specialtyId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "priestSpecialties_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "profileSuggestions" (
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
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `
    
    console.log('📋 Creando índices...')
    
    // Create indexes
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "priests_userId_key" ON "priests"("userId");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "priestSpecialties_priestId_specialtyId_key" ON "priestSpecialties"("priestId", "specialtyId");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");` } catch (e) {}
    try { await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");` } catch (e) {}
    
    console.log('📋 Creando relaciones...')
    
    // Create foreign keys
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "parishes" ADD CONSTRAINT "parishes_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "priests" ADD CONSTRAINT "priests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "priests" ADD CONSTRAINT "priests_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "priestSpecialties" ADD CONSTRAINT "priestSpecialties_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "priestSpecialties" ADD CONSTRAINT "priestSpecialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "profileSuggestions" ADD CONSTRAINT "profileSuggestions_priestId_fkey" FOREIGN KEY ("priestId") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          ALTER TABLE "profileSuggestions" ADD CONSTRAINT "profileSuggestions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    } catch (e) {}
    
    // Test that tables were created
    await prisma.user.findFirst()
    console.log('✅ Verificación de tablas exitosa')
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      details: 'Todas las tablas han sido creadas. Ahora puedes ejecutar /api/setup-production'
    })
    
  } catch (error: any) {
    console.error('❌ Error al inicializar base de datos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al inicializar la base de datos',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 