import { ACCEPTED_IMAGE_TYPES, EDITOR_DEFAULTS } from './constants'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): ValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { valid: false, error: 'Unsupported file type. Please use PNG, JPEG, or WEBP.' }
  }
  if (file.size > EDITOR_DEFAULTS.MAX_UPLOAD_BYTES) {
    const maxMb = Math.round(EDITOR_DEFAULTS.MAX_UPLOAD_BYTES / (1024 * 1024))
    return { valid: false, error: `Image is too large. Maximum size is ${maxMb}MB.` }
  }
  return { valid: true }
}

export function validateImageDimensions(width: number, height: number): ValidationResult {
  if (width > EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION || height > EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION) {
    return { valid: false, error: `Image dimensions must not exceed ${EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION}px.` }
  }
  return { valid: true }
}

export function validateCanvasDimensions(width: number, height: number): ValidationResult {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return { valid: false, error: 'Width and height must be positive numbers.' }
  }
  if (width > EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION || height > EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION) {
    return { valid: false, error: `Canvas dimensions must not exceed ${EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION}px.` }
  }
  return { valid: true }
}
