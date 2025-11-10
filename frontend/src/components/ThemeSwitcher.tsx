import { THEMES, getThemeDefinition } from '../theme/themes'
import { useAppStore } from '../store/appStore'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }))

  return (
    <div className="theme-switcher">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="theme-switcher-heading">Selecciona el estilo a presentar</p>
          <p className="theme-switcher-description">Cambia entre propuestas visuales sin salir de la página.</p>
        </div>
        <p className="hidden sm:block text-xs uppercase tracking-widest font-semibold theme-switcher-badge">
          {getThemeDefinition(theme).name}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {THEMES.map((option) => {
          const isActive = option.id === theme
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`theme-option ${isActive ? 'theme-option-active' : ''}`}
            >
              <span className={`theme-option-preview ${option.previewClass}`} aria-hidden="true" />
              <span className="theme-option-name">{option.name}</span>
              <span className="theme-option-description">{option.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
