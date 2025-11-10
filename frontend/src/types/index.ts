export interface Question {
  id: string
  category: string
  question: string
  isCommon: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface ConsultationRequest {
  id: string
  clientName: string
  clientEmail: string
  question: string
  category: string
  price: number
  isPaid: boolean
  createdAt: Date
}

export type LegalCategory = 'Civil' | 'Penal' | 'Laboral' | 'Administrativo' | 'Mercantil' | 'Familia'

export interface Service {
  id: string
  name: string
  description: string
  category: LegalCategory
  price: number
  icon: string
}
