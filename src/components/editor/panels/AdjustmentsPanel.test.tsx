import { useEffect } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FabricImage } from 'fabric'
import { AdjustmentsPanel } from './AdjustmentsPanel'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useSelectionStore } from '../../../stores/editor/selectionStore'
import { tagObject } from '../../../lib/fabric/objects'
import { createDefaultAdjustments } from '../../../lib/editor/defaults'
import { getImageAdjustments, type EditorImageObject } from '../../../lib/fabric/images'
import { CanvasTestProvider } from '../../../test/canvasTestHarness'

let capturedImage: EditorImageObject | null = null

function makeImageSource(): HTMLCanvasElement {
  const source = document.createElement('canvas')
  source.width = 50
  source.height = 50
  return source
}

/** Seeds a single selected image object (bypassing async URL loading) and renders AdjustmentsPanel. */
function SeededAdjustmentsPanel() {
  const { isReady, canvasRef } = useEditorCanvasContext()

  useEffect(() => {
    if (!isReady) return
    const canvas = canvasRef.current!
    const image = tagObject(new FabricImage(makeImageSource()), { name: 'Photo', type: 'image' }) as EditorImageObject
    image.adjustments = createDefaultAdjustments()
    canvas.add(image)
    canvas.setActiveObject(image)
    capturedImage = image
    useSelectionStore.getState().setSelection({ ids: [image.id], type: 'single', objectType: 'image' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  if (!isReady) return null
  return <AdjustmentsPanel />
}

async function renderPanel() {
  render(
    <CanvasTestProvider>
      <SeededAdjustmentsPanel />
    </CanvasTestProvider>,
  )
  await screen.findByText('Adjustments')
}

describe('AdjustmentsPanel', () => {
  it('renders nothing when no image is selected', async () => {
    function Harness() {
      const { isReady } = useEditorCanvasContext()
      if (!isReady) return null
      return <AdjustmentsPanel />
    }
    const { container } = render(
      <CanvasTestProvider>
        <Harness />
      </CanvasTestProvider>,
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(container.textContent).toBe('')
  })

  it('shows adjustment sliders and toggleable filters for a selected image', async () => {
    await renderPanel()
    expect(screen.getByText('Brightness')).toBeInTheDocument()
    expect(screen.getByText('Contrast')).toBeInTheDocument()
    expect(screen.getByText('Grayscale')).toBeInTheDocument()
    expect(screen.getByText('Sepia')).toBeInTheDocument()
  })

  it('toggling Grayscale applies the filter to the image non-destructively', async () => {
    const user = userEvent.setup()
    await renderPanel()

    await user.click(screen.getByText('Grayscale'))

    expect(getImageAdjustments(capturedImage!).grayscale).toBe(true)
    expect(capturedImage!.filters.length).toBeGreaterThan(0)

    await user.click(screen.getByText('Grayscale'))
    expect(getImageAdjustments(capturedImage!).grayscale).toBe(false)
    expect(capturedImage!.filters.length).toBe(0)
  })

  it('Reset restores every adjustment to its default value', async () => {
    const user = userEvent.setup()
    await renderPanel()

    await user.click(screen.getByText('Grayscale'))
    await user.click(screen.getByText('Sepia'))
    expect(getImageAdjustments(capturedImage!).grayscale).toBe(true)

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(getImageAdjustments(capturedImage!)).toEqual(createDefaultAdjustments())
  })
})
