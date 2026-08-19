import type { Product } from './types'

export function displayName(p: Product | undefined): string {
  if (!p) return '未知'
  return p.internal_name || p.full_name || p.id
}

export function pct(num: number, den: number): number {
  return den ? Math.round(num / den * 100) : 0
}

export function medalEmoji(i: number): string {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return String(i + 1)
}

export function medalLabel(i: number): string {
  return i < 3 ? ['第1名','第2名','第3名'][i] : `第${i+1}名`
}

// Shared date range helpers
export function buildAllDates(dates: string[]): string[] {
  return [...new Set(dates)].sort()
}

export function applyQuickRange(
  type: string,
  allDates: string[],
  setStart: (d: string) => void,
  setEnd: (d: string) => void
) {
  const last = allDates[allDates.length - 1]
  if (!last) return
  if (type === 'all')  { setStart(allDates[0]); setEnd(last) }
  if (type === '7d')   { setStart(allDates[Math.max(0, allDates.length - 7)]);  setEnd(last) }
  if (type === '14d')  { setStart(allDates[Math.max(0, allDates.length - 14)]); setEnd(last) }
  if (type === '30d')  { setStart(allDates[Math.max(0, allDates.length - 30)]); setEnd(last) }
}
