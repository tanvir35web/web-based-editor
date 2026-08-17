interface EyeDropperResult {
  sRGBHex: string
}

interface EyeDropperApi {
  open(): Promise<EyeDropperResult>
}

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperApi
  }
}

export function isEyeDropperSupported(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window
}

/** Returns null if unsupported or the user cancels the pick (no error thrown for cancellation). */
export async function pickColorFromScreen(): Promise<string | null> {
  if (!window.EyeDropper) return null
  try {
    const result = await new window.EyeDropper().open()
    return result.sRGBHex
  } catch {
    return null
  }
}
