interface LoadingSpinnerProps {
  size?: number
}

export function LoadingSpinner({ size = 20 }: LoadingSpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid var(--color-border)`,
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}
