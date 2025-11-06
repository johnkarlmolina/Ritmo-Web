import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export type GreetingOverlayProps = {
  open: boolean
  name: string
  onClose: () => void
  isWelcomeBack?: boolean // Add flag to differentiate between initial and return greeting
}

const GreetingOverlay: React.FC<GreetingOverlayProps> = ({ open, name, onClose, isWelcomeBack = false }) => {
  // Load sun and moon images dynamically from asset-gif folder
  // @ts-ignore - vite import glob typing
  const sunMap = useMemo(
    () => ({
      // Support both uppercase and lowercase file names (Sun_1.. or sun_1..)
      ...import.meta.glob('../asset-gif/Sun_*.*', { eager: true, query: '?url', import: 'default' }),
      ...import.meta.glob('../asset-gif/sun_*.*', { eager: true, query: '?url', import: 'default' }),
    }),
    []
  )
  const sunList = useMemo(() => {
    const entries = Object.entries(sunMap) as Array<[string, string]>
    return entries
      .sort((a, b) => {
        const ai = parseInt(a[0].match(/Sun_(\d+)/i)?.[1] || '0', 10)
        const bi = parseInt(b[0].match(/Sun_(\d+)/i)?.[1] || '0', 10)
        return ai - bi
      })
      .map(([, url]) => url)
  }, [sunMap])

  // @ts-ignore - vite import glob typing
  const moonMap = useMemo(
    () => ({
      ...import.meta.glob('../asset-gif/Moon_*.*', { eager: true, query: '?url', import: 'default' }),
      ...import.meta.glob('../asset-gif/moon_*.*', { eager: true, query: '?url', import: 'default' }),
    }),
    []
  )
  const moonList = useMemo(() => {
    const entries = Object.entries(moonMap) as Array<[string, string]>
    return entries
      .sort((a, b) => {
        const ai = parseInt(a[0].match(/Moon_(\d+)/i)?.[1] || '0', 10)
        const bi = parseInt(b[0].match(/Moon_(\d+)/i)?.[1] || '0', 10)
        return ai - bi
      })
      .map(([, url]) => url)
  }, [moonMap])

  // Decide greeting based on current time: night 6pm-6am
  const hour = new Date().getHours()
  const isNight = hour >= 18 || hour < 6
  const activeList = (isNight ? moonList : sunList)

  const [idx, setIdx] = useState(0)
  const imgSrc = activeList[idx] ?? activeList[0]

  // Auto-dismiss after 5 seconds when opened
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose(), 5000)
    return () => clearTimeout(t)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-transparent">
      {/* Animations for entrance, falling suns, and subtle text pop */}
      <style>{`
        @keyframes sun-rise {
          0% { transform: translateY(50vh) scale(0.9); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fall {
          0% { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes text-pop {
          0% { transform: translateY(8px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      {/* Falling decoration (suns or moons depending on time) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => {
          const left = Math.random() * 100
          const duration = 3000 + Math.random() * 2500 // 3.0s - 5.5s
          const delay = Math.random() * 1200
          const size = 48 // uniform size for all falling suns
          const list = activeList.length ? activeList : [imgSrc].filter(Boolean)
          const src = list[(i + idx) % (list.length || 1)] || imgSrc
          return (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute"
              style={{
                left: `${left}%`,
                top: '-10%',
                width: `${size}px`,
                height: `${size}px`,
                animation: `fall ${duration}ms linear ${delay}ms infinite`,
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
              }}
            />
          )
        })}
      </div>

      {/* Foreground content */}
      <div className="relative h-full w-full flex flex-col items-center justify-center px-6 text-slate-800 select-none">
        <button
          type="button"
          onClick={() => setIdx((i) => (activeList.length ? (i + 1) % activeList.length : 0))}
          className="focus:outline-none mb-8"
          aria-label={isNight ? 'Change moon emotion' : 'Change sun emotion'}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={isNight ? 'Moon' : 'Sun'}
              className="h-64 w-64 sm:h-80 sm:w-80 object-contain"
              style={{ animation: 'sun-rise 1200ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
            />
          ) : (
            <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-yellow-300 shadow-inner" />
          )}
        </button>

        <div className="text-center">
          <div
            className="text-2xl sm:text-3xl font-semibold text-slate-700 transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{ animation: 'text-pop 500ms ease-out both' }}
          >
            {isWelcomeBack ? 'Welcome Back' : (isNight ? 'Good Evening' : 'Good Morning')}
          </div>
          {name?.trim() ? (
            <div
              className="mt-2 text-3xl sm:text-4xl font-bold underline decoration-2 decoration-slate-700 transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{ animation: 'text-pop 650ms ease-out both' }}
            >
              {name}
            </div>
          ) : null}
        </div>

        {/* Auto-closes after 3 seconds; no manual Continue button */}
      </div>
    </div>,
    document.body
  )
}

export default GreetingOverlay
