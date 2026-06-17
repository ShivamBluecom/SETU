'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  maxWidth = '480px',
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--color-bg)',
            border: '0.5px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            width: '100%',
            maxWidth,
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 50,
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <Dialog.Title
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text-1)',
                margin: 0,
              }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: '0.5px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                color: 'var(--color-text-2)',
              }}
            >
              <X size={14} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
