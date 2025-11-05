import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'


export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  logoSrc?: string
  bgSrc?: string
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, logoSrc, bgSrc }) => {
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden border border-slate-200 text-slate-900 shadow-2xl bg-center bg-cover bg-no-repeat"
        style={bgSrc ? ({ backgroundImage: `url(${bgSrc})` } as React.CSSProperties) : undefined}
      >
        <div className="relative z-10 p-6">
          {/* Close button in top-right */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 rounded p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            ✕
          </button>

          {logoSrc ? (
            <div className="mb-4 flex items-center justify-center">
              <img src={logoSrc} alt="Logo" className="h-16 w-auto select-none" draggable={false} />
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
