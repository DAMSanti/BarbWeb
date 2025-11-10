import { useAppStore } from '../store/appStore'
import { LayoutType } from '../types'
import { ThemeId } from '../theme/themes'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function StyleSwitcher() {
  const { layout, setLayout, theme, setTheme } = useAppStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const layouts: { value: LayoutType; label: string }[] = [
    { value: 'classic', label: 'Clásico' },
    { value: 'minimalist', label: 'Minimalista' },
  ]

  const themes: { value: ThemeId; label: string }[] = [
    { value: 'nocturne', label: 'Carbón Sofisticado' },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div
        className={`flex flex-col gap-2 transition-all duration-300 ${
          isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Selector de Diseño */}
        <div className="p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
          <label className="text-xs font-semibold text-white/60 block mb-2">Diseño</label>
          <div className="flex flex-col gap-1">
            {layouts.map((layoutOption) => (
              <button
                key={layoutOption.value}
                onClick={() => setLayout(layoutOption.value)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs ${
                  layout === layoutOption.value
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {layoutOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Tema */}
        <div className="p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
          <label className="text-xs font-semibold text-white/60 block mb-2">Tema</label>
          <div className="flex flex-col gap-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs ${
                  theme === themeOption.value
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute bottom-0 left-0 p-3 rounded-xl backdrop-blur-md bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-xl transition-all duration-300 hover:shadow-2xl ${
          isExpanded ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
        title={isExpanded ? 'Cerrar' : 'Personalizar estilos'}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold">Estilos</div>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>
    </div>
  )
}
