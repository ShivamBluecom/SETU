interface EmptyStateProps {
  message: string
  action?: React.ReactNode
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
        color: 'var(--color-text-3)',
        fontSize: '14px',
        textAlign: 'center',
      }}
    >
      <span>{message}</span>
      {action}
    </div>
  )
}
