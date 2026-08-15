import { UploadCloud, Type, Shapes, Layers, PaintBucket } from 'lucide-react'
import { IconButton } from '../common/IconButton'
import { useEditorStore } from '../../stores/editor/editorStore'
import type { EditorTool } from '../../types/editor'

const TOOLS: { tool: EditorTool; icon: typeof UploadCloud; label: string }[] = [
  { tool: 'upload', icon: UploadCloud, label: 'Upload' },
  { tool: 'text', icon: Type, label: 'Text' },
  { tool: 'shapes', icon: Shapes, label: 'Shapes' },
  { tool: 'layers', icon: Layers, label: 'Layers' },
  { tool: 'background', icon: PaintBucket, label: 'Background' },
]

export function ToolRail() {
  const activeTool = useEditorStore((s) => s.activeTool)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)

  return (
    <nav
      aria-label="Editor tools"
      className="flex w-14 flex-col items-center gap-1 border-r border-surface-border bg-surface-1 py-3"
    >
      {TOOLS.map(({ tool, icon: Icon, label }) => (
        <IconButton
          key={tool}
          icon={<Icon className="h-5 w-5" />}
          label={label}
          active={activeTool === tool}
          onClick={() => setActiveTool(tool)}
        />
      ))}
    </nav>
  )
}
