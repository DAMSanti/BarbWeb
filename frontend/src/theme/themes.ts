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
    name: 'Minimal Luminoso',
    description: 'Diseño claro con abundante espacio en blanco y acentos oro.',
    previewClass: 'bg-gradient-to-br from-white via-primary-50 to-white'
  },
  {
    id: 'royal',
    name: 'Oro Real',
    description: 'Fondo negro intenso con brillos metálicos y elegancia premium.',
    previewClass: 'bg-gradient-to-br from-black via-dark-700 to-primary-600'
  },
  {
    id: 'nocturne',
    name: 'Nocturno Urbano',
    description: 'Ambientación nocturna con luces suaves y contraste moderno.',
    previewClass: 'bg-gradient-to-br from-dark-900 via-dark-700 to-gray-800'
  },
  {
    id: 'avantgarde',
    name: 'Avant-Garde',
    description: 'Diseño geométrico con bloques dorados y tipografía contemporánea.',
    previewClass: 'bg-gradient-to-br from-primary-500 via-primary-700 to-dark-500'
  }
]

export const DEFAULT_THEME_ID: ThemeId = 'classic'

const THEME_MAP = new Map<ThemeId, ThemeDefinition>(THEMES.map((theme) => [theme.id, theme]))

export function getThemeDefinition(theme: ThemeId): ThemeDefinition {
  return THEME_MAP.get(theme) ?? THEME_MAP.get(DEFAULT_THEME_ID)!
}

export const THEME_CLASSNAMES = THEMES.map((theme) => `theme-${theme.id}`)
