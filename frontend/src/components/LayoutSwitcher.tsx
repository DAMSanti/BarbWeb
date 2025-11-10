import { useAppStore } from '../store/appStore'
import { LayoutType } from '../types'

export default function LayoutSwitcher() {
  const { layout, setLayout } = useAppStore()

  const layouts: { value: LayoutType; label: string }[] = [
    { value: 'classic', label: 'Clásico' },
    { value: 'minimalist', label: 'Minimalista' },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
      <label className="text-sm font-semibold text-white/70">Diseño:</label>
      <div className="flex flex-col gap-2">
        {layouts.map((layoutOption) => (
          <button
            key={layoutOption.value}
            onClick={() => setLayout(layoutOption.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
              layout === layoutOption.value
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {layoutOption.label}
          </button>
        ))}
      </div>
    </div>
  )
}
