import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { Select } from '../../common/Select'
import { ColorPicker } from '../../common/ColorPicker'
import { FillPicker } from '../../common/FillPicker'
import { Slider } from '../../common/Slider'
import { IconButton } from '../../common/IconButton'
import { NumberInput } from '../../common/NumberInput'
import { useTextControls } from '../../../hooks/editor/useTextControls'
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '../../../lib/editor/constants'
import type { TextAlign } from '../../../types/objects'

const ALIGN_OPTIONS: { value: TextAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: 'left', icon: AlignLeft, label: 'Align left' },
  { value: 'center', icon: AlignCenter, label: 'Align center' },
  { value: 'right', icon: AlignRight, label: 'Align right' },
  { value: 'justify', icon: AlignJustify, label: 'Justify' },
]

export function TextObjectControls() {
  const { hasText, textProps, updateText } = useTextControls()
  if (!hasText) return null

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Font Family"
        value={textProps.fontFamily}
        options={AVAILABLE_FONTS.map((font) => ({ value: font, label: font }))}
        onChange={(fontFamily) => updateText({ fontFamily })}
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Size" value={textProps.fontSize} min={4} max={400} onCommit={(fontSize) => updateText({ fontSize })} />
        <Select
          label="Weight"
          value={String(textProps.fontWeight)}
          options={FONT_WEIGHTS.map((w) => ({ value: String(w.value), label: w.label }))}
          onChange={(value) => updateText({ fontWeight: Number(value) })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-text-secondary">Style</span>
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Bold className="h-4 w-4" />}
            label="Bold"
            active={textProps.fontWeight >= 700}
            onClick={() => updateText({ fontWeight: textProps.fontWeight >= 700 ? 400 : 700 })}
          />
          <IconButton
            icon={<Italic className="h-4 w-4" />}
            label="Italic"
            active={textProps.fontStyle === 'italic'}
            onClick={() => updateText({ fontStyle: textProps.fontStyle === 'italic' ? 'normal' : 'italic' })}
          />
          <IconButton
            icon={<Underline className="h-4 w-4" />}
            label="Underline"
            active={textProps.underline}
            onClick={() => updateText({ underline: !textProps.underline })}
          />
          <IconButton
            icon={<Strikethrough className="h-4 w-4" />}
            label="Strikethrough"
            active={textProps.linethrough}
            onClick={() => updateText({ linethrough: !textProps.linethrough })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-text-secondary">Alignment</span>
        <div className="flex items-center gap-1">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <IconButton
              key={value}
              icon={<Icon className="h-4 w-4" />}
              label={label}
              active={textProps.textAlign === value}
              onClick={() => updateText({ textAlign: value })}
            />
          ))}
        </div>
      </div>

      <FillPicker label="Text Color" value={textProps.fill} onChange={(fill) => updateText({ fill })} />
      <ColorPicker
        label="Background Color"
        value={textProps.backgroundColor || 'transparent'}
        onChange={(backgroundColor) => updateText({ backgroundColor })}
        allowTransparent
      />

      <Slider
        label="Letter Spacing"
        value={textProps.charSpacing}
        min={-50}
        max={800}
        onChange={(charSpacing) => updateText({ charSpacing })}
      />
      <Slider
        label="Line Height"
        value={Math.round(textProps.lineHeight * 100)}
        min={50}
        max={300}
        formatValue={(v) => (v / 100).toFixed(2)}
        onChange={(v) => updateText({ lineHeight: v / 100 })}
      />
    </div>
  )
}
