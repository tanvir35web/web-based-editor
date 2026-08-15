import { EDITOR_DEFAULTS } from './constants'
import type { AdjustmentValues, ShapeObjectProps, TextObjectProps } from '../../types/objects'

export function createDefaultAdjustments(): AdjustmentValues {
  return {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    exposure: 0,
    blur: 0,
    opacity: 100,
    grayscale: false,
    sepia: false,
    invert: false,
    vintage: false,
    warm: false,
    cool: false,
  }
}

export function createDefaultTextProps(): TextObjectProps {
  return {
    fontFamily: EDITOR_DEFAULTS.DEFAULT_FONT_FAMILY,
    fontSize: EDITOR_DEFAULTS.DEFAULT_FONT_SIZE,
    fontWeight: EDITOR_DEFAULTS.DEFAULT_FONT_WEIGHT,
    fontStyle: 'normal',
    underline: false,
    linethrough: false,
    fill: EDITOR_DEFAULTS.DEFAULT_TEXT_COLOR,
    backgroundColor: 'transparent',
    opacity: 100,
    charSpacing: 0,
    lineHeight: 1.16,
    textAlign: 'left',
  }
}

export function createDefaultShapeProps(): ShapeObjectProps {
  return {
    fill: EDITOR_DEFAULTS.DEFAULT_SHAPE_FILL,
    stroke: EDITOR_DEFAULTS.DEFAULT_SHAPE_STROKE,
    strokeWidth: EDITOR_DEFAULTS.DEFAULT_SHAPE_STROKE_WIDTH,
    cornerRadius: 0,
  }
}
