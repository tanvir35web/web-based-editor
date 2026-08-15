import { Crop } from 'lucide-react'
import { AdjustmentsPanel } from '../panels/AdjustmentsPanel'
import { Button } from '../../common/Button'
import { useImageCrop } from '../../../hooks/editor/useImageCrop'

export function ImageObjectControls() {
  const { canStartCrop, startCrop } = useImageCrop()

  return (
    <div className="flex flex-col gap-4">
      {canStartCrop && (
        <Button variant="secondary" size="sm" onClick={startCrop}>
          <Crop className="h-3.5 w-3.5" />
          Crop
        </Button>
      )}
      <AdjustmentsPanel />
    </div>
  )
}
