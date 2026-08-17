import { Select } from '../../common/Select'
import { ColorPicker } from '../../common/ColorPicker'
import { Slider } from '../../common/Slider'
import { useEffectsControls } from '../../../hooks/editor/useEffectsControls'
import { BLEND_MODES } from '../../../lib/editor/constants'
import type { BlendMode } from '../../../types/objects'

export function EffectsControls() {
  const { hasObject, shadow, blendMode, updateShadow, updateBlend } = useEffectsControls()
  if (!hasObject) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Effects</h3>

      <Select
        label="Blend Mode"
        value={blendMode}
        options={BLEND_MODES.map((mode) => ({ value: mode.value, label: mode.label }))}
        onChange={(value) => updateBlend(value as BlendMode)}
      />

      <label className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-xs text-text-secondary">
        Drop shadow
        <input
          type="checkbox"
          checked={shadow.enabled}
          onChange={(event) => updateShadow({ enabled: event.target.checked })}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
      </label>

      {shadow.enabled && (
        <div className="flex flex-col gap-3">
          <ColorPicker label="Shadow Color" value={shadow.color} onChange={(color) => updateShadow({ color })} />
          <Slider label="Blur" value={shadow.blur} min={0} max={100} onChange={(blur) => updateShadow({ blur })} />
          <div className="grid grid-cols-2 gap-2">
            <Slider
              label="Offset X"
              value={shadow.offsetX}
              min={-100}
              max={100}
              onChange={(offsetX) => updateShadow({ offsetX })}
            />
            <Slider
              label="Offset Y"
              value={shadow.offsetY}
              min={-100}
              max={100}
              onChange={(offsetY) => updateShadow({ offsetY })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
