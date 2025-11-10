import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsultationRequest, LegalCategory } from '../types'
import { ThemeId, DEFAULT_THEME_ID } from '../theme/themes'

interface AppState {
  consultations: ConsultationRequest[]
  selectedCategory: LegalCategory | null
  stripePublishableKey: string
  theme: ThemeId
  
  // Acciones
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
  setTheme: (theme: ThemeId) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      consultations: [],
      selectedCategory: null,
      // Reemplaza esto con tu clave pública real de Stripe
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',
      theme: DEFAULT_THEME_ID,

      addConsultation: (consultation) =>
        set((state) => ({
          consultations: [...state.consultations, consultation],
        })),

      setSelectedCategory: (category) =>
        set({ selectedCategory: category }),

      updateConsultation: (id, updates) =>
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'barbweb-store', // localStorage key
      partialize: (state) => ({ 
        theme: state.theme,
        consultations: state.consultations,
        selectedCategory: state.selectedCategory,
      }), // Solo persiste ciertos valores
    }
  )
)
