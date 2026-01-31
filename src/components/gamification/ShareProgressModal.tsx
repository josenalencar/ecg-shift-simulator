'use client'

import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import {
  Download,
  X,
  Copy,
  Check,
  Star,
  Flame,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Social media icons as simple SVG components
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

interface ShareProgressModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  stats: {
    level: number
    totalXp: number
    currentStreak: number
    longestStreak: number
    ecgsCompleted: number
    perfectScores: number
    rank: number | null
    percentile: number
  }
}

const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGOG.png'

export function ShareProgressModal({
  isOpen,
  onClose,
  userName,
  stats,
}: ShareProgressModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copying, setCopying] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'square' | 'story' | null>(null)

  // Generate image from the card
  const generateImage = useCallback(async (format: 'square' | 'story') => {
    if (!cardRef.current) return

    setDownloading(true)
    setDownloadFormat(format)

    try {
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      })

      // Download the image
      const link = document.createElement('a')
      link.download = `plantao-ecg-progresso-${format}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setDownloading(false)
      setDownloadFormat(null)
    }
  }, [])

  // Share to Twitter/X
  const shareToTwitter = useCallback(() => {
    const text = `Treinando interpretacao de ECG no @PlantaoECG!
Level ${stats.level} | ${stats.totalXp.toLocaleString()} XP
${stats.currentStreak} dias de streak
${stats.ecgsCompleted} ECGs interpretados

#PlantaoECG #ECG #Medicina`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }, [stats])

  // Share to WhatsApp
  const shareToWhatsApp = useCallback(() => {
    const text = `Estou no Level ${stats.level} no Plantao ECG!
${stats.totalXp.toLocaleString()} XP | ${stats.currentStreak} dias de streak
Ja interpretei ${stats.ecgsCompleted} ECGs!
Treine tambem: https://plantaoecg.com.br`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }, [stats])

  // Share to LinkedIn
  const shareToLinkedIn = useCallback(() => {
    const url = 'https://plantaoecg.com.br'
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }, [])

  // Copy stats to clipboard
  const copyToClipboard = useCallback(async () => {
    const text = `Meu progresso no Plantao ECG:
Level ${stats.level} | ${stats.totalXp.toLocaleString()} XP
Streak: ${stats.currentStreak} dias
ECGs: ${stats.ecgsCompleted} interpretados
Perfeitos: ${stats.perfectScores}
https://plantaoecg.com.br`
    await navigator.clipboard.writeText(text)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }, [stats])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Compartilhar Progresso</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">Preview do card:</p>
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white"
            style={{ aspectRatio: downloadFormat === 'story' ? '9/16' : '1/1' }}
          >
            {/* Logo */}
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Plantao ECG" className="h-12" />
            </div>

            {/* User name */}
            <h2 className="text-xl font-bold mb-1">{userName || 'Doutor(a)'}</h2>
            <p className="text-blue-200 text-sm mb-6">Treinando no Plantao ECG</p>

            {/* Level badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-4xl font-bold">{stats.level}</div>
              <div className="text-blue-200 text-sm">LEVEL</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-300" />
                <div className="text-lg font-bold">{stats.totalXp.toLocaleString()}</div>
                <div className="text-xs text-blue-200">XP Total</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Flame className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                <div className="text-lg font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-blue-200">Dias Streak</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
                <div className="text-lg font-bold">{stats.ecgsCompleted}</div>
                <div className="text-xs text-blue-200">ECGs</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                <div className="text-lg font-bold">{stats.perfectScores}</div>
                <div className="text-xs text-blue-200">Perfeitos</div>
              </div>
            </div>

            {/* Ranking */}
            {stats.rank && (
              <div className="text-center text-blue-200 text-sm mb-4">
                Top {stats.percentile.toFixed(1)}% dos usuarios
              </div>
            )}

            {/* URL */}
            <div className="text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm font-medium">
                plantaoecg.com.br
              </span>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 mb-2">Baixar imagem:</p>
          <div className="flex gap-2">
            <Button
              onClick={() => generateImage('square')}
              variant="outline"
              className="flex-1"
              disabled={downloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading && downloadFormat === 'square' ? 'Gerando...' : 'Post (1:1)'}
            </Button>
            <Button
              onClick={() => generateImage('story')}
              variant="outline"
              className="flex-1"
              disabled={downloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading && downloadFormat === 'story' ? 'Gerando...' : 'Story (9:16)'}
            </Button>
          </div>
        </div>

        {/* Social Share */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 mb-2">Compartilhar em:</p>
          <div className="flex gap-2">
            <Button
              onClick={shareToTwitter}
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              title="Twitter/X"
            >
              <TwitterIcon />
            </Button>
            <Button
              onClick={shareToWhatsApp}
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              title="WhatsApp"
            >
              <WhatsAppIcon />
            </Button>
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              title="LinkedIn"
            >
              <LinkedInIcon />
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex-1 h-10"
              title="Copiar texto"
            >
              {copying ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 pt-0">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ShareProgressModal
