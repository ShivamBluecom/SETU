'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
  success: { bg: 'var(--color-accent-bg)', border: 'var(--color-accent)', color: 'var(--color-accent-text)' },
  error: { bg: '#FEF2F2', border: 'var(--color-danger)', color: 'var(--color-danger)' },
  info: { bg: 'var(--color-surface)', border: 'var(--color-border)', color: 'var(--color-text-1)' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { bg, border, color } = TOAST_COLORS[toast.type]
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timerRef.current)
  }, [toast.id, onDismiss])

  return (
    <div
      style={{
        background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: '6px',
        padding: '10px 14px',
        color,
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        maxWidth: '320px',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      {toast.message}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
