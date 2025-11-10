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
  classic: {
    bodyBg: 'linear-gradient(135deg, #101828 0%, #1f2937 45%, #0b1120 100%)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5f5',
    textMuted: '#94a3b8',
    accentColor: '#d4af37',
    accentContrast: '#0f172a',
    accentSoft: 'rgba(212, 175, 55, 0.2)',
    heroBg: 'linear-gradient(140deg, rgba(15, 23, 42, 0.95), rgba(8, 14, 29, 0.9))',
    heroHighlight: '#d4af37',
    heroAccentA: 'rgba(212, 175, 55, 0.35)',
    heroAccentB: 'rgba(75, 85, 99, 0.45)',
    surfaceElevated: 'rgba(15, 23, 42, 0.8)',
    surfaceMuted: 'rgba(15, 23, 42, 0.45)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    cardBorder: 'rgba(212, 175, 55, 0.35)',
    cardText: '#e2e8f0',
    cardIconBg: 'rgba(212, 175, 55, 0.15)',
    cardIconColor: '#d4af37',
    sectionFeaturesBg: 'linear-gradient(135deg, rgba(10, 12, 20, 0.98), rgba(15, 23, 42, 0.94))',
    sectionServicesBg: 'linear-gradient(135deg, #0f172a, #111827)',
    sectionAboutBg: '#0b1120',
    ctaBg: 'linear-gradient(120deg, #d4af37, #facc15)',
    ctaTitle: '#0f172a',
    ctaText: '#1f2937',
    ctaButtonBg: '#0f172a',
    ctaButtonText: '#d4af37',
    ctaButtonHoverBg: '#1f2937',
    ctaButtonHoverText: '#facc15',
    serviceCardBg: 'rgba(255, 255, 255, 0.08)',
    serviceCardBorder: 'rgba(212, 175, 55, 0.3)',
    serviceCardText: '#e2e8f0',
    serviceCardLink: '#facc15',
    commitmentBg: 'linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(5, 12, 27, 0.95))',
    commitmentNumber: '#facc15',
    commitmentText: '#e2e8f0',
    headerBg: 'rgba(8, 13, 24, 0.92)',
    headerBorder: 'rgba(212, 175, 55, 0.2)',
    headerText: '#f8fafc',
    headerLink: '#e2e8f0',
    headerLinkHover: '#facc15',
    headerContact: 'rgba(212, 175, 55, 0.18)',
    headerContactHover: 'rgba(212, 175, 55, 0.32)',
    logoMarkBg: 'rgba(212, 175, 55, 0.2)',
    logoMarkIcon: '#d4af37',
    footerBg: 'rgba(7, 12, 24, 0.96)',
    footerHeading: '#f8fafc',
    footerText: '#cbd5f5',
    footerTextMuted: '#94a3b8',
    footerLink: '#facc15',
    footerLinkHover: '#fde68a',
    footerDivider: 'rgba(148, 163, 184, 0.35)',
    footerCopy: '#94a3b8',
    switcherBg: 'rgba(15, 23, 42, 0.7)',
    switcherBorder: 'rgba(212, 175, 55, 0.25)',
    switcherHeading: '#f8fafc',
    switcherDescription: '#cbd5f5',
    switcherBadgeBg: 'rgba(212, 175, 55, 0.15)',
    switcherBadgeColor: '#facc15',
    themeOptionBg: 'rgba(8, 13, 24, 0.9)',
    themeOptionBorder: 'rgba(148, 163, 184, 0.25)',
    themeOptionActiveBorder: 'rgba(212, 175, 55, 0.75)',
    themeOptionName: '#f8fafc',
    themeOptionDescription: '#cbd5f5',
  },
  minimal: {
    bodyBg: 'linear-gradient(135deg, #000000 0%, #1a1a1a 40%, #0f0f0f 100%)',
    textPrimary: '#ffffff',
    textSecondary: '#e5e5e5',
    textMuted: '#a3a3a3',
    accentColor: '#d4af37',
    accentContrast: '#000000',
    accentSoft: 'rgba(212, 175, 55, 0.15)',
    heroBg: 'linear-gradient(140deg, rgba(0, 0, 0, 0.98), rgba(26, 26, 26, 0.95))',
    heroHighlight: '#d4af37',
    heroAccentA: 'rgba(212, 175, 55, 0.3)',
    heroAccentB: 'rgba(100, 100, 100, 0.3)',
    surfaceElevated: 'rgba(30, 30, 30, 0.85)',
    surfaceMuted: 'rgba(30, 30, 30, 0.4)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(212, 175, 55, 0.18)',
    cardBg: 'rgba(20, 20, 20, 0.7)',
    cardBorder: 'rgba(212, 175, 55, 0.25)',
    cardText: '#e5e5e5',
    cardIconBg: 'rgba(212, 175, 55, 0.12)',
    cardIconColor: '#d4af37',
    sectionFeaturesBg: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98), rgba(20, 20, 20, 0.95))',
    sectionServicesBg: 'linear-gradient(135deg, rgba(15, 15, 15, 0.96), rgba(10, 10, 10, 0.98))',
    sectionAboutBg: 'rgba(0, 0, 0, 0.96)',
    ctaBg: 'linear-gradient(120deg, #d4af37, #e5c158)',
    ctaTitle: '#000000',
    ctaText: '#1a1a1a',
    ctaButtonBg: '#1a1a1a',
    ctaButtonText: '#d4af37',
    ctaButtonHoverBg: '#2a2a2a',
    ctaButtonHoverText: '#e5c158',
    serviceCardBg: 'rgba(25, 25, 25, 0.85)',
    serviceCardBorder: 'rgba(212, 175, 55, 0.2)',
    serviceCardText: '#e5e5e5',
    serviceCardLink: '#d4af37',
    commitmentBg: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(0, 0, 0, 0.95))',
    commitmentNumber: '#d4af37',
    commitmentText: '#e5e5e5',
    headerBg: 'rgba(0, 0, 0, 0.95)',
    headerBorder: 'rgba(212, 175, 55, 0.18)',
    headerText: '#ffffff',
    headerLink: '#e5e5e5',
    headerLinkHover: '#d4af37',
    headerContact: 'rgba(212, 175, 55, 0.15)',
    headerContactHover: 'rgba(212, 175, 55, 0.3)',
    logoMarkBg: 'rgba(212, 175, 55, 0.15)',
    logoMarkIcon: '#d4af37',
    footerBg: 'rgba(0, 0, 0, 0.97)',
    footerHeading: '#ffffff',
    footerText: '#d1d1d1',
    footerTextMuted: '#909090',
    footerLink: '#d4af37',
    footerLinkHover: '#e5c158',
    footerDivider: 'rgba(212, 175, 55, 0.2)',
    footerCopy: '#909090',
    switcherBg: 'rgba(20, 20, 20, 0.8)',
    switcherBorder: 'rgba(212, 175, 55, 0.2)',
    switcherHeading: '#ffffff',
    switcherDescription: '#d1d1d1',
    switcherBadgeBg: 'rgba(212, 175, 55, 0.12)',
    switcherBadgeColor: '#d4af37',
    themeOptionBg: 'rgba(15, 15, 15, 0.92)',
    themeOptionBorder: 'rgba(212, 175, 55, 0.15)',
    themeOptionActiveBorder: 'rgba(212, 175, 55, 0.8)',
    themeOptionName: '#ffffff',
    themeOptionDescription: '#d1d1d1',
  },
  royal: {
    bodyBg: 'linear-gradient(130deg, #090909 0%, #111827 40%, #1f1727 100%)',
    textPrimary: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#a1a1aa',
    accentColor: '#fbbf24',
    accentContrast: '#050505',
    accentSoft: 'rgba(251, 191, 36, 0.22)',
    heroBg: 'linear-gradient(145deg, rgba(9, 9, 11, 0.95), rgba(17, 24, 39, 0.9))',
    heroHighlight: '#fbbf24',
    heroAccentA: 'rgba(251, 191, 36, 0.4)',
    heroAccentB: 'rgba(79, 70, 229, 0.25)',
    surfaceElevated: 'rgba(15, 15, 20, 0.75)',
    surfaceMuted: 'rgba(15, 15, 20, 0.4)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(251, 191, 36, 0.24)',
    cardBg: 'rgba(13, 13, 18, 0.75)',
    cardBorder: 'rgba(251, 191, 36, 0.3)',
    cardText: '#f4f4f5',
    cardIconBg: 'rgba(251, 191, 36, 0.18)',
    cardIconColor: '#fde68a',
    sectionFeaturesBg: 'linear-gradient(135deg, rgba(9, 9, 11, 0.98), rgba(17, 24, 39, 0.94))',
    sectionServicesBg: 'linear-gradient(120deg, rgba(9, 9, 11, 0.95), rgba(55, 48, 163, 0.85))',
    sectionAboutBg: 'rgba(9, 9, 11, 0.95)',
    ctaBg: 'linear-gradient(120deg, #fbbf24, #f59e0b)',
    ctaTitle: '#0b0b0f',
    ctaText: '#111827',
    ctaButtonBg: '#09090b',
    ctaButtonText: '#fbbf24',
    ctaButtonHoverBg: '#111827',
    ctaButtonHoverText: '#fde68a',
    serviceCardBg: 'rgba(17, 24, 39, 0.92)',
    serviceCardBorder: 'rgba(251, 191, 36, 0.24)',
    serviceCardText: '#d4d4d8',
    serviceCardLink: '#facc15',
    commitmentBg: 'linear-gradient(140deg, rgba(79, 70, 229, 0.2), rgba(9, 9, 11, 0.92))',
    commitmentNumber: '#fbbf24',
    commitmentText: '#f4f4f5',
    headerBg: 'rgba(9, 9, 11, 0.92)',
    headerBorder: 'rgba(251, 191, 36, 0.24)',
    headerText: '#f4f4f5',
    headerLink: '#d4d4d8',
    headerLinkHover: '#fbbf24',
    headerContact: 'rgba(251, 191, 36, 0.16)',
    headerContactHover: 'rgba(251, 191, 36, 0.28)',
    logoMarkBg: 'rgba(251, 191, 36, 0.2)',
    logoMarkIcon: '#111827',
    footerBg: 'rgba(9, 9, 11, 0.96)',
    footerHeading: '#f8fafc',
    footerText: '#d4d4d8',
    footerTextMuted: '#a1a1aa',
    footerLink: '#fbbf24',
    footerLinkHover: '#fde68a',
    footerDivider: 'rgba(63, 63, 70, 0.6)',
    footerCopy: '#a1a1aa',
    switcherBg: 'rgba(13, 13, 18, 0.8)',
    switcherBorder: 'rgba(251, 191, 36, 0.24)',
    switcherHeading: '#f8fafc',
    switcherDescription: '#d4d4d8',
    switcherBadgeBg: 'rgba(79, 70, 229, 0.18)',
    switcherBadgeColor: '#fbbf24',
    themeOptionBg: 'rgba(9, 9, 11, 0.9)',
    themeOptionBorder: 'rgba(63, 63, 70, 0.4)',
    themeOptionActiveBorder: 'rgba(251, 191, 36, 0.85)',
    themeOptionName: '#f8fafc',
    themeOptionDescription: '#d4d4d8',
  },
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
  avantgarde: {
    bodyBg: 'linear-gradient(120deg, #0a0a0a 0%, #1a1a1a 45%, #050505 100%)',
    textPrimary: '#fafafa',
    textSecondary: '#e8e8e8',
    textMuted: '#999999',
    accentColor: '#d4af37',
    accentContrast: '#000000',
    accentSoft: 'rgba(212, 175, 55, 0.13)',
    heroBg: 'linear-gradient(150deg, rgba(10, 10, 10, 0.98), rgba(26, 26, 26, 0.93))',
    heroHighlight: '#d4af37',
    heroAccentA: 'rgba(212, 175, 55, 0.32)',
    heroAccentB: 'rgba(70, 70, 70, 0.32)',
    surfaceElevated: 'rgba(32, 32, 32, 0.82)',
    surfaceMuted: 'rgba(32, 32, 32, 0.38)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(212, 175, 55, 0.15)',
    cardBg: 'rgba(22, 22, 22, 0.72)',
    cardBorder: 'rgba(212, 175, 55, 0.2)',
    cardText: '#e8e8e8',
    cardIconBg: 'rgba(212, 175, 55, 0.1)',
    cardIconColor: '#d4af37',
    sectionFeaturesBg: 'linear-gradient(120deg, rgba(8, 8, 8, 0.98), rgba(22, 22, 22, 0.95))',
    sectionServicesBg: 'linear-gradient(130deg, rgba(12, 12, 12, 0.97), rgba(8, 8, 8, 0.98))',
    sectionAboutBg: 'rgba(8, 8, 8, 0.97)',
    ctaBg: 'linear-gradient(120deg, #d4af37, #e5c158)',
    ctaTitle: '#0a0a0a',
    ctaText: '#161616',
    ctaButtonBg: '#1a1a1a',
    ctaButtonText: '#d4af37',
    ctaButtonHoverBg: '#2a2a2a',
    ctaButtonHoverText: '#e5c158',
    serviceCardBg: 'rgba(24, 24, 24, 0.8)',
    serviceCardBorder: 'rgba(212, 175, 55, 0.17)',
    serviceCardText: '#e8e8e8',
    serviceCardLink: '#d4af37',
    commitmentBg: 'linear-gradient(135deg, rgba(22, 22, 22, 0.88), rgba(8, 8, 8, 0.95))',
    commitmentNumber: '#d4af37',
    commitmentText: '#e8e8e8',
    headerBg: 'rgba(8, 8, 8, 0.97)',
    headerBorder: 'rgba(212, 175, 55, 0.15)',
    headerText: '#fafafa',
    headerLink: '#e8e8e8',
    headerLinkHover: '#d4af37',
    headerContact: 'rgba(212, 175, 55, 0.13)',
    headerContactHover: 'rgba(212, 175, 55, 0.26)',
    logoMarkBg: 'rgba(212, 175, 55, 0.13)',
    logoMarkIcon: '#d4af37',
    footerBg: 'rgba(6, 6, 6, 0.98)',
    footerHeading: '#fafafa',
    footerText: '#d8d8d8',
    footerTextMuted: '#878787',
    footerLink: '#d4af37',
    footerLinkHover: '#e5c158',
    footerDivider: 'rgba(212, 175, 55, 0.17)',
    footerCopy: '#878787',
    switcherBg: 'rgba(22, 22, 22, 0.76)',
    switcherBorder: 'rgba(212, 175, 55, 0.17)',
    switcherHeading: '#fafafa',
    switcherDescription: '#d8d8d8',
    switcherBadgeBg: 'rgba(212, 175, 55, 0.1)',
    switcherBadgeColor: '#d4af37',
    themeOptionBg: 'rgba(16, 16, 16, 0.91)',
    themeOptionBorder: 'rgba(212, 175, 55, 0.13)',
    themeOptionActiveBorder: 'rgba(212, 175, 55, 0.75)',
    themeOptionName: '#fafafa',
    themeOptionDescription: '#d8d8d8',
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
