import { useNavigate } from 'react-router-dom'
import { LayoutTemplate, ImagePlus } from 'lucide-react'
import { Button } from '../components/common/Button'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-surface-0 px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Artboard Editor</h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          A browser-based photo and graphic design editor. Start from a blank canvas or bring your own photo.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/editor', { state: { action: 'new' } })}>
          <LayoutTemplate className="h-4 w-4" />
          Create New
        </Button>
        <Button variant="secondary" onClick={() => navigate('/editor', { state: { action: 'upload' } })}>
          <ImagePlus className="h-4 w-4" />
          Upload Image
        </Button>
      </div>
    </div>
  )
}
