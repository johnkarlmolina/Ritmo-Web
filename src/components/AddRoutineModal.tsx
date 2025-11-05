import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronRight } from 'react-icons/fi'
import RoutinePresetModal, { type Preset } from './RoutinePresetModal.tsx'
import RingtoneModal, { type Ringtone } from './RingtoneModal.tsx'

type Props = {
  open: boolean
  onClose: () => void
  onDone?: (routine: NewRoutine) => void
}

const TEAL = '#2D7778'
const RED = '#EF4444'

export type NewRoutine = {
  hour: number
  minute: number
  period: 'AM' | 'PM'
  name: string
  preset: Preset | null
  ringtoneName: string
  ringtone: Ringtone | null
}

const AddRoutineModal: React.FC<Props> = ({ open, onClose, onDone }) => {
  // time state (12-hour)
  const [hour, setHour] = useState<number>(1)
  const [minute, setMinute] = useState<number>(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // routine details
  const [routineName, setRoutineName] = useState<string>('')
  const [showPreset, setShowPreset] = useState(false)
  const [showRingtone, setShowRingtone] = useState(false)
  const [ringtone, setRingtone] = useState<Ringtone | null>(null)
  const [ringtoneName, setRingtoneName] = useState<string>('')
  const [preset, setPreset] = useState<Preset | null>(null)
  const [errors, setErrors] = useState({
    name: false,
    preset: false,
    ringtone: false,
    ringtoneName: false,
  })
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleDone = () => {
    const missing = {
      name: !routineName.trim(),
      preset: !preset,
      ringtone: !ringtone,
      ringtoneName: !ringtoneName.trim(),
    }
    setErrors(missing)

    const missingLabels: string[] = []
    if (missing.name) missingLabels.push('Routine name')
    if (missing.preset) missingLabels.push('Routine preset')
    if (missing.ringtoneName) missingLabels.push('Ringtone name')
    if (missing.ringtone) missingLabels.push('Ringtone selection')

    if (missingLabels.length > 0) {
      window.alert('Please fill up: ' + missingLabels.join(', '))
      return
    }
    const payload: NewRoutine = {
      hour,
      minute,
      period,
      name: (routineName || preset?.label || 'New Routine').trim(),
      preset,
      ringtoneName: ringtoneName.trim(),
      ringtone,
    }
    if (onDone) onDone(payload)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[24px] bg-white text-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="text-xl font-semibold">Add Routine</div>
          <button onClick={handleDone} className="text-indigo-600 hover:text-indigo-500 underline">Done</button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Time picker (editable) */}
          <div className="rounded-[18px] border" style={{ borderColor: TEAL + '55' }}>
            <div className="px-6 py-6">
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Hour</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={hour}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (Number.isNaN(v)) return
                      if (v < 1) setHour(1)
                      else if (v > 12) setHour(12)
                      else setHour(v)
                    }}
                    className="w-full rounded-xl border px-3 py-3 text-3xl text-center font-semibold outline-none focus:ring-2"
                    style={{ borderColor: TEAL + '55' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-slate-500">Minute</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minute}
                    onChange={(e) => {
                      let v = Number(e.target.value)
                      if (Number.isNaN(v)) return
                      if (v < 0) v = 0
                      if (v > 59) v = 59
                      setMinute(v)
                    }}
                    className="w-full rounded-xl border px-3 py-3 text-3xl text-center font-semibold outline-none focus:ring-2"
                    style={{ borderColor: TEAL + '55' }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="block text-xs mb-1 text-slate-500">Period</span>
                  <button
                    type="button"
                    onClick={() => setPeriod((p) => (p === 'AM' ? 'PM' : 'AM'))}
                    className="rounded-xl px-5 py-3 text-3xl font-semibold text-white shadow-[0_6px_0_rgba(45,119,120,0.35)]"
                    style={{ backgroundColor: TEAL }}
                  >
                    {period}
                  </button>
                </div>
              </div>

              {/* helper bar between rows for visual match */}
              <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: TEAL + '66' }} />
            </div>
          </div>

          {/* Options card */}
          <div className="rounded-[18px] border p-6 space-y-4" style={{ borderColor: TEAL + '55' }}>
            <button
              className="w-full rounded-2xl py-3.5 text-white font-medium text-lg shadow-[0_6px_0_rgba(45,119,120,0.35)]"
              style={{ backgroundColor: TEAL }}
              onClick={() => setShowPreset(true)}
            >
              Choose Routine preset
            </button>

            <input
              type="text"
              placeholder="Routine name"
              className="w-full rounded-2xl border px-4 py-3 text-base outline-none focus:ring-2"
              style={{ borderColor: errors.name ? RED : TEAL + '55' }}
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Ringtone name"
              className="w-full rounded-2xl border px-4 py-3 text-base outline-none focus:ring-2"
              style={{ borderColor: errors.ringtoneName ? RED : TEAL + '55' }}
              value={ringtoneName}
              onChange={(e) => setRingtoneName(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowRingtone(true)}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-left flex items-center justify-between"
              style={{ borderColor: (errors.preset || errors.ringtone) ? RED : TEAL + '55' }}
            >
              <span>{ringtone ? `Ringtone: ${ringtone.label}` : 'Ringtone'}</span>
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Nested: Routine Preset */}
        <RoutinePresetModal
          open={showPreset}
          onClose={() => setShowPreset(false)}
          onSelect={(preset: Preset) => {
            setPreset(preset)
            setRoutineName(preset.label)
            setShowPreset(false)
          }}
        />

        {/* Nested: Ringtone Picker */}
        <RingtoneModal
          open={showRingtone}
          onClose={() => setShowRingtone(false)}
          selectedKey={ringtone?.key}
          onSelect={(rt) => {
            setRingtone(rt)
            setShowRingtone(false)
          }}
        />
      </div>
    </div>,
    document.body
  )
}

export default AddRoutineModal
