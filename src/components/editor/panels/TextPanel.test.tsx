import { useEffect } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textbox, type Canvas } from 'fabric'
import { TextPanel } from './TextPanel'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { CanvasTestProvider } from '../../../test/canvasTestHarness'

let capturedCanvas: Canvas | null = null

function Harness() {
  const { isReady, canvasRef } = useEditorCanvasContext()
  useEffect(() => {
    capturedCanvas = canvasRef.current
  })
  if (!isReady) return null
  return <TextPanel />
}

async function renderPanel() {
  render(
    <CanvasTestProvider>
      <Harness />
    </CanvasTestProvider>,
  )
  await screen.findByRole('button', { name: /add text/i })
}

describe('TextPanel', () => {
  it('adds a selected textbox to the canvas when "Add Text" is clicked', async () => {
    const user = userEvent.setup()
    await renderPanel()

    await user.click(screen.getByRole('button', { name: /add text/i }))

    const objects = capturedCanvas!.getObjects()
    expect(objects).toHaveLength(1)
    expect(objects[0]).toBeInstanceOf(Textbox)
    expect((objects[0] as Textbox).text).toBe('Type something...')
    expect(capturedCanvas!.getActiveObject()).toBe(objects[0])
  })

  it('offers Heading/Subheading/Body text presets', async () => {
    await renderPanel()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Subheading')).toBeInTheDocument()
    expect(screen.getByText('Body text')).toBeInTheDocument()
  })

  it('clicking the Heading preset creates a textbox with a large font size', async () => {
    const user = userEvent.setup()
    await renderPanel()

    await user.click(screen.getByText('Heading'))

    const objects = capturedCanvas!.getObjects()
    expect(objects).toHaveLength(1)
    expect((objects[0] as Textbox).fontSize).toBe(48)
    expect((objects[0] as Textbox).text).toBe('Add a heading')
  })
})
