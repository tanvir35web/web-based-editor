const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value.trim())
}

export function normalizeHexColor(value: string, fallback = '#000000'): string {
  const trimmed = value.trim()
  if (!isValidHexColor(trimmed)) return fallback
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return trimmed.toLowerCase()
}

export function hexToRgba(hex: string, alpha = 1): string {
  const normalized = normalizeHexColor(hex)
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function withAlpha(hex: string, alphaPercent: number): string {
  return hexToRgba(hex, Math.min(1, Math.max(0, alphaPercent / 100)))
}
