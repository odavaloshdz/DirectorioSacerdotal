/**
 * Calcula el tiempo transcurrido desde la ordenación
 * @param ordainedDate - Fecha de ordenación
 * @returns Cadena con el tiempo transcurrido (ej: "5 años, 3 meses")
 */
export function calculateOrdinationTime(ordainedDate: string | null): string {
  if (!ordainedDate) return 'Fecha no especificada'
  
  const today = new Date()
  const ordination = new Date(ordainedDate)
  const years = today.getFullYear() - ordination.getFullYear()
  const months = today.getMonth() - ordination.getMonth()
  
  let totalYears = years
  if (months < 0) {
    totalYears -= 1
  }
  
  if (totalYears === 0) {
    return 'Menos de un año'
  } else if (totalYears === 1) {
    return '1 año'
  } else {
    return `${totalYears} años`
  }
}

/**
 * Formatea el nombre completo del sacerdote con título
 */
export function formatPriestName(firstName: string, lastName: string): string {
  return `P. ${firstName} ${lastName}`
}

/**
 * Parsea las especialidades desde string a array
 */
export function parseSpecialties(specialties: string | null): string[] {
  if (!specialties) return []
  
  try {
    // Try parsing as JSON first (new format)
    return JSON.parse(specialties)
  } catch {
    // Fallback to comma-separated string (old format)
    return specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }
}

/**
 * Obtiene la URL de la imagen de perfil o una imagen por defecto
 * Maneja tanto URLs de Cloudinary como archivos locales
 */
export function getPriestProfileImage(profileImage: string | null): string {
  // If no image, return default
  if (!profileImage) {
    return '/images/default-priest.svg'
  }
  
  // If it's already a full URL (Cloudinary), return as is
  if (profileImage.startsWith('http')) {
    return profileImage
  }
  
  // If it's a local path (legacy), return as is
  if (profileImage.startsWith('/')) {
    return profileImage
  }
  
  // Fallback to default
  return '/images/default-priest.svg'
}

/**
 * Verifica si una URL de imagen es válida
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) return true
  
  // Check if it's a valid local path
  if (url.startsWith('/') && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.webp') || url.includes('.svg'))) {
    return true
  }
  
  return false
} 