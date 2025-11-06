import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { NewRoutine } from './AddRoutineModal'

const TEAL = '#2D7778'

type Props = {
  open: boolean
  onClose: () => void
  routine: (NewRoutine & { id: string }) | null
  onDelete?: (id: string) => void
  completed?: boolean
  onToggleDone?: (id: string) => void
}

const RoutineDetailModal: React.FC<Props> = ({ open, onClose, routine, onDelete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setPlaying] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    const mm = m.toString().padStart(2, '0')
    return `${h}:${mm} ${p}`
  }

  const togglePlay = async () => {
    if (!routine?.ringtone?.url) return
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current

    if (isPlaying) {
      audio.pause()
      setPlaying(false)
      return
    }

    audio.src = routine.ringtone.url
    audio.currentTime = 0
    try {
      await audio.play()
      setPlaying(true)
      audio.onended = () => setPlaying(false)
    } catch {
      setPlaying(false)
    }
  }

  if (!open || !routine) return null

  return createPortal(
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[24px] bg-white text-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: TEAL + '34' }}>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="text-xl font-semibold">Routine</div>
          <div className="w-12" />
        </div>

        <div className="p-6 space-y-5">
          <div className="w-full aspect-square rounded-2xl bg-white flex items-center justify-center overflow-hidden border" style={{ borderColor: TEAL + '55' }}>
            {routine.preset?.url ? (
              <img src={routine.preset.url} alt={routine.preset.label} className="h-full w-full object-contain" />
            ) : (
              <div className="text-5xl" role="img" aria-label="routine">🗓️</div>
            )}
          </div>

          <div>
            <div className="text-2xl font-semibold">{routine.name}</div>
            <div className="text-slate-600">{formatTime(routine.hour, routine.minute, routine.period)}</div>
            {routine.ringtoneName && (
              <div className="text-sm text-slate-500 mt-1">🔔 {routine.ringtoneName}</div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={togglePlay}
              className="flex-1 rounded-xl px-4 py-3 text-white font-medium shadow-[0_6px_0_rgba(45,119,120,0.35)]"
              style={{ backgroundColor: TEAL }}
            >
              {isPlaying ? 'Stop Ringtone' : 'Play Ringtone'}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(routine.id)}
                className="rounded-xl px-4 py-3 font-medium border text-red-600 border-red-300 bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RoutineDetailModal
