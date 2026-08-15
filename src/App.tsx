import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

// Fabric.js is a large dependency — keep it out of the initial bundle until
// the user actually navigates into the editor.
const EditorPage = lazy(() => import('./pages/EditorPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-surface-0 text-sm text-text-secondary">Loading editor…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
