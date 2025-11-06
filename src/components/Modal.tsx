import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'


export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  logoSrc?: string
  bgSrc?: string
  onBack?: () => void
  closable?: boolean
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, logoSrc, bgSrc, onBack, closable = true }) => {
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
  {/* Page backdrop to dim the site behind the modal */}
  <div className="absolute inset-0 bg-black/60" onClick={closable ? onClose : undefined} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden border border-slate-200 text-slate-900 shadow-2xl bg-center bg-cover bg-no-repeat"
        style={bgSrc ? ({ backgroundImage: `url(${bgSrc})` } as React.CSSProperties) : undefined}
      >
        <div className="relative z-10 p-6">
          {/* Back button in top-left (optional) */}
          {onBack ? (
            <button
              aria-label="Back"
              onClick={onBack}
              className="absolute top-3 left-3 rounded p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          ) : null}
          {/* Close button in top-right */}
          {closable ? (
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-3 right-3 rounded p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              ✕
            </button>
          ) : null}

          {logoSrc ? (
            <div className="mb-4 flex items-center justify-center">
              <img src={logoSrc} alt="Logo" className="h-30 w-auto select-none" draggable={false} />
            </div>
          ) : null}
          {title ? (
            <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
          ) : null}
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
