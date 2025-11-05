import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlay, FiSquare } from 'react-icons/fi'

const TEAL = '#2D7778'

export type Ringtone = {
  key: string
  label: string
  url: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (ringtone: Ringtone) => void
  selectedKey?: string
}

function titleCase(s: string) {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const LABEL_OVERRIDES: Record<string, string> = {
  'mixkit-rooster-crowing-in-the-morning-2462': 'Rooster Crow',
}

const RingtoneModal: React.FC<Props> = ({ open, onClose, onSelect, selectedKey }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    return () => {
      // stop when unmount/close
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const ringtones = useMemo<Ringtone[]>(() => {
    const files = import.meta.glob('../alarm/*.{mp3,wav,ogg,m4a}', {
      eager: true,
      query: '?url',
      import: 'default',
    }) as Record<string, string>

    const items: Ringtone[] = Object.entries(files).map(([path, url]) => {
      const file = path.split('/').pop() || ''
      const base = file.replace(/\.[^.]+$/, '')
      const key = base.toLowerCase()
      const label = LABEL_OVERRIDES[key] ?? titleCase(base)
      return { key, label, url }
    })

    items.sort((a, b) => a.label.localeCompare(b.label))
    return items
  }, [])

  const togglePlay = (rt: Ringtone) => {
    // lazy create audio
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current

    if (playingKey === rt.key) {
      audio.pause()
      setPlayingKey(null)
      return
    }

    // switch to new
    audio.pause()
    audio.src = rt.url
    audio.currentTime = 0
    audio.play().then(() => setPlayingKey(rt.key)).catch(() => setPlayingKey(null))
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[24px] bg-white text-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: TEAL + '34' }}>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="text-xl font-semibold">Ringtones</div>
          <div className="w-12" />
        </div>

        <div className="max-h-[70vh] overflow-auto p-5 space-y-4">
          {ringtones.map((rt) => (
            <div
              key={rt.key}
              className="w-full rounded-2xl border bg-white px-5 py-4 flex items-center gap-5 shadow-md"
              style={{ borderColor: TEAL }}
            >
              <button
                type="button"
                onClick={() => togglePlay(rt)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: TEAL }}
                aria-label={playingKey === rt.key ? 'Stop preview' : 'Play preview'}
              >
                {playingKey === rt.key ? <FiSquare /> : <FiPlay />}
              </button>

              <div className="flex-1">
                <div className="text-lg font-semibold">{rt.label}</div>
                <div className="text-xs text-slate-500">{rt.key}</div>
              </div>

              <button
                type="button"
                onClick={() => onSelect(rt)}
                className="rounded-xl px-3.5 py-2.5 text-white font-medium shadow-[0_6px_0_rgba(45,119,120,0.35)]"
                style={{ backgroundColor: TEAL }}
              >
                {selectedKey === rt.key ? 'Selected' : 'Choose'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RingtoneModal
