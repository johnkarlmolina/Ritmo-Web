import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  routineName?: string
  onChooseBookGuide?: () => void
  onChooseMiniGame?: () => void
}

const TEAL = '#2D7778'

const CompletionChoicesModal: React.FC<Props> = ({ open, onClose, routineName, onChooseBookGuide, onChooseMiniGame }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  // Load images via Vite glob as URLs
  const files = import.meta.glob('../asset-gif/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
  const bookGuide = Object.entries(files).find(([p]) => /BookGuide\.(gif|png|jpg|jpeg|svg)$/i.test(p))?.[1]
  const controller = Object.entries(files).find(([p]) => /Controller\.(gif|png|jpg|jpeg|svg)$/i.test(p))?.[1]

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-full sm:max-w-md md:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl text-slate-900 shadow-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between" style={{ borderColor: TEAL + '34' }}>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="text-base sm:text-lg font-semibold">Great job{routineName ? ` on ${routineName}` : ''}!</div>
          <div className="w-12" />
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Show Play MiniGame first (controller), then Book Guide */}
            <button
              type="button"
              onClick={onChooseMiniGame ?? onClose}
              className="group w-full rounded-2xl border bg-white px-4 sm:px-6 py-5 flex flex-col items-center gap-4 shadow-md hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7778] transition"
              style={{ borderColor: TEAL }}
            >
              {bookGuide ? (
                <img src={bookGuide} alt="Play MiniGame" className="h-28 sm:h-32 object-contain" />
              ) : (
                <div className="h-28 sm:h-32 flex items-center justify-center">🎮</div>
              )}
              <div className="text-center text-slate-800">
                <div className="text-lg sm:text-xl font-semibold">Play MiniGame</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onChooseBookGuide ?? onClose}
              className="group w-full rounded-2xl border bg-white px-4 sm:px-6 py-5 flex flex-col items-center gap-4 shadow-md hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7778] transition"
              style={{ borderColor: TEAL }}
            >
              {controller ? (
                <img src={controller} alt="Play Book Guide" className="h-28 sm:h-32 object-contain" />
              ) : (
                <div className="h-28 sm:h-32 flex items-center justify-center">📘</div>
              )}
              <div className="text-center text-slate-800">
                <div className="text-lg sm:text-xl font-semibold">Play Book Guide</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CompletionChoicesModal
