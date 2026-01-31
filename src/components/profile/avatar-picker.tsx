'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import {
  MALE_AVATARS,
  FEMALE_AVATARS,
  NEUTRAL_AVATARS,
  CATEGORY_LABELS,
  getAvatarPath,
  type AvatarCategory,
  type AvatarOption
} from '@/lib/avatars'

interface AvatarPickerProps {
  currentAvatar: string | null
  isOpen: boolean
  onClose: () => void
  onSelect: (avatarId: string) => Promise<void>
}

export function AvatarPicker({ currentAvatar, isOpen, onClose, onSelect }: AvatarPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory>('male')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  if (!isOpen) return null

  const categories: AvatarCategory[] = ['male', 'female', 'neutral']

  const getAvatarsForCategory = (category: AvatarCategory): AvatarOption[] => {
    switch (category) {
      case 'male': return MALE_AVATARS
      case 'female': return FEMALE_AVATARS
      case 'neutral': return NEUTRAL_AVATARS
    }
  }

  const handleSelect = async (avatarId: string) => {
    setSelectedAvatar(avatarId)
    setIsLoading(true)
    try {
      await onSelect(avatarId)
      onClose()
    } catch (error) {
      console.error('Failed to save avatar:', error)
    } finally {
      setIsLoading(false)
      setSelectedAvatar(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Escolha seu Avatar</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-4 gap-3">
            {getAvatarsForCategory(selectedCategory).map((avatar) => {
              const isCurrentAvatar = currentAvatar === avatar.id
              const isSelected = selectedAvatar === avatar.id

              return (
                <button
                  key={avatar.id}
                  onClick={() => handleSelect(avatar.id)}
                  disabled={isLoading}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden
                    border-2 transition-all
                    ${isCurrentAvatar
                      ? 'border-green-500 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100'
                    }
                    ${isLoading && isSelected ? 'opacity-75' : ''}
                    disabled:cursor-not-allowed
                  `}
                >
                  <Image
                    src={getAvatarPath(avatar.id)}
                    alt={`Avatar ${avatar.id}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {/* Current avatar indicator */}
                  {isCurrentAvatar && (
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoading && isSelected && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
