# Artboard Editor

A browser-based photo and graphic design editor — image adjustments and cropping, text, shapes (freehand drawing, an anchor-point pen tool, and gradient fills), effects (drop shadows, blend modes), clipping masks, layers, drag-time snapping, multi-page documents, undo/redo, zoom/pan, and PNG/JPEG/SVG/PDF export, built on React 19, TypeScript, Zustand, and Fabric.js.

## Architecture

```
React components  →  Zustand stores (app state)  →  Editor commands (lib/fabric/*)  →  Fabric.js canvas
```

Fabric.js owns rendering, hit-testing, and object transforms. React/Zustand owns application state (active tool, dialogs, document metadata, selection, undo/redo). The two are joined at a single, deliberately narrow point:

- **`lib/editor/EditorCanvasContext.tsx`** holds the one `fabric.Canvas` instance for the app, in a ref (`canvasRef`), plus the undo/redo snapshot stack (`historyRef`) and every page's content while it isn't the live canvas's (`pagesRef` — see "Multi-page documents" below). This is the *only* place a `Canvas` is constructed or disposed (in `components/editor/canvas/CanvasEditor.tsx`).
- Nothing else touches `canvas.add(...)`, `canvas.remove(...)`, etc. directly. All Fabric mutations go through **`lib/fabric/*`** — small, testable functions like `addText()`, `addImageFromUrl()`, `alignObjects()`, `applyAdjustments()`. Components call these through hooks, never the raw Fabric API.
- React state (Zustand, `stores/editor/*`) mirrors *just enough* of the canvas to drive the UI: which tool is active, which object id(s) are selected, whether undo/redo is available, zoom level, document dimensions. It never stores Fabric object instances.

### Fabric ⇄ React sync

`CanvasEditor.tsx` is the one place that listens to Fabric's events (`selection:*`, `object:added/removed/modified`) and translates them into store updates — `selectionStore.setSelection(...)`, `editorStore.bumpObjectsVersion()`, and a history snapshot push. Everything downstream (panels, layers list, position/size readouts) reacts to those store changes rather than polling the canvas.

Because reading a Fabric ref during React's render phase is unsafe (the value can change without React knowing), hooks like `useSelectedObject` and `useLayers` don't compute derived data in `useMemo`. They recompute it as local state whenever the relevant store version counter changes, so the read only ever happens outside of render (see the comments in those files for why).

### Non-destructive image adjustments

Each image object carries a plain `adjustments` object (brightness, contrast, saturation, hue, exposure, blur, opacity, and boolean filter toggles). `lib/fabric/filters.ts#buildFilterPipeline` rebuilds the entire Fabric filter array from that object *from scratch* every time — it never appends to `image.filters`. This is what makes repeated slider changes non-destructive: there's no compounding, because each change discards the previous filter pipeline and rebuilds a new one from the stored values.

### Undo/redo

`useEditorHistory` keeps a single array of serialized document snapshots plus a cursor (not two separate undo/redo stacks) in `historyRef` — shared across every component that calls the hook, since the array itself lives in context, not in a component-local ref. `pushState()` captures a snapshot and truncates anything after the cursor (the standard "branch is discarded once you make a new change after undoing" behavior). Continuous interactions (slider drags) call the debounced `commitHistory()` instead of `pushState()` directly, so dragging brightness from 0 to 50 produces one history entry, not fifty.

### Document space vs. zoom-scaled canvas size — a gotcha

`useCanvasZoom`'s `applyCanvasZoom` resizes the actual canvas element to `documentSize * zoom` so the artboard visually shrinks/grows to fit its container. That means **`canvas.getWidth()`/`getHeight()`/`getCenterPoint()` return the zoom-scaled size, not the true document size** — anything that places or measures objects in document space (adding text/images/shapes at "canvas center", fitting an image, serializing width/height for undo/redo or save) must use `lib/fabric/canvas.ts#getDocumentDimensions(canvas)` instead, which divides back out by the current zoom. Using the raw getters here is an easy mistake that only shows up as a visible offset once zoom isn't 100% — every such call site in this codebase has a comment pointing back here.

### Clipping masks: relative positioning, and a multi-selection gotcha

The clip clone is positioned **relative to the content object** (`clipPath.absolutePositioned` is left `false`, the default), converted from canvas/world space into the content object's local space with Fabric's `util.sendObjectToPlane(maskClone, undefined, contentObject.calcTransformMatrix())`. This is what makes the mask travel with the content object — move, rotate, or scale it and the clip goes right along, instead of staying pinned to the canvas position it was created at (which `absolutePositioned: true` would do, and which is *not* what a "clipping mask" should feel like). `releaseClippingMask` does the reverse conversion (`sendObjectToPlane(restored, contentObject.calcTransformMatrix(), undefined)`) to hand the shape back as an independent, canvas-space object.

Separately: `applyClippingMask` is invoked right after the user multi-selects two objects, which means both are still parented under Fabric's `ActiveSelection` (a temporary group) at that moment — a group rewrites its children's `left`/`top` to be group-relative. Cloning the mask object before clearing that selection captures the wrong (group-relative) position. `applyClippingMask` calls `canvas.discardActiveObject()` *first*, before reading/cloning anything, to guard against this — see `clipping.test.ts`'s regression tests for both failure modes.

### Gradient fills

Shape/text `fill` is a `FillValue` (`types/fill.ts`) — `{ type: 'solid', color }` or `{ type: 'gradient', gradientType, angle, stops }` — not a raw Fabric fill. `lib/fabric/fill.ts#fillValueToFabricFill`/`fabricFillToFillValue` are the only conversion boundary between that shape and a Fabric `string | Gradient`. Gradient coords are computed in the object's own unscaled local box, so a gradient stays proportional across resize with no extra hook. Stroke and text-background stay solid-only strings — `ColorPicker`'s prop contract (`value: string`) is unchanged and still backs those three call sites; `FillPicker` (Solid/Gradient tabs) is the separate component used only where a `FillValue` is involved. Fabric's own `toObject()`/`loadFromJSON()` already round-trip `Gradient` instances, so no `CUSTOM_PROPERTIES` entry was needed for this.

### Effects (shadow, blend mode) and drag-time snapping

`lib/fabric/shadow.ts` rebuilds a fresh `Shadow` instance from the full patched props every call (mirrors `filters.ts#buildFilterPipeline`'s non-destructive rebuild — never mutates in place) and reads/writes `object.globalCompositeOperation` for blend mode. Both are core Fabric object state, so — like gradients — neither needed a `CUSTOM_PROPERTIES` change.

`lib/fabric/snapping.ts` is pure geometry (no Fabric import) computing a snap offset + guide lines from the dragging object's bounding rect against grid lines and/or other objects' edges/centers. It's wired into `CanvasEditor.tsx`'s `object:moving` listener via `useSnapping()`; the guide lines themselves render as a sibling SVG overlay (`SnapGuidesOverlay.tsx`), not temporary Fabric objects — adding/removing Fabric objects on every drag tick would spam `object:added`/`object:removed` (and thus `pushState()`) and leak untagged objects into `getObjects()`-based logic like the layers panel.

### Multi-page documents

A document is a `pages: PageRecord[]` array (`types/editor.ts`) plus `activePageId` — all pages share one canvas size. Only the active page's content is ever actually loaded onto the single live Fabric canvas; every other page's serialized objects sit in `pagesRef` (`lib/editor/EditorCanvasContext.tsx`), the same "heavy data in a ref, thin reactive mirror in a store" split `historyRef`/`historyStore` already uses — the mirror here is `stores/editor/pagesStore.ts`, feeding the page-navigator filmstrip (`PageNavigator.tsx`).

`lib/fabric/pages.ts#switchToPage` syncs the outgoing page's objects out of the live canvas, then loads the target page in (`canvas.clear()` + `loadFromJSON`). **Gotcha:** that clear/load fires `object:added`/`object:removed` per object *while `pagesRef.activePageId` still points at the outgoing page* — left unguarded, `CanvasEditor`'s listeners turn those into `pushState()`/`bumpObjectsVersion()` calls that attribute the transitional, half-swapped canvas to the wrong page's record. `usePages.ts`'s `switchPage`/`removePage` guard the swap with `historyRef.current.isRestoring = true` (the same flag `useEditorHistory.restore()` uses for undo/redo) and resync selection/version once afterward, rather than letting the per-object events drive it.

Undo/redo stays **global across all pages**, not per-page: `serializeDocument`/`deserializeDocument` (`lib/fabric/serialization.ts`) operate on the whole `pagesRef`, not just the active page's objects, so a single `pushState()` can undo a page add/delete/reorder too. This is a deliberate scale tradeoff for the page counts these documents actually have (a handful to a few dozen), not hundreds.

Page thumbnails (`renderPageThumbnail`) are a UI-only cache — rendered via a short-lived offscreen `StaticCanvas`, kept in `PageNavigator`'s local component state, and never persisted in the document JSON or `pagesRef`.

### Export (PNG/JPEG/SVG/PDF)

`lib/fabric/export.ts#exportCanvasToBlob` covers the current page's PNG/JPEG/SVG — SVG's `<svg width/height>` default to the zoom-scaled canvas element size exactly like `getWidth()`/`getHeight()`, so it goes through `getDocumentDimensions()` too. PDF export is a *separate*, whole-document concern (`lib/fabric/pdfExport.ts#exportDocumentToPDF`, exposed as `useEditorExport`'s `exportPDF`, not `exportImage`) — it iterates every page onto the same live canvas in turn (reusing `loadPageIntoCanvas`) and assembles a multi-page PDF via `jspdf`, loaded with a dynamic `import()` so it doesn't bloat the main bundle for users who never export one.

### Pen tool (anchor-point path drawing)

The pen tool is the one custom canvas interaction that isn't reacting to Fabric's own object events — it needs raw `mouse:down`/`mouse:move`/`mouse:up`/`mouse:dblclick` listeners, added in `CanvasEditor.tsx`'s existing mount-once effect (same rule as every other listener: one place calls `canvas.on(...)`). `usePenTool.ts`'s mouse handlers read `useEditorStore.getState().isPenToolActive` fresh at call time rather than a reactive selector — the exact same reasoning as `useSnapping.ts`'s `handleObjectMoving` — since the registration effect runs once and would otherwise close over a stale flag. Fabric's pointer events hand you `scenePoint`, already in document/object space (inverse-transformed through the viewport), so none of the usual zoom-gotcha handling applies to reading a click position.

`lib/fabric/penTool.ts#buildPathData` is pure (no Fabric import) and builds the SVG path `d` string from placed anchor points: a cubic bezier whose control points coincide with its own endpoints is mathematically a straight line, so a plain click and a click-dragged (curved) point share one code path, no separate branching needed. The live preview is a `Path` object rebuilt from scratch on every point/drag/hover update (`refreshPreview`) — same non-destructive-rebuild rule as `filters.ts`/`shadow.ts`, since Fabric has no clean way to mutate a `Path`'s data in place. The session — preview path, anchor-point markers, `canvas.selection`/`skipTargetFind` toggling — is scaffolding, not document content, guarded by `historyRef.current.isRestoring` for its duration exactly like crop mode (`useImageCrop.ts`) already does. A finished path is tagged with the existing `'path'` `EditorObjectType` (shared with freehand-drawn paths), so it gets fill/stroke/effects controls for free with no `PropertiesPanel.tsx` changes.

### Non-negotiable boundaries

- The Fabric canvas instance is never stored in Zustand.
- Components never call Fabric APIs directly — only through `lib/fabric/*`.
- Object identity (for selection/layers/lookup) is a custom `id` property tagged onto every object via `tagObject()`, independent of Fabric's own z-order array.

## Project structure

```
src/
  pages/                     Home and Editor routes
  components/editor/         Editor.tsx (shell) + layout (Header/Sidebar/PropertiesPanel/StatusBar)
    canvas/                  CanvasEditor (owns the Fabric instance), CanvasContainer, Zoom/Snapping/CanvasControls, PageNavigator, SnapGuidesOverlay
    panels/                  Upload/Text/Shapes/Adjustments/Layers/Background — left-rail + contextual content
    objects/                 Position/Size/Rotation/Text/Image/Shape/Effects controls, Alignment, Clipping mask, Crop mode
    dialogs/                 NewCanvasDialog, ExportDialog
  components/common/         Design system: Button, IconButton, Slider, ColorPicker, FillPicker, GradientStopEditor, ColorSwatchGrid, Select, Modal, Tabs, NumberInput, Tooltip
  hooks/editor/               One hook per concern — see below
  stores/editor/              editorStore (document/tool/dialogs), canvasStore (zoom/background/snapping), selectionStore, historyStore, pagesStore, paletteStore
  lib/fabric/                 The only code that touches the Fabric API (incl. pages.ts, pdfExport.ts, fill.ts, shadow.ts, snapping.ts)
  lib/editor/                 Constants, defaults, validation, the canvas/history/pages React context
  lib/utils/                  Pure, unit-tested helpers (scaling math, color, eyedropper)
  types/                      Shared TypeScript types
```

## Extending the editor

### Add a new object type

1. Add the type to `EditorObjectType` in `types/objects.ts`.
2. Add a constructor function in `lib/fabric/` (mirror `text.ts`/`images.ts`) that creates the Fabric object and calls `tagObject(object, { name, type })` to assign it an id.
3. Add an icon mapping entry in `LayersPanel.tsx`'s `TYPE_ICON` map.
4. If it needs its own properties panel, add a component under `components/editor/objects/` and wire it into `PropertiesPanel.tsx`'s `objectType` switch.

### Add a new image filter

Add a case to `buildFilterPipeline()` in `lib/fabric/filters.ts` that pushes a `fabric.filters.*` instance when the relevant `AdjustmentValues` field is set, then add the field to `AdjustmentValues` (`types/objects.ts`) and its default in `createDefaultAdjustments()` (`lib/editor/defaults.ts`). Add the control (slider or toggle button) in `AdjustmentsPanel.tsx` — it already reads/writes through `useImageAdjustments()`, so no other wiring is needed.

### Add a new panel

Create a component under `components/editor/panels/`, add it to the `PANELS` map in `EditorSidebar.tsx` (left rail) and/or `EDITOR_TOOL` union in `types/editor.ts` if it needs its own rail icon, or embed it directly in `PropertiesPanel.tsx` if it's contextual to a selection.

### Add a new keyboard shortcut

All shortcuts live in one place: `hooks/editor/useKeyboardShortcuts.ts`. Add a branch to the `handleKeyDown` listener; check `isTypingInField(event.target)` first (already done at the top of the handler) so you don't hijack typing in a text field or an in-progress Fabric text edit.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck (tsc -b) + production build
npm run lint      # eslint
npm test          # vitest (unit, hook, and component tests)
```

Tests are colocated with the code they cover (`*.test.ts`/`*.test.tsx`). Hook and component tests that need a live canvas use `src/test/canvasTestHarness.tsx`, which mounts a real (headless) `fabric.Canvas` inside `EditorCanvasProvider` — Fabric's object/serialization APIs work fine under jsdom without a canvas rendering backend, so these are real integration tests, not mocks.

## Deliberately out of scope for this pass

Icon/SVG library, post-creation anchor/handle editing on a finished path (the pen tool — see "Pen tool" above — places straight or curved segments while drawing, but a path can't be reshaped afterward except through the normal fill/stroke/effects controls any shape gets), boolean shape operations, persistent user-placed ruler guides (drag-time smart/grid snapping is implemented — see "Effects and drag-time snapping" above; a *saved*, document-persisted guide line is not), per-page custom canvas sizes (all pages in a document share one size), templates/starter galleries, saved component/symbol reuse, cloud save, auth, real-time collaboration, and AI features are not implemented. The object-type union, command layer, and store boundaries are structured so these can be added incrementally without a rewrite — see "Extending the editor" above.
