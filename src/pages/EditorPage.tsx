import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Editor } from '../components/editor/Editor'
import { useEditorStore } from '../stores/editor/editorStore'

interface NavigationState {
  action?: 'new' | 'upload'
}

export default function EditorPage() {
  const location = useLocation()
  const openNewDocumentDialog = useEditorStore((s) => s.openNewDocumentDialog)

  useEffect(() => {
    const state = location.state as NavigationState | null
    if (state?.action === 'new') openNewDocumentDialog()
    // Only meant to run once for the navigation that landed on this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Editor />
}
