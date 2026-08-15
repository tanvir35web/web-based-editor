import { describe, it, expect } from 'vitest'
import { validateImageFile, validateImageDimensions, validateCanvasDimensions } from './validation'
import { EDITOR_DEFAULTS } from './constants'

function makeFile(type: string, size: number): File {
  return new File([new Uint8Array(size)], 'test-file', { type })
}

describe('validateImageFile', () => {
  it('accepts supported image types under the size limit', () => {
    expect(validateImageFile(makeFile('image/png', 1024)).valid).toBe(true)
    expect(validateImageFile(makeFile('image/jpeg', 1024)).valid).toBe(true)
    expect(validateImageFile(makeFile('image/webp', 1024)).valid).toBe(true)
  })

  it('rejects unsupported file types', () => {
    const result = validateImageFile(makeFile('application/pdf', 1024))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/unsupported/i)
  })

  it('rejects files over the maximum upload size', () => {
    const result = validateImageFile(makeFile('image/png', EDITOR_DEFAULTS.MAX_UPLOAD_BYTES + 1))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/too large/i)
  })
})

describe('validateImageDimensions', () => {
  it('accepts dimensions within the maximum', () => {
    expect(validateImageDimensions(1000, 1000).valid).toBe(true)
  })

  it('rejects dimensions exceeding the maximum', () => {
    const result = validateImageDimensions(EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION + 1, 100)
    expect(result.valid).toBe(false)
  })
})

describe('validateCanvasDimensions', () => {
  it('accepts positive, in-range dimensions', () => {
    expect(validateCanvasDimensions(1200, 800).valid).toBe(true)
  })

  it('rejects zero, negative, or non-finite dimensions', () => {
    expect(validateCanvasDimensions(0, 800).valid).toBe(false)
    expect(validateCanvasDimensions(-100, 800).valid).toBe(false)
    expect(validateCanvasDimensions(Number.NaN, 800).valid).toBe(false)
  })

  it('rejects dimensions exceeding the maximum', () => {
    expect(validateCanvasDimensions(EDITOR_DEFAULTS.MAX_IMAGE_DIMENSION + 1, 800).valid).toBe(false)
  })
})
