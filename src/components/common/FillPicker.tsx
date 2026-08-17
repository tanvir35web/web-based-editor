import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
import { ColorPicker } from './ColorPicker'
import { GradientStopEditor } from './GradientStopEditor'
import { Slider } from './Slider'
import { cn } from '../../lib/utils/cn'
import type { FillValue, GradientType } from '../../types/fill'

interface FillPickerProps {
  label?: string
  value: FillValue
  onChange: (value: FillValue) => void
  allowTransparent?: boolean
}

const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
]

export function FillPicker({ label, value, onChange, allowTransparent }: FillPickerProps) {
  const switchToGradient = () => {
    if (value.type === 'gradient') return
    onChange({
      type: 'gradient',
      gradientType: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: value.color === 'transparent' ? '#ffffff' : value.color },
        { offset: 1, color: '#ffffff' },
      ],
    })
  }

  const switchToSolid = () => {
    if (value.type === 'solid') return
    onChange({ type: 'solid', color: value.stops[0]?.color ?? '#000000' })
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs text-text-secondary">{label}</span>}
      <Tabs value={value.type} onValueChange={(next) => (next === 'gradient' ? switchToGradient() : switchToSolid())}>
        <TabsList>
          <TabsTrigger value="solid">Solid</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="mt-2">
          <ColorPicker
            value={value.type === 'solid' ? value.color : '#000000'}
            onChange={(color) => onChange({ type: 'solid', color })}
            allowTransparent={allowTransparent}
          />
        </TabsContent>

        <TabsContent value="gradient" className="mt-2">
          {value.type === 'gradient' && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-1">
                {GRADIENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => onChange({ ...value, gradientType: type.value })}
                    className={cn(
                      'flex-1 rounded-md border px-2 py-1 text-xs font-medium',
                      value.gradientType === type.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-surface-border text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <GradientStopEditor stops={value.stops} onChange={(stops) => onChange({ ...value, stops })} />

              {value.gradientType === 'linear' && (
                <Slider
                  label="Angle"
                  value={value.angle}
                  min={0}
                  max={360}
                  onChange={(angle) => onChange({ ...value, angle })}
                  formatValue={(v) => `${v}°`}
                />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
