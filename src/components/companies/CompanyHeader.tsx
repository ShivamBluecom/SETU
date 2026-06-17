import type { Company, Territory } from '@prisma/client'

interface CompanyHeaderProps {
  company: Company & { territory: Pick<Territory, 'id' | 'name'> | null }
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          {company.name}
        </h1>
        {company.industry && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-2)',
              border: '0.5px solid var(--color-border)',
            }}
          >
            {company.industry}
          </span>
        )}
        {company.territory && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--color-accent-bg)',
              color: 'var(--color-accent-text)',
            }}
          >
            {company.territory.name}
          </span>
        )}
      </div>
      {company.headOffice && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          {company.headOffice}
        </p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          {company.website}
        </a>
      )}
    </div>
  )
}
