/**
 * Pure geometry — no Fabric/Canvas import, independently unit-testable.
 *
 * Object geometry (left/top/getBoundingRect()) is already in document space
 * (see objects.ts#alignObjects, which compares it directly against
 * getDocumentDimensions with no zoom multiplication) — so none of this math
 * needs a zoom adjustment. Zoom only re-enters when rendering the guide
 * overlay in screen pixels (see SnapGuidesOverlay).
 */

export interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

export interface SnapGuide {
  position: number
  orientation: 'vertical' | 'horizontal'
}

export interface SnapResult {
  dx: number
  dy: number
  guides: SnapGuide[]
}

export interface SnappingSettings {
  enabled: boolean
  snapToObjects: boolean
  snapToGrid: boolean
  gridSize: number
  threshold: number // document-space px
}

export function snapValueToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

function getSnapEdges(bounds: Bounds): number[] {
  return [bounds.left, bounds.left + bounds.width / 2, bounds.left + bounds.width]
}

function closestSnap(edges: number[], targets: number[], threshold: number): { position: number; delta: number } | null {
  let best: { position: number; delta: number } | null = null
  for (const edge of edges) {
    for (const target of targets) {
      const delta = target - edge
      if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) {
        best = { position: target, delta }
      }
    }
  }
  return best
}

/**
 * Computes the snap offset for an object being dragged, against grid lines
 * and/or the edges/centers of every other object on the canvas, within
 * `threshold` document-space pixels. Returns a zero-offset result (with no
 * guides) when nothing is within range.
 */
export function computeObjectSnap(moving: Bounds, others: Bounds[], settings: SnappingSettings): SnapResult {
  const guides: SnapGuide[] = []
  let dx = 0
  let dy = 0

  if (!settings.enabled) return { dx, dy, guides }

  const movingXEdges = getSnapEdges(moving)
  const movingYEdges = getSnapEdges({ left: moving.top, top: 0, width: moving.height, height: 0 })

  if (settings.snapToObjects) {
    const xTargets = others.flatMap((b) => getSnapEdges(b))
    const yTargets = others.flatMap((b) => getSnapEdges({ left: b.top, top: 0, width: b.height, height: 0 }))

    const xSnap = closestSnap(movingXEdges, xTargets, settings.threshold)
    if (xSnap) {
      dx = xSnap.delta
      guides.push({ orientation: 'vertical', position: xSnap.position })
    }

    const ySnap = closestSnap(movingYEdges, yTargets, settings.threshold)
    if (ySnap) {
      dy = ySnap.delta
      guides.push({ orientation: 'horizontal', position: ySnap.position })
    }
  }

  if (settings.snapToGrid) {
    if (dx === 0) {
      const snappedLeft = snapValueToGrid(moving.left, settings.gridSize)
      if (Math.abs(snappedLeft - moving.left) <= settings.threshold) dx = snappedLeft - moving.left
    }
    if (dy === 0) {
      const snappedTop = snapValueToGrid(moving.top, settings.gridSize)
      if (Math.abs(snappedTop - moving.top) <= settings.threshold) dy = snappedTop - moving.top
    }
  }

  return { dx, dy, guides }
}
