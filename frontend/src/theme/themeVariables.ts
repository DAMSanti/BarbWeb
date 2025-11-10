import { ThemeId } from './themes'

export interface ThemeVariables {
  bodyBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accentColor: string
  accentContrast: string
  accentSoft: string
  heroBg: string
  heroHighlight: string
  heroAccentA: string
  heroAccentB: string
  surfaceElevated: string
  surfaceMuted: string
  surfaceContrast: string
  borderColor: string
  cardBg: string
  cardBorder: string
  cardText: string
  cardIconBg: string
  cardIconColor: string
  sectionFeaturesBg: string
  sectionServicesBg: string
  sectionAboutBg: string
  ctaBg: string
  ctaTitle: string
  ctaText: string
  ctaButtonBg: string
  ctaButtonText: string
  ctaButtonHoverBg: string
  ctaButtonHoverText: string
  serviceCardBg: string
  serviceCardBorder: string
  serviceCardText: string
  serviceCardLink: string
  commitmentBg: string
  commitmentNumber: string
  commitmentText: string
  headerBg: string
  headerBorder: string
  headerText: string
  headerLink: string
  headerLinkHover: string
  headerContact: string
  headerContactHover: string
  logoMarkBg: string
  logoMarkIcon: string
  footerBg: string
  footerHeading: string
  footerText: string
  footerTextMuted: string
  footerLink: string
  footerLinkHover: string
  footerDivider: string
  footerCopy: string
  switcherBg: string
  switcherBorder: string
  switcherHeading: string
  switcherDescription: string
  switcherBadgeBg: string
  switcherBadgeColor: string
  themeOptionBg: string
  themeOptionBorder: string
  themeOptionActiveBorder: string
  themeOptionName: string
  themeOptionDescription: string
}

export const THEME_VARIABLES: Record<ThemeId, ThemeVariables> = {
  nocturne: {
    bodyBg: 'linear-gradient(120deg, #0f0f0f 0%, #1f1f1f 50%, #141414 100%)',
    textPrimary: '#f5f5f5',
    textSecondary: '#e0e0e0',
    textMuted: '#969696',
    accentColor: '#d4af37',
    accentContrast: '#0f0f0f',
    accentSoft: 'rgba(212, 175, 55, 0.14)',
    heroBg: 'linear-gradient(145deg, rgba(15, 15, 15, 0.97), rgba(31, 31, 31, 0.92))',
    heroHighlight: '#d4af37',
    heroAccentA: 'rgba(212, 175, 55, 0.28)',
    heroAccentB: 'rgba(80, 80, 80, 0.35)',
    surfaceElevated: 'rgba(35, 35, 35, 0.8)',
    surfaceMuted: 'rgba(35, 35, 35, 0.4)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(212, 175, 55, 0.16)',
    cardBg: 'rgba(25, 25, 25, 0.68)',
    cardBorder: 'rgba(212, 175, 55, 0.22)',
    cardText: '#e0e0e0',
    cardIconBg: 'rgba(212, 175, 55, 0.11)',
    cardIconColor: '#d4af37',
    sectionFeaturesBg: 'linear-gradient(135deg, rgba(10, 10, 10, 0.98), rgba(25, 25, 25, 0.94))',
    sectionServicesBg: 'linear-gradient(135deg, rgba(15, 15, 15, 0.96), rgba(10, 10, 10, 0.97))',
    sectionAboutBg: 'rgba(10, 10, 10, 0.97)',
    ctaBg: 'linear-gradient(120deg, #d4af37, #e5c158)',
    ctaTitle: '#0f0f0f',
    ctaText: '#1a1a1a',
    ctaButtonBg: '#1a1a1a',
    ctaButtonText: '#d4af37',
    ctaButtonHoverBg: '#2a2a2a',
    ctaButtonHoverText: '#e5c158',
    serviceCardBg: 'rgba(28, 28, 28, 0.82)',
    serviceCardBorder: 'rgba(212, 175, 55, 0.18)',
    serviceCardText: '#e0e0e0',
    serviceCardLink: '#d4af37',
    commitmentBg: 'linear-gradient(145deg, rgba(25, 25, 25, 0.88), rgba(10, 10, 10, 0.94))',
    commitmentNumber: '#d4af37',
    commitmentText: '#e0e0e0',
    headerBg: 'rgba(10, 10, 10, 0.96)',
    headerBorder: 'rgba(212, 175, 55, 0.16)',
    headerText: '#f5f5f5',
    headerLink: '#e0e0e0',
    headerLinkHover: '#d4af37',
    headerContact: 'rgba(212, 175, 55, 0.14)',
    headerContactHover: 'rgba(212, 175, 55, 0.28)',
    logoMarkBg: 'rgba(212, 175, 55, 0.14)',
    logoMarkIcon: '#d4af37',
    footerBg: 'rgba(8, 8, 8, 0.97)',
    footerHeading: '#f5f5f5',
    footerText: '#d5d5d5',
    footerTextMuted: '#8b8b8b',
    footerLink: '#d4af37',
    footerLinkHover: '#e5c158',
    footerDivider: 'rgba(212, 175, 55, 0.18)',
    footerCopy: '#8b8b8b',
    switcherBg: 'rgba(25, 25, 25, 0.78)',
    switcherBorder: 'rgba(212, 175, 55, 0.18)',
    switcherHeading: '#f5f5f5',
    switcherDescription: '#d5d5d5',
    switcherBadgeBg: 'rgba(212, 175, 55, 0.11)',
    switcherBadgeColor: '#d4af37',
    themeOptionBg: 'rgba(18, 18, 18, 0.9)',
    themeOptionBorder: 'rgba(212, 175, 55, 0.14)',
    themeOptionActiveBorder: 'rgba(212, 175, 55, 0.78)',
    themeOptionName: '#f5f5f5',
    themeOptionDescription: '#d5d5d5',
  },
}

export function applyThemeVariables(theme: ThemeId) {
  const vars = THEME_VARIABLES[theme]
  const root = document.documentElement
  
  Object.entries(vars).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })
}
