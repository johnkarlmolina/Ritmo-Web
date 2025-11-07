import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import { AiFillStar } from 'react-icons/ai'
// @ts-ignore - local JS client
import { supabase } from '../supabaseClient'

type Props = {
  open: boolean
  onClose: () => void
  routineName?: string
  onComplete?: () => void
  presetKey?: string
}

const TEAL = '#2D7778'

type Step = {
  img?: string
  title: string
  description?: string
}

const BookGuideModal: React.FC<Props> = ({ open, onClose, routineName, onComplete, presetKey }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Step assets from asset-step-gif
  // @ts-ignore - Vite glob
  const stepMap = useMemo(() => ({
    ...import.meta.glob('../asset-step-gif/*.{gif,png,jpg,jpeg,svg}', { eager: true, query: '?url', import: 'default' })
  }), []) as Record<string, string>
  const getPath = (re: RegExp) => Object.entries(stepMap).find(([p]) => re.test(p))?.[1]
  const gifGetTBTP = getPath(/GetyourTB&TP\.(gif|png|jpe?g|svg)$/i)
  const gifPutPaste = getPath(/Puttoothpaste\.(gif|png|jpe?g|svg)$/i)
  const gifBrush = getPath(/Brushing\.(gif|png|jpe?g|svg)$/i)
  const gifRinse = getPath(/Rinseoutwater\.(gif|png|jpe?g|svg)$/i)

  const isBrush = (presetKey || '').toLowerCase().includes('brush') || (routineName || '').toLowerCase().includes('brush')

  const steps: Step[] = useMemo(() => {
    if (isBrush) {
      return [
        { img: gifGetTBTP, title: 'Step 1', description: 'Get your toothpaste and toothbrush' },
        { img: gifPutPaste, title: 'Step 2', description: 'Put a pea-sized toothpaste on your brush' },
        { img: gifBrush, title: 'Step 3', description: 'Brush all your teeth in circles for 2 minutes' },
        { img: gifRinse, title: 'Step 4', description: 'Rinse your mouth and toothbrush' },
      ]
    }
    return [
      { img: gifGetTBTP || gifBrush, title: 'Coming soon', description: 'Book Guide steps for this routine will be available soon.' }
    ]
  }, [isBrush, gifGetTBTP, gifPutPaste, gifBrush, gifRinse, routineName])

  const [idx, setIdx] = useState(0)
  const [childName, setChildName] = useState<string>('')
  const [showCongrats, setShowCongrats] = useState(false)
  useEffect(() => {
    if (!open) return
    // Load child name from Supabase user metadata if available
    supabase?.auth?.getUser?.().then((res: any) => {
      const name = (res?.data?.user?.user_metadata as any)?.child_name || ''
      setChildName(name)
    }).catch(() => {})
  }, [open])
  useEffect(() => { if (!open) setIdx(0) }, [open])

  if (!open) return null

  const step = steps[idx]
  const isLast = idx === steps.length - 1
  const title = isBrush ? 'Brush My Teeth' : (routineName || 'Book Guide')
  const filledStars = Math.min(idx + 1, 3)

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-[380px] sm:max-w-md rounded-[24px] bg-white text-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-500 underline">Back</button>
          <div className="flex-1 mx-2">
            <div className="rounded-2xl border px-3 py-2 flex items-center justify-between" style={{ borderColor: TEAL }}>
              <span className="font-semibold text-slate-800 truncate">{title}</span>
              <div className="ml-2 shrink-0 flex items-center gap-1">
                {[0,1,2].map(i => (
                  <AiFillStar key={i} className={`h-5 w-5 ${i < filledStars ? 'text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="w-10" />
        </div>

        {/* Image card */}
        <div className="px-4 sm:px-6">
          <div className="rounded-[18px] border p-4 flex items-center justify-center" style={{ borderColor: TEAL }}>
            {step?.img ? (
              <img src={step.img} alt={step.title} className="h-60 sm:h-72 object-contain" />
            ) : (
              <div className="h-60 sm:h-72 w-full flex items-center justify-center">📘</div>
            )}
          </div>
        </div>

        {/* Step text and actions */}
        <div className="px-4 sm:px-6 py-4 text-center">
          <div className="text-slate-700 font-semibold">{step?.title}</div>
          {step?.description ? (
            <div className="mt-1 text-slate-600">{step.description}</div>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              className="rounded-full px-4 py-2 border text-slate-700 disabled:opacity-40"
              style={{ borderColor: TEAL }}
              disabled={idx === 0}
            >
              <span className="inline-flex items-center gap-1"><FiChevronLeft /> Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  // show congrats overlay then close
                  setShowCongrats(true)
                  // notify completion immediately so Home can update progress/checkmark
                  try { onComplete?.() } catch {}
                  setTimeout(() => { setShowCongrats(false); onClose() }, 2600)
                } else {
                  setIdx(i => Math.min(steps.length - 1, i + 1))
                }
              }}
              className="rounded-full px-5 py-2 text-white font-semibold shadow" 
              style={{ backgroundColor: TEAL }}
            >
              {isLast ? 'DONE' : 'NEXT'} <FiChevronRight className="inline ml-1" />
            </button>
          </div>
        </div>

        {/* Congrats overlay */}
        {showCongrats && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FEF9C3 0%, #A7F3D0 100%)' }}>
            {/* Sequential left-to-center star fill into containers */}
            <style>{`
              @keyframes star-slide-in {
                0%   { transform: translateX(-140%) scale(0.9); opacity: 0.15; }
                70%  { transform: translateX(8%) scale(1.06);  opacity: 1; }
                100% { transform: translateX(0) scale(1);      opacity: 1; }
              }
            `}</style>
            <div className="relative text-center">
              {/* Star containers */}
              <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4">
                {[0,1,2].map(i => (
                  <div key={i} className="relative" style={{ width: 44, height: 44 }}>
                    {/* Container (outline) */}
                    <AiFillStar className="text-slate-300" style={{ width: 44, height: 44 }} />
                    {/* Animated star filling the container */}
                    <AiFillStar
                      className="absolute top-0 left-0 text-yellow-400"
                      style={{ width: 44, height: 44, animation: `star-slide-in 700ms cubic-bezier(.22,1,.36,1) ${i * 400}ms both` }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-2xl font-semibold text-slate-700">Good Job</div>
              <div className="mt-1 text-3xl font-bold text-slate-800">{childName ? `“${childName}”` : 'Great Work!'}</div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default BookGuideModal
