'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, RotateCcw, Zap, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface ARTryOnProps {
  productId: number
  productName: string
  productImage: string
  category: string
  onClose?: () => void
}

export function ARTryOn({ productId, productName, productImage, category, onClose }: ARTryOnProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  // Check WebXR support
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as Navigator & { xr: any }).xr.isSessionSupported('immersive-ar')
          setIsSupported(supported)
        } catch (err) {
          console.warn('WebXR support check failed:', err)
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }

    checkSupport()
  }, [])

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      setCameraPermission('granted')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      return stream
    } catch (err) {
      console.error('Camera permission denied:', err)
      setCameraPermission('denied')
      setError('Camera access is required for AR try-on')
      return null
    }
  }

  // Start AR session
  const startARTryOn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request camera permission first
      const stream = await requestCameraPermission()
      if (!stream) return

      // For WebXR supported devices
      if (isSupported) {
        const session = await (navigator as Navigator & { xr: any }).xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test', 'dom-overlay'],
          domOverlay: { root: document.body }
        })

        // Handle WebXR session
        await handleWebXRSession(session)
      } else {
        // Fallback to camera overlay method
        await startCameraOverlay()
      }

      setIsActive(true)
    } catch (err: unknown) {
      console.error('Failed to start AR try-on:', err)
      setError(err.message || 'Failed to start AR try-on')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle WebXR session
  const handleWebXRSession = async (session: XRSession) => {
    // WebXR implementation would go here
    // This is a simplified version for demonstration
    console.log('WebXR session started:', session)
  }

  // Fallback camera overlay method
  const startCameraOverlay = async () => {
    if (!videoRef.current || !canvasRef.current || !overlayRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current

    const ctx = canvas.getContext('2d')
    const overlayCtx = overlay.getContext('2d')

    if (!ctx || !overlayCtx) return

    // Set canvas dimensions to match video
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        overlay.width = video.videoWidth
        overlay.height = video.videoHeight
      }
    }

    video.addEventListener('loadedmetadata', updateCanvasSize)
    video.addEventListener('play', updateCanvasSize)

    // Draw video to canvas
    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Clear overlay
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height)

        // Draw product overlay (simplified face detection)
        drawProductOverlay(overlayCtx, overlay.width, overlay.height)

        requestAnimationFrame(drawFrame)
      }
    }

    video.addEventListener('play', drawFrame)
  }

  // Draw product overlay on face/camera
  const drawProductOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // This is a simplified overlay - in a real implementation,
    // you would use face detection libraries like face-api.js or TensorFlow.js

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Position product based on category
      const x = width / 2 - 100
      let y = height / 2 - 100
      let scale = 0.8

      // Adjust position based on product category
      switch (category.toLowerCase()) {
        case 'glasses':
        case 'sunglasses':
          y = height / 2 - 150
          scale = 0.6
          break
        case 'hats':
        case 'caps':
          y = height / 2 - 200
          scale = 0.7
          break
        case 'necklaces':
        case 'scarves':
          y = height / 2 - 50
          scale = 0.5
          break
        default:
          // Default positioning
          break
      }

      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      ctx.restore()
    }
    img.src = productImage
  }

  // Stop AR session
  const stopARTryOn = () => {
    setIsActive(false)

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Reset view
  const resetView = () => {
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
      }
    }
  }

  // Take screenshot
  const takeScreenshot = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `ar-try-on-${productName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  if (!isSupported && cameraPermission === 'prompt') {
    return (
      <Modal isOpen={true} onClose={onClose}>
        <div className="p-6 max-w-md mx-auto">
          <div className="text-center">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AR Try-On Not Supported</h3>
            <p className="text-gray-600 mb-6">
              Your device doesn't support WebXR. You can still try our camera overlay feature.
            </p>
            <div className="flex gap-3">
              <Button onClick={startARTryOn} className="flex-1">
                Try Camera Overlay
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-4xl">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{productName}</h3>
              <p className="text-white/70 text-sm">AR Try-On Experience</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="text-white hover:bg-white/20"
              >
                {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* AR Viewport */}
        <div className="relative aspect-video bg-gray-900">
          {!isActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Ready for AR Try-On</h3>
                <p className="text-gray-400 mb-6">Position yourself in good lighting for the best experience</p>
                <Button
                  onClick={startARTryOn}
                  disabled={isLoading}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start AR Try-On
                    </>
                  )}
                </Button>
                {error && (
                  <p className="text-red-400 text-sm mt-4">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Canvas for video processing */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: 'none' }}
              />

              {/* Overlay Canvas for product rendering */}
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white">Initializing AR...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        {showControls && isActive && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={takeScreenshot}
                className="text-white hover:bg-white/20"
              >
                <Camera className="h-4 w-4 mr-2" />
                Screenshot
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopARTryOn}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isActive && (
          <div className="absolute top-20 left-4 right-4 z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white text-sm text-center">
                Move your device to position the product. Adjust lighting for better visibility.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}