import { useCanvasStore } from '../../../stores/editor/canvasStore'
import type { SnapGuide } from '../../../lib/fabric/snapping'

interface SnapGuidesOverlayProps {
  guides: SnapGuide[]
}

/**
 * Absolutely-positioned SVG sibling of the Fabric <canvas> element — not
 * temporary Fabric Line objects. Adding/removing Fabric objects dozens of
 * times per second during a drag would spam object:added/object:removed
 * (and thus pushState()) and leak untagged objects into getObjects()-based
 * logic (LayersPanel's TYPE_ICON lookup, serialization). This overlay never
 * touches canvas.add/remove, getObjects(), serialization, or history.
 */
export function SnapGuidesOverlay({ guides }: SnapGuidesOverlayProps) {
  const zoom = useCanvasStore((s) => s.zoom)
  if (guides.length === 0) return null

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      {guides.map((guide, index) =>
        guide.orientation === 'vertical' ? (
          <line
            key={index}
            x1={guide.position * zoom}
            y1={0}
            x2={guide.position * zoom}
            y2="100%"
            stroke="#f43f5e"
            strokeWidth={1}
          />
        ) : (
          <line
            key={index}
            x1={0}
            y1={guide.position * zoom}
            x2="100%"
            y2={guide.position * zoom}
            stroke="#f43f5e"
            strokeWidth={1}
          />
        ),
      )}
    </svg>
  )
}
