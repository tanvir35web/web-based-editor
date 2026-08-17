import type { FillValue } from './fill'

/** Discriminated union of every object type the editor can place on the artboard. */
export type EditorObjectType = 'image' | 'textbox' | 'rect' | 'circle' | 'triangle' | 'path'

/** Object types created by the Shapes tool (as opposed to text/image/freehand paths). */
export type ShapeType = 'rect' | 'circle' | 'triangle'

/** Lightweight, serializable metadata mirrored in React state for each canvas object. */
export interface EditorObjectMeta {
  id: string
  type: EditorObjectType
  name: string
  visible: boolean
  locked: boolean
}

export interface AdjustmentValues {
  brightness: number // -100..100
  contrast: number // -100..100
  saturation: number // -100..100
  hue: number // -180..180
  exposure: number // -100..100
  blur: number // 0..100
  opacity: number // 0..100
  grayscale: boolean
  sepia: boolean
  invert: boolean
  vintage: boolean
  warm: boolean
  cool: boolean
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface TextObjectProps {
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  underline: boolean
  linethrough: boolean
  fill: FillValue
  backgroundColor: string
  opacity: number // 0..100
  charSpacing: number
  lineHeight: number
  textAlign: TextAlign
}

export interface ShapeObjectProps {
  fill: FillValue
  stroke: string
  strokeWidth: number
  /** Corner radius in px — only meaningful for rect-type shapes. */
  cornerRadius: number
}

/** Drop-shadow settings, shared across every object type (image/text/shape/path). */
export interface ShadowProps {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export type BlendMode = GlobalCompositeOperation
