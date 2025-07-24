import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function saveProfileImage(file: File, userId: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`
    
    // Save to public/uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadsDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // Return the public URL path
    return `/uploads/${fileName}`
  } catch (error) {
    console.error('Error saving profile image:', error)
    throw new Error('Error al guardar la imagen de perfil')
  }
} 