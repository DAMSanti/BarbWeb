export type ThemeId = 'nocturne'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  description: string
  previewClass: string
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'nocturne',
    name: 'Carbón Sofisticado',
    description: 'Tonos grises oscuros con detalles dorados y acabado profesional.',
    previewClass: 'bg-gradient-to-br from-gray-950 via-slate-800 to-black'
  }
]

export const DEFAULT_THEME_ID: ThemeId = 'nocturne'

const THEME_MAP = new Map<ThemeId, ThemeDefinition>(THEMES.map((theme) => [theme.id, theme]))

export function getThemeDefinition(theme: ThemeId): ThemeDefinition {
  return THEME_MAP.get(theme) ?? THEME_MAP.get(DEFAULT_THEME_ID)!
}

export const THEME_CLASSNAMES = THEMES.map((theme) => `theme-${theme.id}`)
