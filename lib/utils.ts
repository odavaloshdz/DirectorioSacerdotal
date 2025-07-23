/**
 * Calcula el tiempo transcurrido desde la ordenación
 * @param ordainedDate - Fecha de ordenación
 * @returns Cadena con el tiempo transcurrido (ej: "5 años, 3 meses")
 */
export function calculateOrdinationTime(ordainedDate: Date | string | null): string {
  if (!ordainedDate) return 'No especificado'
  
  const ordained = new Date(ordainedDate)
  const now = new Date()
  
  if (ordained > now) return 'Fecha futura'
  
  const diffTime = Math.abs(now.getTime() - ordained.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  
  if (years === 0 && months === 0) {
    return 'Menos de un mes'
  }
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`
  }
  
  return `${years} ${years === 1 ? 'año' : 'años'}, ${months} ${months === 1 ? 'mes' : 'meses'}`
}

/**
 * Formatea el nombre completo de un sacerdote
 */
export function formatPriestName(firstName: string, lastName: string): string {
  return `P. ${firstName} ${lastName}`
}

/**
 * Obtiene la URL de la imagen de perfil o una imagen por defecto
 */
export function getPriestProfileImage(profileImage: string | null): string {
  return profileImage || '/images/default-priest.svg'
}

/**
 * Parsea las especialidades desde JSON string
 */
export function parseSpecialties(specialties: string | null): string[] {
  if (!specialties) return []
  try {
    return JSON.parse(specialties)
  } catch {
    return []
  }
} 