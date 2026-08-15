# Artboard Editor

A browser-based photo and graphic design editor — image adjustments and cropping, text, shapes (with freehand drawing), clipping masks, layers, undo/redo, zoom/pan, and PNG/JPEG export, built on React 19, TypeScript, Zustand, and Fabric.js.

## Architecture

```
React components  →  Zustand stores (app state)  →  Editor commands (lib/fabric/*)  →  Fabric.js canvas
```

Fabric.js owns rendering, hit-testing, and object transforms. React/Zustand owns application state (active tool, dialogs, document metadata, selection, undo/redo). The two are joined at a single, deliberately narrow point:

- **`lib/editor/EditorCanvasContext.tsx`** holds the one `fabric.Canvas` instance for the app, in a ref (`canvasRef`), plus the undo/redo snapshot stack (`historyRef`). This is the *only* place a `Canvas` is constructed or disposed (in `components/editor/canvas/CanvasEditor.tsx`).
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

### Non-negotiable boundaries

- The Fabric canvas instance is never stored in Zustand.
- Components never call Fabric APIs directly — only through `lib/fabric/*`.
- Object identity (for selection/layers/lookup) is a custom `id` property tagged onto every object via `tagObject()`, independent of Fabric's own z-order array.

## Project structure

```
src/
  pages/                     Home and Editor routes
  components/editor/         Editor.tsx (shell) + layout (Header/Sidebar/PropertiesPanel/StatusBar)
    canvas/                  CanvasEditor (owns the Fabric instance), CanvasContainer, Zoom/CanvasControls
    panels/                  Upload/Text/Shapes/Adjustments/Layers/Background/Export — left-rail + contextual content
    objects/                 Position/Size/Rotation/Text/Image/Shape controls, Alignment, Clipping mask, Crop mode
    dialogs/                 NewCanvasDialog, ExportDialog
  components/common/         Design system: Button, IconButton, Slider, ColorPicker, Select, Modal, Tabs, NumberInput, Tooltip
  hooks/editor/               One hook per concern — see below
  stores/editor/              editorStore (document/tool/dialogs), canvasStore (zoom/background), selectionStore, historyStore
  lib/fabric/                 The only code that touches the Fabric API
  lib/editor/                 Constants, defaults, validation, the canvas/history React context
  lib/utils/                  Pure, unit-tested helpers (scaling math, color)
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

Icon/SVG library, precise anchor-point bezier pen tool (freehand drawing via `PencilBrush` is implemented, see `lib/fabric/shapes.ts#startFreeDraw`), gradients/shadows/borders, blend modes, templates, multi-page/frames, rulers/guides/grid/snapping, cloud save, auth, real-time collaboration, and AI features are not implemented. The object-type union, command layer, and store boundaries are structured so these can be added incrementally without a rewrite — see "Extending the editor" above.
