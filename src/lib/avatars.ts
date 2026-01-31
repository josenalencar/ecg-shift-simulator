/**
 * Avatar system constants and utilities
 * 24 diverse avatars organized in 3 pages
 */

export type AvatarCategory = 'male' | 'female' | 'neutral'

export interface AvatarOption {
  id: string
  category: AvatarCategory
}

// Page 1 avatars (8) - alternating male/female
export const MALE_AVATARS: AvatarOption[] = [
  { id: 'm1', category: 'male' },
  { id: 'f1', category: 'male' },
  { id: 'm2', category: 'male' },
  { id: 'f2', category: 'male' },
  { id: 'm3', category: 'male' },
  { id: 'f3', category: 'male' },
  { id: 'm4', category: 'male' },
  { id: 'f4', category: 'male' },
]

// Page 2 avatars (8) - alternating male/female
export const FEMALE_AVATARS: AvatarOption[] = [
  { id: 'm5', category: 'female' },
  { id: 'f5', category: 'female' },
  { id: 'm6', category: 'female' },
  { id: 'f6', category: 'female' },
  { id: 'm7', category: 'female' },
  { id: 'f7', category: 'female' },
  { id: 'm8', category: 'female' },
  { id: 'f8', category: 'female' },
]

// Page 3 avatars (8) - neutral/other
export const NEUTRAL_AVATARS: AvatarOption[] = [
  { id: 'n1', category: 'neutral' },
  { id: 'n2', category: 'neutral' },
  { id: 'n3', category: 'neutral' },
  { id: 'n4', category: 'neutral' },
  { id: 'n5', category: 'neutral' },
  { id: 'n6', category: 'neutral' },
  { id: 'n7', category: 'neutral' },
  { id: 'n8', category: 'neutral' },
]

// All avatars combined
export const ALL_AVATARS: AvatarOption[] = [
  ...MALE_AVATARS,
  ...FEMALE_AVATARS,
  ...NEUTRAL_AVATARS,
]

// Default avatar for new users
export const DEFAULT_AVATAR = 'n1'

// Valid avatar IDs for validation
export const VALID_AVATAR_IDS = ALL_AVATARS.map(a => a.id)

/**
 * Get the image path for an avatar ID
 * Note: Using SVG placeholders initially - can be replaced with PNG later
 */
export function getAvatarPath(avatarId: string | null | undefined): string {
  const id = avatarId && VALID_AVATAR_IDS.includes(avatarId) ? avatarId : DEFAULT_AVATAR
  return `/avatars/${id}.svg`
}

/**
 * Validate if an avatar ID is valid
 */
export function isValidAvatarId(avatarId: string): boolean {
  return VALID_AVATAR_IDS.includes(avatarId)
}

/**
 * Get avatars by category
 */
export function getAvatarsByCategory(category: AvatarCategory): AvatarOption[] {
  switch (category) {
    case 'male':
      return MALE_AVATARS
    case 'female':
      return FEMALE_AVATARS
    case 'neutral':
      return NEUTRAL_AVATARS
  }
}

// Category labels in Portuguese
export const CATEGORY_LABELS: Record<AvatarCategory, string> = {
  male: 'Página 1',
  female: 'Página 2',
  neutral: 'Página 3',
}
