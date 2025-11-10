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
    bodyBg: 'linear-gradient(135deg, #ffffff 0%, #fdf5d6 45%, #ffffff 100%)',
    textPrimary: '#0f172a',
    textSecondary: '#1f2937',
    textMuted: '#64748b',
    accentColor: '#d4af37',
    accentContrast: '#ffffff',
    accentSoft: 'rgba(212, 175, 55, 0.12)',
    heroBg: 'linear-gradient(140deg, rgba(255, 255, 255, 0.95), rgba(252, 245, 213, 0.9))',
    heroHighlight: '#b8941f',
    heroAccentA: 'rgba(212, 175, 55, 0.22)',
    heroAccentB: 'rgba(244, 209, 109, 0.3)',
    surfaceElevated: 'rgba(255, 255, 255, 0.9)',
    surfaceMuted: 'rgba(213, 197, 137, 0.1)',
    surfaceContrast: '#0f172a',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    cardBg: 'rgba(255, 255, 255, 0.88)',
    cardBorder: 'rgba(212, 175, 55, 0.16)',
    cardText: '#1f2937',
    cardIconBg: 'rgba(212, 175, 55, 0.12)',
    cardIconColor: '#9c7a19',
    sectionFeaturesBg: '#ffffff',
    sectionServicesBg: 'linear-gradient(135deg, #fff6d6, #ffffff)',
    sectionAboutBg: '#ffffff',
    ctaBg: 'linear-gradient(120deg, #0f172a, #1f2937)',
    ctaTitle: '#ffffff',
    ctaText: '#e2e8f0',
    ctaButtonBg: '#d4af37',
    ctaButtonText: '#0f172a',
    ctaButtonHoverBg: '#eab308',
    ctaButtonHoverText: '#0f172a',
    serviceCardBg: 'rgba(255, 255, 255, 0.92)',
    serviceCardBorder: 'rgba(15, 23, 42, 0.08)',
    serviceCardText: '#475569',
    serviceCardLink: '#9c7a19',
    commitmentBg: 'rgba(15, 23, 42, 0.08)',
    commitmentNumber: '#9c7a19',
    commitmentText: '#1f2937',
    headerBg: 'rgba(255, 255, 255, 0.9)',
    headerBorder: 'rgba(15, 23, 42, 0.06)',
    headerText: '#0f172a',
    headerLink: '#1f2937',
    headerLinkHover: '#d4af37',
    headerContact: 'rgba(212, 175, 55, 0.18)',
    headerContactHover: 'rgba(212, 175, 55, 0.35)',
    logoMarkBg: 'rgba(212, 175, 55, 0.18)',
    logoMarkIcon: '#0f172a',
    footerBg: 'rgba(248, 250, 252, 0.96)',
    footerHeading: '#0f172a',
    footerText: '#334155',
    footerTextMuted: '#64748b',
    footerLink: '#9c7a19',
    footerLinkHover: '#d4af37',
    footerDivider: 'rgba(148, 163, 184, 0.35)',
    footerCopy: '#64748b',
    switcherBg: 'rgba(255, 255, 255, 0.92)',
    switcherBorder: 'rgba(15, 23, 42, 0.08)',
    switcherHeading: '#0f172a',
    switcherDescription: '#475569',
    switcherBadgeBg: 'rgba(15, 23, 42, 0.08)',
    switcherBadgeColor: '#9c7a19',
    themeOptionBg: 'rgba(255, 255, 255, 0.95)',
    themeOptionBorder: 'rgba(15, 23, 42, 0.08)',
    themeOptionActiveBorder: 'rgba(212, 175, 55, 0.8)',
    themeOptionName: '#0f172a',
    themeOptionDescription: '#475569',
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
    bodyBg: 'linear-gradient(120deg, #050b16 0%, #0b1224 50%, #111d3a 100%)',
    textPrimary: '#e2e8f0',
    textSecondary: '#cbd5f5',
    textMuted: '#94a3b8',
    accentColor: '#647cf7',
    accentContrast: '#050b16',
    accentSoft: 'rgba(100, 124, 247, 0.22)',
    heroBg: 'linear-gradient(145deg, rgba(5, 11, 22, 0.94), rgba(9, 17, 35, 0.9))',
    heroHighlight: '#8ba4ff',
    heroAccentA: 'rgba(100, 124, 247, 0.35)',
    heroAccentB: 'rgba(236, 72, 153, 0.25)',
    surfaceElevated: 'rgba(9, 17, 35, 0.75)',
    surfaceMuted: 'rgba(9, 17, 35, 0.45)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(148, 163, 184, 0.22)',
    cardBg: 'rgba(9, 17, 35, 0.72)',
    cardBorder: 'rgba(100, 124, 247, 0.22)',
    cardText: '#e2e8f0',
    cardIconBg: 'rgba(100, 124, 247, 0.16)',
    cardIconColor: '#8ba4ff',
    sectionFeaturesBg: 'linear-gradient(135deg, rgba(7, 13, 27, 0.96), rgba(11, 18, 38, 0.94))',
    sectionServicesBg: 'linear-gradient(120deg, rgba(6, 12, 26, 0.95), rgba(30, 41, 59, 0.8))',
    sectionAboutBg: 'rgba(5, 11, 22, 0.95)',
    ctaBg: 'linear-gradient(120deg, #647cf7, #38bdf8)',
    ctaTitle: '#0f172a',
    ctaText: '#0b1120',
    ctaButtonBg: '#0b1120',
    ctaButtonText: '#8ba4ff',
    ctaButtonHoverBg: '#111d3a',
    ctaButtonHoverText: '#38bdf8',
    serviceCardBg: 'rgba(14, 22, 45, 0.9)',
    serviceCardBorder: 'rgba(100, 124, 247, 0.18)',
    serviceCardText: '#cbd5f5',
    serviceCardLink: '#8ba4ff',
    commitmentBg: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(5, 11, 22, 0.95))',
    commitmentNumber: '#38bdf8',
    commitmentText: '#e2e8f0',
    headerBg: 'rgba(5, 11, 22, 0.92)',
    headerBorder: 'rgba(100, 124, 247, 0.18)',
    headerText: '#e2e8f0',
    headerLink: '#cbd5f5',
    headerLinkHover: '#38bdf8',
    headerContact: 'rgba(56, 189, 248, 0.16)',
    headerContactHover: 'rgba(56, 189, 248, 0.28)',
    logoMarkBg: 'rgba(56, 189, 248, 0.18)',
    logoMarkIcon: '#0b1120',
    footerBg: 'rgba(5, 11, 22, 0.96)',
    footerHeading: '#e2e8f0',
    footerText: '#cbd5f5',
    footerTextMuted: '#94a3b8',
    footerLink: '#38bdf8',
    footerLinkHover: '#8ba4ff',
    footerDivider: 'rgba(94, 111, 164, 0.4)',
    footerCopy: '#94a3b8',
    switcherBg: 'rgba(9, 17, 35, 0.85)',
    switcherBorder: 'rgba(100, 124, 247, 0.22)',
    switcherHeading: '#e2e8f0',
    switcherDescription: '#cbd5f5',
    switcherBadgeBg: 'rgba(100, 124, 247, 0.2)',
    switcherBadgeColor: '#38bdf8',
    themeOptionBg: 'rgba(9, 17, 35, 0.9)',
    themeOptionBorder: 'rgba(59, 78, 129, 0.35)',
    themeOptionActiveBorder: 'rgba(100, 124, 247, 0.85)',
    themeOptionName: '#e2e8f0',
    themeOptionDescription: '#cbd5f5',
  },
  avantgarde: {
    bodyBg: 'linear-gradient(120deg, #0b0b0f 0%, #341e02 45%, #120f1c 100%)',
    textPrimary: '#f8fafc',
    textSecondary: '#f4f4f5',
    textMuted: '#d4d4d8',
    accentColor: '#f472b6',
    accentContrast: '#0b0b0f',
    accentSoft: 'rgba(244, 114, 182, 0.22)',
    heroBg: 'linear-gradient(150deg, rgba(11, 11, 15, 0.96), rgba(52, 30, 2, 0.9))',
    heroHighlight: '#facc15',
    heroAccentA: 'rgba(250, 204, 21, 0.35)',
    heroAccentB: 'rgba(244, 114, 182, 0.28)',
    surfaceElevated: 'rgba(16, 12, 24, 0.76)',
    surfaceMuted: 'rgba(16, 12, 24, 0.46)',
    surfaceContrast: '#ffffff',
    borderColor: 'rgba(244, 114, 182, 0.25)',
    cardBg: 'rgba(16, 12, 24, 0.78)',
    cardBorder: 'rgba(244, 114, 182, 0.28)',
    cardText: '#f4f4f5',
    cardIconBg: 'rgba(250, 204, 21, 0.18)',
    cardIconColor: '#facc15',
    sectionFeaturesBg: 'linear-gradient(120deg, rgba(14, 12, 20, 0.96), rgba(40, 20, 42, 0.88))',
    sectionServicesBg: 'linear-gradient(130deg, rgba(28, 17, 40, 0.9), rgba(52, 30, 2, 0.9))',
    sectionAboutBg: 'rgba(16, 12, 24, 0.95)',
    ctaBg: 'linear-gradient(120deg, #facc15, #fb923c)',
    ctaTitle: '#0b0b0f',
    ctaText: '#171717',
    ctaButtonBg: '#0f172a',
    ctaButtonText: '#facc15',
    ctaButtonHoverBg: '#1d4ed8',
    ctaButtonHoverText: '#ffe4e6',
    serviceCardBg: 'rgba(20, 18, 24, 0.92)',
    serviceCardBorder: 'rgba(250, 204, 21, 0.25)',
    serviceCardText: '#f4f4f5',
    serviceCardLink: '#f472b6',
    commitmentBg: 'linear-gradient(135deg, rgba(52, 30, 2, 0.85), rgba(20, 18, 24, 0.95))',
    commitmentNumber: '#facc15',
    commitmentText: '#f4f4f5',
    headerBg: 'rgba(11, 11, 15, 0.94)',
    headerBorder: 'rgba(244, 114, 182, 0.25)',
    headerText: '#f8fafc',
    headerLink: '#f4f4f5',
    headerLinkHover: '#f472b6',
    headerContact: 'rgba(250, 204, 21, 0.16)',
    headerContactHover: 'rgba(244, 114, 182, 0.28)',
    logoMarkBg: 'rgba(250, 204, 21, 0.22)',
    logoMarkIcon: '#0b0b0f',
    footerBg: 'rgba(14, 12, 20, 0.96)',
    footerHeading: '#f8fafc',
    footerText: '#f4f4f5',
    footerTextMuted: '#d4d4d8',
    footerLink: '#f472b6',
    footerLinkHover: '#facc15',
    footerDivider: 'rgba(112, 26, 117, 0.35)',
    footerCopy: '#d4d4d8',
    switcherBg: 'rgba(20, 18, 24, 0.9)',
    switcherBorder: 'rgba(244, 114, 182, 0.25)',
    switcherHeading: '#f8fafc',
    switcherDescription: '#f4f4f5',
    switcherBadgeBg: 'rgba(244, 114, 182, 0.18)',
    switcherBadgeColor: '#facc15',
    themeOptionBg: 'rgba(20, 18, 24, 0.92)',
    themeOptionBorder: 'rgba(117, 42, 131, 0.35)',
    themeOptionActiveBorder: 'rgba(250, 204, 21, 0.85)',
    themeOptionName: '#f8fafc',
    themeOptionDescription: '#f4f4f5',
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
