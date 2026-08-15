import { NumberInput } from '../../common/NumberInput'
import { Slider } from '../../common/Slider'
import { useSelectedObject } from '../../../hooks/editor/useSelectedObject'

export function ObjectRotationControls() {
  const { transform, setRotation, setOpacity } = useSelectedObject()
  if (!transform) return null

  return (
    <div className="flex flex-col gap-3">
      <NumberInput
        label="Rotation"
        value={transform.rotation}
        min={-360}
        max={360}
        suffix="°"
        disabled={transform.locked}
        onCommit={setRotation}
      />
      <Slider
        label="Opacity"
        value={transform.opacity}
        formatValue={(v) => `${v}%`}
        disabled={transform.locked}
        onChange={setOpacity}
      />
    </div>
  )
}
