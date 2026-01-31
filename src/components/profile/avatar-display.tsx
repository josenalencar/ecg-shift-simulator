'use client'

import Image from 'next/image'
import { User } from 'lucide-react'
import { getAvatarPath, DEFAULT_AVATAR } from '@/lib/avatars'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarDisplayProps {
  avatarId: string | null | undefined
  size?: AvatarSize
  className?: string
  onClick?: () => void
  showEditHint?: boolean
}

const sizeConfig: Record<AvatarSize, { container: string; icon: string; pixels: number }> = {
  xs: { container: 'w-6 h-6', icon: 'h-3 w-3', pixels: 24 },
  sm: { container: 'w-8 h-8', icon: 'h-4 w-4', pixels: 32 },
  md: { container: 'w-10 h-10', icon: 'h-5 w-5', pixels: 40 },
  lg: { container: 'w-14 h-14', icon: 'h-7 w-7', pixels: 56 },
  xl: { container: 'w-20 h-20', icon: 'h-10 w-10', pixels: 80 },
}

export function AvatarDisplay({
  avatarId,
  size = 'md',
  className = '',
  onClick,
  showEditHint = false
}: AvatarDisplayProps) {
  const config = sizeConfig[size]
  const hasAvatar = avatarId && avatarId !== DEFAULT_AVATAR && avatarId !== 'user'
  const imagePath = getAvatarPath(avatarId)

  const containerClasses = `
    ${config.container}
    rounded-full
    overflow-hidden
    flex items-center justify-center
    ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 transition-all' : ''}
    ${!hasAvatar ? 'bg-blue-100' : 'bg-gray-100'}
    ${className}
  `.trim()

  // If no custom avatar, show default icon
  if (!hasAvatar) {
    return (
      <div
        className={`${containerClasses} relative`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <User className={`${config.icon} text-blue-600`} />
        {showEditHint && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
            <span className="text-white text-xs">Editar</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`${containerClasses} relative`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <Image
        src={imagePath}
        alt="Avatar"
        width={config.pixels}
        height={config.pixels}
        className="object-cover w-full h-full"
        unoptimized
      />
      {showEditHint && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
          <span className="text-white text-xs font-medium">Editar</span>
        </div>
      )}
    </div>
  )
}
