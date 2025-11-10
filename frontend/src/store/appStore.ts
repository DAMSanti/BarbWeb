import { create } from 'zustand'
import { ConsultationRequest, LegalCategory } from '../types'

interface AppState {
  consultations: ConsultationRequest[]
  selectedCategory: LegalCategory | null
  stripePublishableKey: string
  
  // Acciones
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
}

export const useAppStore = create<AppState>((set) => ({
  consultations: [],
  selectedCategory: null,
  // Reemplaza esto con tu clave pública real de Stripe
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',

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
}))
