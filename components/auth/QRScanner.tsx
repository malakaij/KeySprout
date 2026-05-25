'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onClose: () => void
}

/** Scans camera feed for a KeySprout QR login token and redirects on success. */
export function QRScanner({ onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    let active = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        scan()
      } catch {
        setError('Camera not available. Make sure you have granted camera permission.')
        setScanning(false)
      }
    }

    function scan() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !active) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            handleCode(code.data)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(scan)
    }

    function handleCode(data: string) {
      setScanning(false)
      try {
        const url = new URL(data)
        // Only follow links pointing to this site's /login/token path
        if (url.pathname === '/login/token' && url.searchParams.has('t')) {
          stopStream()
          window.location.href = data
          return
        }
      } catch {
        // not a URL — fall through
      }
      setError('This QR code is not a KeySprout login card.')
      // Resume scanning after a short pause
      setTimeout(() => { setScanning(true); scan() }, 2000)
    }

    startCamera()

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      stopStream()
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function handleClose() {
    cancelAnimationFrame(rafRef.current)
    stopStream()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR code to sign in"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
    >
      <div className="bg-paper rounded-2xl border-2 border-ink overflow-hidden w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-ink" aria-hidden="true" />
            <h2 className="font-display text-ink">Scan login card</h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close QR scanner"
            className="text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera feed */}
        <div className="relative bg-ink aspect-square">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          {/* Viewfinder overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/70 rounded-xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4">
          {error ? (
            <div className="flex items-start gap-2 text-coral text-sm font-body">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-sm text-ink-muted font-body text-center">
              Hold your login card in front of the camera
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
