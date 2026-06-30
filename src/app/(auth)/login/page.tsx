import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1a1040 40%, #0c2340 70%, #0f172a 100%)',
      }}
    >
      {/* Ambient orbs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(8,145,178,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '40%',
          left: '55%',
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          margin: '0 24px',
          background: 'rgba(255, 255, 255, 0.97)',
          borderRadius: '20px',
          padding: '44px 44px 40px',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.15), 0 20px 60px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Gradient strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '3px',
            borderRadius: '0 0 3px 3px',
            background: 'var(--gradient-brand)',
          }}
        />

        {/* Branding */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          {/* Logo mark */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px rgba(13,148,136,0.35)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M5 13 L13 5 L21 13 L13 21 Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="13" cy="13" r="3" fill="white" />
            </svg>
          </div>

          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '0.12em',
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SETU
          </h1>
          <p
            style={{
              marginTop: '6px',
              fontSize: '13px',
              color: 'var(--color-text-3)',
              letterSpacing: '0.02em',
            }}
          >
            Bluecom Group · Sales CRM
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--color-border)',
            marginBottom: '28px',
          }}
        />

        <p
          style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: 'var(--color-text-2)',
            textAlign: 'center',
          }}
        >
          Sign in to continue to your workspace
        </p>

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
              background: 'var(--gradient-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
              boxShadow: '0 2px 12px rgba(13,148,136,0.35), 0 1px 3px rgba(8,145,178,0.25)',
              transition: 'opacity 150ms, transform 120ms, box-shadow 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(13,148,136,0.45), 0 2px 6px rgba(8,145,178,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 2px 12px rgba(13,148,136,0.35), 0 1px 3px rgba(8,145,178,0.25)'
            }}
          >
            <MicrosoftIcon />
            Sign in with Microsoft
          </button>
        </form>

        <p
          style={{
            margin: '20px 0 0',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--color-text-3)',
          }}
        >
          Access restricted to Bluecom Group accounts
        </p>
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
