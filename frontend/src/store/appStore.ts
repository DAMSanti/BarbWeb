import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsultationRequest, LegalCategory, LayoutType } from '../types'

interface AppState {
  consultations: ConsultationRequest[]
  selectedCategory: LegalCategory | null
  stripePublishableKey: string
  layout: LayoutType
  
  // Acciones
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
  setLayout: (layout: LayoutType) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      consultations: [],
      selectedCategory: null,
      // Reemplaza esto con tu clave pública real de Stripe
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',
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
      
      setLayout: (layout: LayoutType) => set({ layout }),
    }),
    {
      name: 'barbweb-store', // localStorage key
      partialize: (state: AppState) => ({ 
        layout: state.layout,
        consultations: state.consultations,
        selectedCategory: state.selectedCategory,
      }), // Solo persiste ciertos valores
    }
  )
)
