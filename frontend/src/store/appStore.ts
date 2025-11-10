import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsultationRequest, LegalCategory, LayoutType } from '../types'
import { ThemeId, DEFAULT_THEME_ID } from '../theme/themes'

interface AppState {
  consultations: ConsultationRequest[]
  selectedCategory: LegalCategory | null
  stripePublishableKey: string
  theme: ThemeId
  layout: LayoutType
  
  // Acciones
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
  setTheme: (theme: ThemeId) => void
  setLayout: (layout: LayoutType) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      consultations: [],
      selectedCategory: null,
      // Reemplaza esto con tu clave pública real de Stripe
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',
      theme: DEFAULT_THEME_ID,
      layout: 'classic' as LayoutType,

      addConsultation: (consultation: ConsultationRequest) =>
        set((state: AppState) => ({
          consultations: [...state.consultations, consultation],
        })),

      setSelectedCategory: (category: LegalCategory | null) =>
        set({ selectedCategory: category }),

      updateConsultation: (id: string, updates: Partial<ConsultationRequest>) =>
        set((state: AppState) => ({
          consultations: state.consultations.map((c: ConsultationRequest) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setTheme: (theme: ThemeId) => set({ theme }),
      
      setLayout: (layout: LayoutType) => set({ layout }),
    }),
    {
      name: 'barbweb-store', // localStorage key
      partialize: (state: AppState) => ({ 
        theme: state.theme,
        layout: state.layout,
        consultations: state.consultations,
        selectedCategory: state.selectedCategory,
      }), // Solo persiste ciertos valores
    }
  )
)
