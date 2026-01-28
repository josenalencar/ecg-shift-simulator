// Export utilities for CSV and PNG

export function exportTableToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  // Create header row
  const headers = columns.map(col => col.label).join(',')

  // Create data rows
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key]
      // Handle different value types
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  )

  // Combine and download
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportChartToPNG(
  elementId: string,
  filename: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default

  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id ${elementId} not found`)
    return
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  })

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Format date for display
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

// Get date range presets
export function getDateRangePreset(preset: string): { from: Date; to: Date } {
  const now = new Date()
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  let from: Date

  switch (preset) {
    case '7d':
      from = new Date(to)
      from.setDate(from.getDate() - 7)
      from.setHours(0, 0, 0, 0)
      break
    case '30d':
      from = new Date(to)
      from.setDate(from.getDate() - 30)
      from.setHours(0, 0, 0, 0)
      break
    case '90d':
      from = new Date(to)
      from.setDate(from.getDate() - 90)
      from.setHours(0, 0, 0, 0)
      break
    case 'year':
      from = new Date(to.getFullYear(), 0, 1, 0, 0, 0)
      break
    case 'all':
    default:
      from = new Date(2020, 0, 1, 0, 0, 0) // Far past date
      break
  }

  return { from, to }
}
