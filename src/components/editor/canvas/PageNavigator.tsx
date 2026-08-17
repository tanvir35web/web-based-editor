import { useEffect, useRef, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { usePages } from '../../../hooks/editor/usePages'
import { useEditorCanvasContext } from '../../../lib/editor/EditorCanvasContext'
import { useEditorStore } from '../../../stores/editor/editorStore'
import { renderPageThumbnail } from '../../../lib/fabric/pages'
import { IconButton } from '../../common/IconButton'
import { cn } from '../../../lib/utils/cn'

export function PageNavigator() {
  const { pages, activePageId, switchPage, addPage, duplicatePage, removePage, renamePage, reorderPage } = usePages()
  const { pagesRef } = useEditorCanvasContext()
  const documentWidth = useEditorStore((s) => s.documentWidth)
  const documentHeight = useEditorStore((s) => s.documentHeight)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const prevActiveId = useRef<string | null>(null)

  // Regenerate the thumbnail for whichever page we just switched away from —
  // that's the moment its pagesRef record is guaranteed up to date (see
  // switchToPage's sync-out-then-load-in order).
  useEffect(() => {
    const leftPageId = prevActiveId.current
    prevActiveId.current = activePageId
    if (!leftPageId || leftPageId === activePageId) return
    const page = pagesRef.current.pages.find((p) => p.id === leftPageId)
    if (!page) return
    void renderPageThumbnail(page, { width: documentWidth, height: documentHeight }).then((dataUrl) => {
      setThumbnails((prev) => ({ ...prev, [leftPageId]: dataUrl }))
    })
  }, [activePageId, pagesRef, documentWidth, documentHeight])

  const commitRename = () => {
    if (renamingId) renamePage(renamingId, renameDraft)
    setRenamingId(null)
  }

  const activeIndex = pages.findIndex((p) => p.id === activePageId)
  const activePage = pages[activeIndex]

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-t border-surface-border bg-surface-1 px-3">
      <div className="flex min-w-0 items-center gap-1">
        <IconButton
          size="sm"
          label="Previous page"
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
          disabled={activeIndex <= 0}
          onClick={() => pages[activeIndex - 1] && void switchPage(pages[activeIndex - 1].id)}
        />

        <PopoverPrimitive.Root open={listOpen} onOpenChange={setListOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-primary hover:bg-surface-2"
            >
              <span className="max-w-35 truncate font-medium">{activePage?.name ?? ''}</span>
              <span className="shrink-0 text-text-secondary">
                {activeIndex + 1}/{pages.length}
              </span>
              <ChevronUp className={cn('h-3 w-3 shrink-0 text-text-secondary transition-transform', listOpen && 'rotate-180')} />
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side="top"
              align="start"
              sideOffset={8}
              className="z-50 w-72 rounded-lg border border-surface-border bg-surface-1 p-2 shadow-2xl"
            >
              <div className="scroll-thin flex max-h-80 flex-col gap-0.5 overflow-y-auto">
                {pages.map((page, index) => {
                  const isActive = page.id === activePageId
                  return (
                    <div
                      key={page.id}
                      className={cn(
                        'group flex items-center gap-2 rounded-md p-1 text-xs',
                        isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => void switchPage(page.id)}
                        className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface-3"
                        aria-label={`Switch to ${page.name}`}
                      >
                        {thumbnails[page.id] ? (
                          <img src={thumbnails[page.id]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </button>

                      {renamingId === page.id ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          onFocus={(event) => event.target.select()}
                          onChange={(event) => setRenameDraft(event.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') commitRename()
                            if (event.key === 'Escape') setRenamingId(null)
                          }}
                          className="min-w-0 flex-1 rounded bg-surface-2 px-1 py-0.5 text-text-primary outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => void switchPage(page.id)}
                          onDoubleClick={() => {
                            setRenamingId(page.id)
                            setRenameDraft(page.name)
                          }}
                          className="min-w-0 flex-1 truncate text-left"
                        >
                          {page.name}
                        </button>
                      )}

                      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                        {index > 0 && (
                          <IconButton
                            size="sm"
                            showTooltip={false}
                            label="Move earlier"
                            icon={<ChevronUp className="h-3 w-3" />}
                            onClick={() => reorderPage(page.id, 'earlier')}
                          />
                        )}
                        {index < pages.length - 1 && (
                          <IconButton
                            size="sm"
                            showTooltip={false}
                            label="Move later"
                            icon={<ChevronDown className="h-3 w-3" />}
                            onClick={() => reorderPage(page.id, 'later')}
                          />
                        )}
                        <IconButton
                          size="sm"
                          showTooltip={false}
                          label="Duplicate page"
                          icon={<Copy className="h-3 w-3" />}
                          onClick={() => void duplicatePage(page.id)}
                        />
                        {pages.length > 1 && (
                          <IconButton
                            size="sm"
                            showTooltip={false}
                            label="Delete page"
                            icon={<Trash2 className="h-3 w-3" />}
                            onClick={() => void removePage(page.id)}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => void addPage()}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-surface-border py-1 text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              >
                <Plus className="h-3 w-3" />
                Add page
              </button>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        <IconButton
          size="sm"
          label="Next page"
          icon={<ChevronRight className="h-3.5 w-3.5" />}
          disabled={activeIndex < 0 || activeIndex >= pages.length - 1}
          onClick={() => pages[activeIndex + 1] && void switchPage(pages[activeIndex + 1].id)}
        />
      </div>

      <IconButton size="sm" label="Add page" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => void addPage()} />
    </div>
  )
}
