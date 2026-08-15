import { NumberInput } from '../../common/NumberInput'
import { useSelectedObject } from '../../../hooks/editor/useSelectedObject'

export function ObjectSizeControls() {
  const { transform, setSize } = useSelectedObject()
  if (!transform) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput
        label="Width"
        value={transform.width}
        min={1}
        disabled={transform.locked}
        onCommit={(width) => setSize(width, transform.height)}
      />
      <NumberInput
        label="Height"
        value={transform.height}
        min={1}
        disabled={transform.locked}
        onCommit={(height) => setSize(transform.width, height)}
      />
    </div>
  )
}
