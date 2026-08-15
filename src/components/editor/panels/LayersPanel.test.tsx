import { useEffect } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Rect } from 'fabric'
import { LayersPanel } from './LayersPanel'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { tagObject } from '../../../lib/fabric/objects'
import { CanvasTestProvider } from '../../../test/canvasTestHarness'

function LayersPanelWhenReady() {
  const { isReady } = useEditorCanvasContext()
  if (!isReady) return null
  return <LayersPanel />
}

/** Seeds two layers directly on the canvas once it's ready, then renders LayersPanel. */
function SeededLayersPanel() {
  const { isReady, canvasRef } = useEditorCanvasContext()

  useEffect(() => {
    if (!isReady) return
    const canvas = canvasRef.current!
    const back = tagObject(new Rect({ width: 10, height: 10 }), { name: 'Background Shape', type: 'rect' })
    const front = tagObject(new Rect({ width: 10, height: 10 }), { name: 'Front Shape', type: 'rect' })
    canvas.add(back, front)
    useEditorStore.getState().bumpObjectsVersion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  if (!isReady) return null
  return <LayersPanel />
}

async function renderSeededPanel() {
  render(
    <CanvasTestProvider>
      <SeededLayersPanel />
    </CanvasTestProvider>,
  )
  await screen.findByText('Front Shape')
}

beforeEach(() => {
  useEditorStore.setState({ objectsVersion: 0 })
})

describe('LayersPanel', () => {
  it('shows an empty state when there are no objects', async () => {
    render(
      <CanvasTestProvider>
        <LayersPanelWhenReady />
      </CanvasTestProvider>,
    )
    expect(await screen.findByText(/no objects on the canvas/i)).toBeInTheDocument()
  })

  it('lists layers top-first (most recently added on top)', async () => {
    await renderSeededPanel()
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Front Shape')
    expect(items[1]).toHaveTextContent('Background Shape')
  })

  it('toggles visibility when the eye icon is clicked', async () => {
    const user = userEvent.setup()
    await renderSeededPanel()

    await user.click(screen.getAllByRole('button', { name: 'Hide layer' })[0])

    expect(await screen.findAllByRole('button', { name: 'Show layer' })).toHaveLength(1)
  })

  it('toggles lock state when the lock icon is clicked', async () => {
    const user = userEvent.setup()
    await renderSeededPanel()

    await user.click(screen.getAllByRole('button', { name: 'Lock layer' })[0])

    expect(await screen.findAllByRole('button', { name: 'Unlock layer' })).toHaveLength(1)
  })

  it('deletes a layer when the trash icon is clicked', async () => {
    const user = userEvent.setup()
    await renderSeededPanel()

    await user.click(screen.getAllByRole('button', { name: 'Delete layer' })[0])

    expect(screen.queryByText('Front Shape')).not.toBeInTheDocument()
    expect(screen.getByText('Background Shape')).toBeInTheDocument()
  })
})
