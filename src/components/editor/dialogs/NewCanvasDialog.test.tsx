import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewCanvasDialog } from './NewCanvasDialog'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { CanvasTestProvider } from '../../../test/canvasTestHarness'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { EDITOR_DEFAULTS } from '../../../lib/editor/constants'

function Harness() {
  const { isReady } = useEditorCanvasContext()
  if (!isReady) return null
  return <NewCanvasDialog />
}

async function renderDialog() {
  useEditorStore.setState({
    isNewDocumentDialogOpen: true,
    hasDocument: false,
    documentWidth: EDITOR_DEFAULTS.CANVAS_WIDTH,
    documentHeight: EDITOR_DEFAULTS.CANVAS_HEIGHT,
  })
  render(
    <CanvasTestProvider>
      <Harness />
    </CanvasTestProvider>,
  )
  await screen.findByRole('heading', { name: /create new document/i })
}

beforeEach(() => {
  useEditorStore.setState({
    isNewDocumentDialogOpen: false,
    hasDocument: false,
    documentWidth: EDITOR_DEFAULTS.CANVAS_WIDTH,
    documentHeight: EDITOR_DEFAULTS.CANVAS_HEIGHT,
  })
})

describe('NewCanvasDialog', () => {
  it('lists the canvas presets from the shared constants', async () => {
    await renderDialog()
    expect(screen.getByText('Instagram Post')).toBeInTheDocument()
    expect(screen.getByText('Instagram Story')).toBeInTheDocument()
    expect(screen.getByText('YouTube Thumbnail')).toBeInTheDocument()
  })

  it('selecting a preset fills in its width and height', async () => {
    const user = userEvent.setup()
    await renderDialog()

    await user.click(screen.getByText('Instagram Post'))

    expect(screen.getByLabelText('Width')).toHaveValue(1080)
    expect(screen.getByLabelText('Height')).toHaveValue(1080)
  })

  it('rejects dimensions over the maximum with an inline error and does not create a document', async () => {
    const user = userEvent.setup()
    await renderDialog()

    // NumberInput clamps to its own `min`, so the only way to reach the
    // dialog's own validateCanvasDimensions() error path through this UI is
    // to exceed the (unclamped) maximum, not go below the minimum.
    const widthInput = screen.getByLabelText('Width')
    await user.clear(widthInput)
    await user.type(widthInput, '999999')
    await user.tab()
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(await screen.findByText(/must not exceed/i)).toBeInTheDocument()
    expect(useEditorStore.getState().hasDocument).toBe(false)
  })

  it('creating a valid document updates the document store and closes the dialog', async () => {
    const user = userEvent.setup()
    await renderDialog()

    await user.click(screen.getByText('Instagram Post'))
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(useEditorStore.getState().hasDocument).toBe(true)
      expect(useEditorStore.getState().documentWidth).toBe(1080)
      expect(useEditorStore.getState().documentHeight).toBe(1080)
      expect(useEditorStore.getState().isNewDocumentDialogOpen).toBe(false)
    })
  })
})
