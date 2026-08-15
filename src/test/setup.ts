import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement ResizeObserver, but Radix primitives (Slider, etc.) use it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).ResizeObserver ??= ResizeObserverStub

// jsdom doesn't implement pointer capture APIs used by Radix Slider/Select.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
}
