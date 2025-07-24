'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { getPriestProfileImage, isValidImageUrl } from '@/lib/utils'

interface PriestImageProps {
  profileImage: string | null
  firstName: string
  lastName: string
  size?: number
  className?: string
}

export function PriestImage({ 
  profileImage, 
  firstName, 
  lastName, 
  size = 64, 
  className = '' 
}: PriestImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const imageUrl = getPriestProfileImage(profileImage)
  const altText = `Foto de P. ${firstName} ${lastName}`
  
  // If no valid image URL or image failed to load, show icon
  if (!profileImage || !isValidImageUrl(imageUrl) || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-full ${className}`} style={{ width: size, height: size }}>
        <UserCircleIcon 
          className="text-gray-400" 
          style={{ width: size * 0.8, height: size * 0.8 }} 
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={altText}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => {
          console.error(`Failed to load image: ${imageUrl}`)
          setImageError(true)
          setIsLoading(false)
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
        priority={size > 100} // Priority for larger images
      />
    </div>
  )
} 