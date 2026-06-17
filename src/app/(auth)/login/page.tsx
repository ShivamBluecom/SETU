import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          border: '0.5px solid var(--color-border)',
          borderRadius: '8px',
          padding: '40px 48px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <span
            style={{
              fontFamily: 'var(--font-grotesk)',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '1.5px',
              color: 'var(--color-text-1)',
            }}
          >
            SETU
          </span>
          <p
            style={{
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--color-text-3)',
            }}
          >
            Bluecom Group · Sales CRM
          </p>
        </div>

        <form
          action={async () => {
            'use server'
            await signIn('microsoft-entra-id', { redirectTo: '/dashboard' })
          }}
        >
          <button
            type="submit"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-grotesk)',
            }}
          >
            <MicrosoftIcon />
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </div>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="7" height="7" fill="#F25022" />
      <rect x="10" y="1" width="7" height="7" fill="#7FBA00" />
      <rect x="1" y="10" width="7" height="7" fill="#00A4EF" />
      <rect x="10" y="10" width="7" height="7" fill="#FFB900" />
    </svg>
  )
}
