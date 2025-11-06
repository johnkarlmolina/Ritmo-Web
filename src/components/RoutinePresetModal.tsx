import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

const TEAL = '#2D7778'

export type Preset = {
  key: string
  label: string
  url: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (preset: Preset) => void
}

function titleCase(s: string) {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const LABEL_OVERRIDES: Record<string, string> = {
  brushing: 'Brush My Teeth',
  eating: "Let's Eat",
  washing: 'Bath Time',
}

const RoutinePresetModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const presets = useMemo<Preset[]>(() => {
    // import all media from asset-gif as URLs (Vite feature)
    const files = import.meta.glob('../asset-gif/*.{gif,png,jpg,jpeg,svg}', {
      eager: true,
      query: '?url',
      import: 'default',
    }) as Record<string, string>

    const items: Preset[] = Object.entries(files).map(([path, url]) => {
      const file = path.split('/').pop() || ''
      const base = file.replace(/\.[^.]+$/, '') // name without extension
      const key = base.toLowerCase()
      const label = LABEL_OVERRIDES[key] ?? titleCase(base)
      return { key, label, url }
    })

    // Exclude BookGuide and Controller from routine presets
    const filtered = items.filter((p) => !['bookguide', 'controller'].includes(p.key))

    // Sort by label for predictable order
    filtered.sort((a, b) => a.label.localeCompare(b.label))
    return filtered
  }, [])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[24px] bg-white text-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: TEAL + '34' }}>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="text-xl font-semibold">Routine Preset</div>
          <div className="w-12" />
        </div>

        <div className="max-h-[70vh] overflow-auto p-5 space-y-4">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => onSelect(p)}
              className="group w-full text-left rounded-2xl border bg-white px-5 py-4 flex items-center gap-5 shadow-md transition-all duration-150 ease-out hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#2D7778] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7778] active:translate-y-0 active:scale-100"
              style={{ borderColor: TEAL }}
            >
              <img src={p.url} alt={p.label} className="h-20 w-20 object-contain transition-transform duration-150 group-hover:scale-105" />
              <span className="text-xl font-semibold transition-colors duration-150 group-hover:text-[#2D7778]">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RoutinePresetModal
