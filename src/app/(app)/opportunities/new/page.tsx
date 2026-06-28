'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Step1Details } from '@/components/opportunities/creation/Step1Details'
import { Step2LineItems } from '@/components/opportunities/creation/Step2LineItems'
import { Step3Services } from '@/components/opportunities/creation/Step3Services'
import { Step4Review } from '@/components/opportunities/creation/Step4Review'

const STEPS = [
  { num: 1, label: 'Details' },
  { num: 2, label: 'Line Items' },
  { num: 3, label: 'Services' },
  { num: 4, label: 'Review' },
]

function NewOpportunityFlow() {
  const params = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [opportunityId, setOpportunityId] = useState<string | null>(params.get('id'))

  const advance = (toStep: number, id?: string) => {
    const nextId = id ?? opportunityId
    if (nextId) {
      router.replace(`/opportunities/new?id=${nextId}`, { scroll: false })
      setOpportunityId(nextId)
    }
    setStep(toStep)
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 auto 0 0', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          New Opportunity
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: step >= s.num ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: step >= s.num ? '#fff' : 'var(--color-text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>{s.num}</div>
                <span style={{
                  fontSize: '10px', fontWeight: 500,
                  color: step >= s.num ? 'var(--color-text-1)' : 'var(--color-text-3)',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: '40px', height: '1px', background: 'var(--color-border)', margin: '0 6px', marginBottom: '14px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Step1Details
          opportunityId={opportunityId}
          onNext={(id) => advance(2, id)}
        />
      )}
      {step === 2 && opportunityId && (
        <Step2LineItems
          opportunityId={opportunityId}
          onNext={() => advance(3)}
          onBack={() => advance(1)}
        />
      )}
      {step === 3 && opportunityId && (
        <Step3Services
          opportunityId={opportunityId}
          onNext={() => advance(4)}
          onBack={() => advance(2)}
        />
      )}
      {step === 4 && opportunityId && (
        <Step4Review
          opportunityId={opportunityId}
          onBack={() => advance(3)}
          onCreated={() => router.push('/opportunities')}
        />
      )}
    </div>
  )
}

export default function NewOpportunityPage() {
  return (
    <Suspense>
      <NewOpportunityFlow />
    </Suspense>
  )
}
