import { ToolRail } from './ToolRail'
import { UploadPanel } from './panels/UploadPanel'
import { TextPanel } from './panels/TextPanel'
import { ShapesPanel } from './panels/ShapesPanel'
import { LayersPanel } from './panels/LayersPanel'
import { BackgroundPanel } from './panels/BackgroundPanel'
import { useEditorStore } from '../../stores/editor/editorStore'
import { cn } from '../../lib/utils/cn'

const PANELS = {
  select: null,
  upload: UploadPanel,
  text: TextPanel,
  shapes: ShapesPanel,
  image: null,
  layers: LayersPanel,
  background: BackgroundPanel,
}

export function EditorSidebar() {
  const activeTool = useEditorStore((s) => s.activeTool)
  const isMobileToolsOpen = useEditorStore((s) => s.isMobileToolsOpen)
  const closeMobilePanels = useEditorStore((s) => s.closeMobilePanels)
  const ActivePanel = PANELS[activeTool]

  return (
    <div className="flex h-full">
      <ToolRail />
      {ActivePanel && (
        <>
          {/* Below `lg` the flyout becomes an overlay with a backdrop; at `lg`+ it's a normal inline column. */}
          {isMobileToolsOpen && (
            <div className="fixed inset-0 top-14 bottom-7 z-30 bg-black/50 lg:hidden" onClick={closeMobilePanels} aria-hidden="true" />
          )}
          <div
            className={cn(
              'scroll-thin w-64 overflow-y-auto border-r border-surface-border bg-surface-1 p-4',
              'fixed top-14 bottom-7 left-14 z-40 transition-transform lg:static lg:z-auto lg:translate-x-0',
              isMobileToolsOpen ? 'translate-x-0' : '-translate-x-[calc(100%+3.5rem)]',
            )}
          >
            <ActivePanel />
          </div>
        </>
      )}
    </div>
  )
}
