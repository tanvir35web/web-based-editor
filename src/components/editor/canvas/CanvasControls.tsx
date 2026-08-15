import type { ReactNode } from 'react'

export function CanvasControls({ children }: { children: ReactNode }) {
  return <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
    <div className="pointer-events-auto">{children}</div>
  </div>
}
