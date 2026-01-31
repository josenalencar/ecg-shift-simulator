'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Ruler, X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui'

interface ECGViewerProps {
  imageUrl: string
  title?: string
}

type CaliperMode = 'off' | 'calibrating' | 'measuring'

interface CaliperPoint {
  x: number      // percentage (0-100)
  y: number      // percentage (0-100)
  pixelX: number // pixel value at time of click (for measurement calc)
}

export function ECGViewer({ imageUrl, title }: ECGViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 500 })

  // Caliper state
  const [caliperMode, setCaliperMode] = useState<CaliperMode>('off')
  const [calibrationPoints, setCalibrationPoints] = useState<CaliperPoint[]>([])
  const [measurePoints, setMeasurePoints] = useState<CaliperPoint[]>([])
  const [pixelsPerMs, setPixelsPerMs] = useState<number | null>(null)
  const [currentScale, setCurrentScale] = useState(1)
  const [measurement, setMeasurement] = useState<number | null>(null)

  // Update container size when image loads or window resizes
  const updateContainerSize = useCallback(() => {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }
  }, [])

  useEffect(() => {
    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [updateContainerSize])

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

  function resetCaliper() {
    setCaliperMode('off')
    setCalibrationPoints([])
    setMeasurePoints([])
    setPixelsPerMs(null)
    setMeasurement(null)
  }

  function startCalibration() {
    setCaliperMode('calibrating')
    setCalibrationPoints([])
    setMeasurePoints([])
    setPixelsPerMs(null)
    setMeasurement(null)
  }

  const handleImageLoad = useCallback(() => {
    // Update container size after image loads
    setTimeout(updateContainerSize, 100)
  }, [updateContainerSize])

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (caliperMode === 'off') return

    // Get the image element's bounding rect
    const imgElement = imageRef.current
    if (!imgElement) return

    const imgRect = imgElement.getBoundingClientRect()

    // Calculate click position relative to image (in visual/screen pixels)
    const visualX = e.clientX - imgRect.left
    const visualY = e.clientY - imgRect.top

    // Convert to percentage of image dimensions (zoom-invariant)
    const xPercent = (visualX / imgRect.width) * 100
    const yPercent = (visualY / imgRect.height) * 100

    // Also store pixel value for measurement calculations
    const scale = transformRef.current?.state?.scale || 1
    const pixelX = visualX / scale

    if (caliperMode === 'calibrating') {
      const newPoints = [...calibrationPoints, { x: xPercent, y: yPercent, pixelX }]
      setCalibrationPoints(newPoints)

      if (newPoints.length === 2) {
        // Calculate pixels per 200ms using the pixel values
        const distance = Math.abs(newPoints[1].pixelX - newPoints[0].pixelX)
        const pxPerMs = distance / 200 // 200ms for 5mm big square
        setPixelsPerMs(pxPerMs)
        setCaliperMode('measuring')
        setMeasurePoints([])
        setMeasurement(null)
      }
    } else if (caliperMode === 'measuring' && pixelsPerMs) {
      const newPoints = [...measurePoints, { x: xPercent, y: yPercent, pixelX }]

      if (newPoints.length > 2) {
        // Reset measurement and start new one
        setMeasurePoints([{ x: xPercent, y: yPercent, pixelX }])
        setMeasurement(null)
      } else {
        setMeasurePoints(newPoints)

        if (newPoints.length === 2) {
          // Calculate measurement using pixel values
          const distance = Math.abs(newPoints[1].pixelX - newPoints[0].pixelX)
          const ms = distance / pixelsPerMs
          setMeasurement(Math.round(ms))
        }
      }
    }
  }, [caliperMode, calibrationPoints, measurePoints, pixelsPerMs])

  const handleTransform = useCallback((ref: ReactZoomPanPinchRef) => {
    const newScale = ref.state.scale
    // If scale changed significantly, reset everything (calibration + measurement)
    if (pixelsPerMs && Math.abs(newScale - currentScale) > 0.01) {
      resetCaliper()
    }
    setCurrentScale(newScale)
  }, [pixelsPerMs, currentScale])

  return (
    <div
      ref={containerRef}
      className={`
        relative bg-white rounded-lg border border-gray-200 overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
      `}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        onTransformed={handleTransform}
        panning={{ disabled: caliperMode !== 'off' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Help Tooltip */}
            {showHelp && (
              <div className="absolute top-16 right-4 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Como usar o Compasso</h4>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Clique no icone <Ruler className="inline h-4 w-4" /> para ativar</li>
                  <li><span className="text-red-600 font-medium">Calibracao (2 cliques):</span> Clique nas bordas de um quadradao (5mm = 200ms). Linhas verticais VERMELHAS aparecerao.</li>
                  <li><span className="text-blue-600 font-medium">Medicao (2 cliques):</span> Apos calibrar, clique em dois pontos para medir. Linhas verticais AZUIS aparecerao.</li>
                  <li>O resultado mostra o intervalo em ms e a FC correspondente.</li>
                  <li>Clique novamente para nova medicao (azul reinicia).</li>
                  <li>Zoom reseta tudo (vermelho e azul).</li>
                </ol>
                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {/* Help Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                title="Como usar"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              {/* Caliper Button */}
              <Button
                variant={caliperMode !== 'off' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => caliperMode === 'off' ? startCalibration() : resetCaliper()}
                title={caliperMode === 'off' ? 'Calibrar Compasso' : 'Desativar Compasso'}
                className={caliperMode !== 'off' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {caliperMode === 'off' ? (
                  <Ruler className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
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
                onClick={() => {
                  resetTransform()
                  resetCaliper()
                }}
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

            {/* Caliper Instructions */}
            {caliperMode !== 'off' && (
              <div className="absolute top-16 left-4 z-10 bg-white/95 px-4 py-2 rounded-lg shadow-lg max-w-xs border-l-4 border-l-green-500">
                {caliperMode === 'calibrating' && (
                  <div>
                    <p className="font-medium text-green-700 text-sm">Calibracao do Compasso</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {calibrationPoints.length === 0
                        ? 'Clique no INICIO de um quadradao (5mm = 200ms)'
                        : 'Agora clique no FIM do mesmo quadradao'}
                    </p>
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      Linhas verticais VERMELHAS marcam a calibracao
                    </p>
                    <div className="flex gap-1 mt-2">
                      <div className={`w-3 h-3 rounded-full ${calibrationPoints.length >= 1 ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <div className={`w-3 h-3 rounded-full ${calibrationPoints.length >= 2 ? 'bg-red-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                )}
                {caliperMode === 'measuring' && (
                  <div>
                    <p className="font-medium text-green-700 text-sm">Compasso Calibrado ✓</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {measurePoints.length === 0
                        ? 'Clique em dois pontos para medir'
                        : measurePoints.length === 1
                          ? 'Clique no segundo ponto'
                          : 'Clique para nova medicao'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      Linhas verticais AZUIS marcam a medicao
                    </p>
                    {measurement !== null && (
                      <div className="mt-2 p-2 bg-green-100 rounded">
                        <p className="text-lg font-bold text-green-800">{measurement} ms</p>
                        <p className="text-sm font-medium text-green-700">
                          FC: {Math.round(60000 / measurement)} bpm
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
              <div
                ref={imageContainerRef}
                onClick={handleImageClick}
                className={`${caliperMode !== 'off' ? 'cursor-crosshair' : ''}`}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={title || 'ECG'}
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                  onLoad={handleImageLoad}
                />

                {/* Calibration VERTICAL lines (RED) */}
                {caliperMode !== 'off' && calibrationPoints.map((point, i) => (
                  <div
                    key={`cal-vline-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: 0,
                      width: '1px',
                      height: '100%',
                      backgroundColor: '#ef4444',
                      pointerEvents: 'none',
                      zIndex: 50,
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}

                {/* Measurement VERTICAL lines (BLUE) */}
                {caliperMode === 'measuring' && measurePoints.map((point, i) => (
                  <div
                    key={`meas-vline-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: 0,
                      width: '1px',
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      pointerEvents: 'none',
                      zIndex: 50,
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}

                {/* Measurement label */}
                {caliperMode === 'measuring' && measurePoints.length === 2 && measurement !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(measurePoints[0].x + measurePoints[1].x) / 2}%`,
                      top: '20px',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      border: '2px solid #3b82f6',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      pointerEvents: 'none',
                      zIndex: 60,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '14px' }}>{measurement} ms</span>
                  </div>
                )}

                {/* Calibration Points (RED) */}
                {caliperMode !== 'off' && calibrationPoints.map((point, i) => (
                  <div
                    key={`cal-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      border: '1px solid white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                      zIndex: 60,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}

                {/* Measurement Points (BLUE) */}
                {caliperMode === 'measuring' && measurePoints.map((point, i) => (
                  <div
                    key={`meas-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      border: '1px solid white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                      zIndex: 60,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            </TransformComponent>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-700 bg-white/90 px-2 py-1 rounded">
              {caliperMode === 'off'
                ? 'Scroll para zoom • Arraste para mover • Clique em ? para ajuda'
                : 'Compasso ativo • Vermelho = calibracao • Azul = medicao'}
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
