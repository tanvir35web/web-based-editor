export interface CanvasPreset {
  id: string
  label: string
  width: number
  height: number
}

export interface NewDocumentOptions {
  width: number
  height: number
  backgroundColor: string
}

export type BackgroundMode = 'white' | 'black' | 'transparent' | 'custom'

export interface CanvasBackground {
  mode: BackgroundMode
  color: string
}

export type ExportFormat = 'png' | 'jpeg' | 'svg'

export interface ExportOptions {
  format: ExportFormat
  quality: number // 0..1, jpeg only
  transparentBackground: boolean
  /** 1 | 2 | 3 — ignored for svg, which is resolution-independent. */
  resolutionMultiplier: number
}
