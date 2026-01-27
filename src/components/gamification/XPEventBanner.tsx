'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveEvent } from '@/lib/gamification'
import type { XPEvent } from '@/types/database'
import { Sparkles, Clock } from 'lucide-react'

interface XPEventBannerProps {
  userId: string
}

function formatTimeRemaining(endAt: string): string {
  const end = new Date(endAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Encerrado'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h restantes`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m restantes`
  }

  return `${minutes}m restantes`
}

export function XPEventBanner({ userId }: XPEventBannerProps) {
  const [event, setEvent] = useState<XPEvent | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    async function loadEvent() {
      const supabase = createClient()
      const activeEvent = await getActiveEvent(userId, supabase)
      setEvent(activeEvent)

      if (activeEvent) {
        setTimeRemaining(formatTimeRemaining(activeEvent.end_at))
      }
    }

    loadEvent()

    // Update time remaining every minute
    const interval = setInterval(() => {
      if (event) {
        setTimeRemaining(formatTimeRemaining(event.end_at))
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [userId, event?.end_at])

  if (!event) return null

  const is3x = event.multiplier_type === '3x'

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg p-4 mb-6
        ${is3x
          ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }
      `}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full animate-ping" />
        <div className="absolute top-4 right-20 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-150" />
        <div className="absolute bottom-3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-300" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">
              Evento {event.multiplier_type} XP Ativo!
            </p>
            <p className="text-white/80 text-sm">
              {event.description || `Todos os ECGs valem ${event.multiplier_type} XP!`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
          <Clock className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-medium">{timeRemaining}</span>
        </div>
      </div>
    </div>
  )
}

export default XPEventBanner
