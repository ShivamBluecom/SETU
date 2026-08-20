import type { Company, Territory } from '@prisma/client'
import { CompanyEditButton } from './CompanyEditButton'
import { CompanyDeleteButton } from './CompanyDeleteButton'

interface CompanyHeaderProps {
  company: Company & {
    territory: Pick<Territory, 'id' | 'name'> | null
    createdBy: { id: string; name: string } | null
    _count: { contacts: number; opportunities: number }
  }
  canEdit?: boolean
  isAdmin?: boolean
}

export function CompanyHeader({ company, canEdit, isAdmin }: CompanyHeaderProps) {
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
        {canEdit && <CompanyEditButton company={company} />}
        {isAdmin && (
          <CompanyDeleteButton
            companyId={company.id}
            companyName={company.name}
            contactCount={company._count.contacts}
          />
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
      {company.address && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          <span style={{ color: 'var(--color-text-2)', fontWeight: 500 }}>Address:</span> {company.address}
        </p>
      )}
      {company.gstNumber && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          <span style={{ color: 'var(--color-text-2)', fontWeight: 500 }}>GST Number:</span> {company.gstNumber}
        </p>
      )}
      {company.userCount != null && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          <span style={{ color: 'var(--color-text-2)', fontWeight: 500 }}>User Count:</span> {company.userCount}
        </p>
      )}
      {company.linkedinUrl && (
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          <span style={{ color: 'var(--color-text-2)', fontWeight: 500 }}>LinkedIn:</span>{' '}
          <a
            href={company.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            {company.linkedinUrl}
          </a>
        </p>
      )}
      {company.createdBy && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--color-text-3)' }}>
          Created by <span style={{ color: 'var(--color-text-2)', fontWeight: 500 }}>{company.createdBy.name}</span>
        </p>
      )}
    </div>
  )
}
