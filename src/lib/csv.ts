function escapeCsvValue(value: string | number): string {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map(r => r.map(escapeCsvValue).join(',')).join('\n')
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const blob = new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
