import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export type GreetingOverlayProps = {
  open: boolean
  name: string
  onClose: () => void
}

const GreetingOverlay: React.FC<GreetingOverlayProps> = ({ open, name, onClose }) => {
  // Load sun images dynamically from asset-gif folder
  // @ts-ignore - vite import glob typing
  const sunMap = useMemo(
    () => ({
      // Support both uppercase and lowercase file names (Sun_1..4 or sun_1..4)
      ...import.meta.glob('../asset-gif/Sun_*.*', { eager: true, query: '?url', import: 'default' }),
      ...import.meta.glob('../asset-gif/sun_*.*', { eager: true, query: '?url', import: 'default' }),
    }),
    []
  )
  const sunList = useMemo(() => {
    const entries = Object.entries(sunMap) as Array<[string, string]>
    // Sort by numeric suffix Sun_1..Sun_4
    return entries
      .sort((a, b) => {
        const ai = parseInt(a[0].match(/Sun_(\d+)/)?.[1] || '0', 10)
        const bi = parseInt(b[0].match(/Sun_(\d+)/)?.[1] || '0', 10)
        return ai - bi
      })
      .map(([, url]) => url)
  }, [sunMap])

  const [idx, setIdx] = useState(0)
  const imgSrc = sunList[idx] ?? sunList[0]

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      {/* Soft gradient background like the mock */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF7A9] to-[#92F3FF]" />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-slate-800 select-none">
        <button
          type="button"
          onClick={() => setIdx((i) => (sunList.length ? (i + 1) % sunList.length : 0))}
          className="focus:outline-none mb-8"
          aria-label="Change sun emotion"
        >
          {imgSrc ? (
            <img src={imgSrc} alt="Sun" className="h-40 w-40 sm:h-48 sm:w-48 object-contain" />
          ) : (
            <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-yellow-300 shadow-inner" />
          )}
        </button>

        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-semibold text-slate-700">Good Morning</div>
          <div className="mt-2 text-3xl sm:text-4xl font-bold underline decoration-2 decoration-slate-700">{name}</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-10 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-semibold px-8 py-3 shadow"
        >
          Continue
        </button>
      </div>
    </div>,
    document.body
  )
}

export default GreetingOverlay
