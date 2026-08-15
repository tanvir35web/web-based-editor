import { NumberInput } from '../../common/NumberInput'
import { useSelectedObject } from '../../../hooks/editor/useSelectedObject'

export function ObjectPositionControls() {
  const { transform, setPosition } = useSelectedObject()
  if (!transform) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput label="X" value={transform.x} disabled={transform.locked} onCommit={(x) => setPosition(x, transform.y)} />
      <NumberInput label="Y" value={transform.y} disabled={transform.locked} onCommit={(y) => setPosition(transform.x, y)} />
    </div>
  )
}
