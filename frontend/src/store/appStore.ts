import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsultationRequest, LegalCategory, LayoutType } from '../types'

// Auth Types
export interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

interface AppState {
  // Consultation state
  consultations: ConsultationRequest[]
  selectedCategory: LegalCategory | null
  stripePublishableKey: string
  layout: LayoutType
  
  // Auth state
  user: User | null
  tokens: Tokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Consultation actions
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
  setLayout: (layout: LayoutType) => void
  
  // Auth actions
  setUser: (user: User | null) => void
  setTokens: (tokens: Tokens | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, tokens: Tokens) => void
  logout: () => void
  register: (user: User, tokens: Tokens) => void
  updateUser: (user: Partial<User>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial consultation state
      consultations: [],
      selectedCategory: null,
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',
      layout: 'classic' as LayoutType,
      
      // Initial auth state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Consultation actions
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
      
      // Auth actions
      setUser: (user: User | null) => set({ user }),
      
      setTokens: (tokens: Tokens | null) => set({ tokens }),
      
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      
      setError: (error: string | null) => set({ error }),
      
      login: (user: User, tokens: Tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
        }),
      
      register: (user: User, tokens: Tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
        }),
      
      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        }),
      
      updateUser: (updates: Partial<User>) =>
        set((state: AppState) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'barbweb-store', // localStorage key
      partialize: (state: AppState) => ({
        layout: state.layout,
        consultations: state.consultations,
        selectedCategory: state.selectedCategory,
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }), // Solo persiste ciertos valores
    }
  )
)
