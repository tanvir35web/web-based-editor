export type GradientType = 'linear' | 'radial'

export interface GradientStop {
  offset: number // 0..1
  color: string // hex, 6 or 8 digit (alpha)
}

export interface SolidFillValue {
  type: 'solid'
  color: string // hex, 3/6/8-digit — see lib/utils/color.ts#isValidHexColor
}

export interface GradientFillValue {
  type: 'gradient'
  gradientType: GradientType
  angle: number // degrees 0..360 — meaningful for 'linear' only, ignored for 'radial'
  stops: GradientStop[] // >= 2 stops, sorted by offset
}

export type FillValue = SolidFillValue | GradientFillValue
