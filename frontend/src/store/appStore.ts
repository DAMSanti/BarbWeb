import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConsultationRequest, LegalCategory } from '../types'

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
  
  // Auth state
  user: User | null
  tokens: Tokens | null
  isAuthenticated: boolean
  isAuthInitialized: boolean
  isLoading: boolean
  error: string | null
  
  // Consultation actions
  addConsultation: (consultation: ConsultationRequest) => void
  setSelectedCategory: (category: LegalCategory | null) => void
  updateConsultation: (id: string, consultation: Partial<ConsultationRequest>) => void
  
  // Auth actions
  setUser: (user: User | null) => void
  setTokens: (tokens: Tokens | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsAuthInitialized: (isAuthInitialized: boolean) => void
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
      
      // Initial auth state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isAuthInitialized: false,
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
      
      // Auth actions
      setUser: (user: User | null) => set({ user }),
      
      setTokens: (tokens: Tokens | null) => set({ tokens }),
      
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      
      setIsAuthInitialized: (isAuthInitialized: boolean) => set({ isAuthInitialized }),
      
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      
      setError: (error: string | null) => set({ error }),
      
      login: (user: User, tokens: Tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isAuthInitialized: true,
          error: null,
        }),
      
      register: (user: User, tokens: Tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isAuthInitialized: true,
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
        consultations: state.consultations,
        selectedCategory: state.selectedCategory,
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }), // Solo persiste ciertos valores
    }
  )
)
