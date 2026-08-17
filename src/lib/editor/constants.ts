import type { CanvasPreset } from '../../types/canvas'

export const EDITOR_DEFAULTS = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  CANVAS_BACKGROUND: '#ffffff',
  DEFAULT_FONT_FAMILY: 'Inter',
  DEFAULT_FONT_SIZE: 32,
  DEFAULT_FONT_WEIGHT: 400,
  DEFAULT_OPACITY: 100,
  DEFAULT_TEXT_COLOR: '#111111',
  DEFAULT_SHAPE_FILL: '#6366f1',
  DEFAULT_SHAPE_STROKE: '#111111',
  DEFAULT_SHAPE_STROKE_WIDTH: 0,
  DEFAULT_DRAW_STROKE: '#111111',
  DEFAULT_DRAW_STROKE_WIDTH: 4,
  MAX_HISTORY_LENGTH: 60,
  HISTORY_COMMIT_DEBOUNCE_MS: 400,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 4,
  ZOOM_STEP: 0.1,
  MAX_IMAGE_DIMENSION: 6000,
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
} as const

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920 },
  { id: 'facebook-post', label: 'Facebook Post', width: 1200, height: 630 },
  { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720 },
]

export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Lato',
  'Open Sans',
] as const

export type AvailableFont = (typeof AVAILABLE_FONTS)[number]

export const FONT_WEIGHTS = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semibold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'Black', value: 900 },
]

/**
 * Custom properties Fabric must round-trip through toObject/loadFromJSON.
 * Lives here (rather than serialization.ts) so lib/fabric/pages.ts can use
 * it too without an import cycle between pages.ts and serialization.ts.
 */
export const CUSTOM_PROPERTIES = ['id', 'name', 'locked', 'editorType', 'adjustments'] as const

export const BLEND_MODES: { value: GlobalCompositeOperation; label: string }[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
]
