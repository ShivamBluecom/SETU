'use client'

const PROTOCOL_RE = /^https?:\/\//i

interface WebsiteInputProps {
  value: string
  onChange: (fullUrl: string) => void
  placeholder?: string
  style?: React.CSSProperties
}

export function WebsiteInput({ value, onChange, placeholder = 'acme.com', style }: WebsiteInputProps) {
  const domain = value.replace(PROTOCOL_RE, '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(PROTOCOL_RE, '')
    onChange(raw ? `https://${raw}` : '')
  }

  return (
    <div className="website-input-wrapper" style={style}>
      <span className="website-input-prefix">https://</span>
      <input value={domain} onChange={handleChange} placeholder={placeholder} />
    </div>
  )
}
