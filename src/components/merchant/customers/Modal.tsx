// src/components/ui/Modal.tsx
import React, { useEffect } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl font-bold hover:text-gray-800"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
