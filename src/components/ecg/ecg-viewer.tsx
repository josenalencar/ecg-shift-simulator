'use client'

import { useState, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface ECGViewerProps {
  imageUrl: string
  title?: string
}

export function ECGViewer({ imageUrl, title }: ECGViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function toggleFullscreen() {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`
        relative bg-white rounded-lg border border-gray-200 overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
      `}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => zoomIn()}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => zoomOut()}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => resetTransform()}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Title */}
            {title && (
              <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded-lg shadow">
                <span className="font-medium text-gray-900">{title}</span>
              </div>
            )}

            {/* Image */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: isFullscreen ? '100vh' : '500px',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={imageUrl}
                alt={title || 'ECG'}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </TransformComponent>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">
              Scroll to zoom • Drag to pan
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
