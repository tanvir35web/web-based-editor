import { ColorPicker } from '../../common/ColorPicker'
import { Slider } from '../../common/Slider'
import { useShapeControls } from '../../../hooks/editor/useShapeControls'

export function ShapeObjectControls() {
  const { hasShape, isRectShape, shapeProps, updateShape } = useShapeControls()
  if (!hasShape) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Shape</h3>
      <ColorPicker label="Fill" value={shapeProps.fill} onChange={(fill) => updateShape({ fill })} allowTransparent />
      <ColorPicker label="Stroke" value={shapeProps.stroke} onChange={(stroke) => updateShape({ stroke })} allowTransparent />
      <Slider
        label="Stroke Width"
        value={shapeProps.strokeWidth}
        min={0}
        max={40}
        onChange={(strokeWidth) => updateShape({ strokeWidth })}
      />
      {isRectShape && (
        <Slider
          label="Corner Radius"
          value={shapeProps.cornerRadius}
          min={0}
          max={100}
          onChange={(cornerRadius) => updateShape({ cornerRadius })}
        />
      )}
    </div>
  )
}
