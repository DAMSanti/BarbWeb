export type ThemeId = 'classic' | 'minimal' | 'royal' | 'nocturne' | 'avantgarde'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  description: string
  previewClass: string
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'classic',
    name: 'Clásico Ejecutivo',
    description: 'Gradientes oscuros con destellos dorados y enfoque corporativo.',
    previewClass: 'bg-gradient-to-br from-dark-500 via-dark-600 to-dark-700'
  },
  {
    id: 'minimal',
    name: 'Oscuro Elegante',
    description: 'Negro profundo con dorado sutil y líneas limpias minimalistas.',
    previewClass: 'bg-gradient-to-br from-black via-slate-900 to-gray-950'
  },
  {
    id: 'royal',
    name: 'Oro Real',
    description: 'Fondo negro intenso con brillos metálicos y elegancia premium.',
    previewClass: 'bg-gradient-to-br from-black via-dark-700 to-primary-600'
  },
  {
    id: 'nocturne',
    name: 'Carbón Sofisticado',
    description: 'Tonos grises oscuros con detalles dorados y acabado profesional.',
    previewClass: 'bg-gradient-to-br from-gray-950 via-slate-800 to-black'
  },
  {
    id: 'avantgarde',
    name: 'Nocturno Premium',
    description: 'Degradado negro a gris oscuro con acentos dorados estratégicos.',
    previewClass: 'bg-gradient-to-br from-slate-950 via-gray-900 to-black'
  }
]

export const DEFAULT_THEME_ID: ThemeId = 'classic'

const THEME_MAP = new Map<ThemeId, ThemeDefinition>(THEMES.map((theme) => [theme.id, theme]))

export function getThemeDefinition(theme: ThemeId): ThemeDefinition {
  return THEME_MAP.get(theme) ?? THEME_MAP.get(DEFAULT_THEME_ID)!
}

export const THEME_CLASSNAMES = THEMES.map((theme) => `theme-${theme.id}`)
