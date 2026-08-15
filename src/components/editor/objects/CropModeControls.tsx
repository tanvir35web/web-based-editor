import { Check, X } from 'lucide-react'
import { Button } from '../../common/Button'
import { useImageCrop } from '../../../hooks/editor/useImageCrop'

/**
 * Rendered at the PropertiesPanel level (not nested under the usual
 * "objectType === 'image'" branch) because during an active crop session the
 * canvas's active object is the crop rectangle, not the image — selection
 * legitimately moves away from the image while cropping.
 */
export function CropModeControls() {
  const { confirmCrop, cancelCropSession } = useImageCrop()

  return (
    <div className="border-b border-surface-border px-4 py-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Crop</h3>
      <p className="mb-3 text-xs text-text-secondary">
        Drag the handles to choose the area to keep, then apply.
      </p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={confirmCrop}>
          <Check className="h-3.5 w-3.5" />
          Apply
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={cancelCropSession}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
