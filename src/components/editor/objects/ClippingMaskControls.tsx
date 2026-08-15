import { Scissors, XCircle } from 'lucide-react'
import { Button } from '../../common/Button'
import { useClippingMask } from '../../../hooks/editor/useClippingMask'

/**
 * Renders itself (with its own section padding/border) only when a clipping
 * mask action is actually available — used unwrapped in PropertiesPanel so
 * an empty section box doesn't show up when neither action applies.
 */
export function ClippingMaskControls() {
  const { canCreateClipMask, canReleaseClipMask, createClipMask, releaseClipMask } = useClippingMask()

  if (!canCreateClipMask && !canReleaseClipMask) return null

  return (
    <div className="border-b border-surface-border px-4 py-4 last:border-b-0">
      {canCreateClipMask && (
        <Button variant="secondary" size="sm" onClick={createClipMask} className="w-full">
          <Scissors className="h-3.5 w-3.5" />
          Create Clipping Mask
        </Button>
      )}
      {canReleaseClipMask && (
        <Button variant="secondary" size="sm" onClick={releaseClipMask} className="w-full">
          <XCircle className="h-3.5 w-3.5" />
          Release Clipping Mask
        </Button>
      )}
    </div>
  )
}
