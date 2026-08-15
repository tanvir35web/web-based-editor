import { RotateCcw } from 'lucide-react'
import { Slider } from '../../common/Slider'
import { Button } from '../../common/Button'
import { useImageAdjustments } from '../../../hooks/editor/useImageAdjustments'
import type { AdjustmentValues } from '../../../types/objects'

const TOGGLE_FILTERS: { key: keyof AdjustmentValues; label: string }[] = [
  { key: 'grayscale', label: 'Grayscale' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'invert', label: 'Invert' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'warm', label: 'Warm' },
  { key: 'cool', label: 'Cool' },
]

export function AdjustmentsPanel() {
  const { hasImage, adjustments, updateAdjustments, resetAdjustments } = useImageAdjustments()
  if (!hasImage) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Adjustments</h3>
        <Button variant="ghost" size="sm" onClick={resetAdjustments}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <Slider
        label="Brightness"
        value={adjustments.brightness}
        min={-100}
        max={100}
        onChange={(brightness) => updateAdjustments({ brightness })}
      />
      <Slider
        label="Contrast"
        value={adjustments.contrast}
        min={-100}
        max={100}
        onChange={(contrast) => updateAdjustments({ contrast })}
      />
      <Slider
        label="Saturation"
        value={adjustments.saturation}
        min={-100}
        max={100}
        onChange={(saturation) => updateAdjustments({ saturation })}
      />
      <Slider label="Hue" value={adjustments.hue} min={-180} max={180} onChange={(hue) => updateAdjustments({ hue })} />
      <Slider
        label="Exposure"
        value={adjustments.exposure}
        min={-100}
        max={100}
        onChange={(exposure) => updateAdjustments({ exposure })}
      />
      <Slider label="Blur" value={adjustments.blur} min={0} max={100} onChange={(blur) => updateAdjustments({ blur })} />
      <Slider
        label="Opacity"
        value={adjustments.opacity}
        min={0}
        max={100}
        onChange={(opacity) => updateAdjustments({ opacity })}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-text-secondary">Filters</span>
        <div className="grid grid-cols-2 gap-1.5">
          {TOGGLE_FILTERS.map(({ key, label }) => {
            const active = Boolean(adjustments[key])
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateAdjustments({ [key]: !active } as Partial<AdjustmentValues>)}
                className={
                  active
                    ? 'rounded-md border border-accent bg-accent/15 px-2 py-1.5 text-xs text-accent'
                    : 'rounded-md border border-surface-border px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary'
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
