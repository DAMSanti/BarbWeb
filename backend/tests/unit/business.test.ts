import { describe, it, expect } from 'vitest'

/**
 * Business Logic Utilities - Pure functions for legal business operations
 */

// Consultation categories and pricing (in EUR cents)
const CONSULTATION_PRICING = {
  'Derecho Laboral': 5000, // 50 EUR
  'Derecho Familia': 6000, // 60 EUR
  'Derecho Penal': 7000, // 70 EUR
  'Derecho Comercial': 8000, // 80 EUR
  'Derecho Civil': 4500, // 45 EUR
}

const TAX_RATE = 0.21 // 21% IVA in Spain
const DISCOUNT_RATE = 0.1 // 10% for multiple consultations

// Price calculations
export const calculateConsultationPrice = (category: string): number => {
  return CONSULTATION_PRICING[category as keyof typeof CONSULTATION_PRICING] || 5000
}

export const calculateTax = (basePrice: number, taxRate: number = TAX_RATE): number => {
  return Math.round(basePrice * taxRate)
}

export const calculateTotal = (basePrice: number, taxAmount: number, discountAmount: number = 0): number => {
  return basePrice + taxAmount - discountAmount
}

export const calculateDiscount = (basePrice: number, discountRate: number = DISCOUNT_RATE): number => {
  return Math.round(basePrice * discountRate)
}

export const formatPriceForDisplay = (amountInCents: number): string => {
  const euros = Math.floor(amountInCents / 100)
  const cents = amountInCents % 100
  return `€${euros}.${cents.toString().padStart(2, '0')}`
}

// Payment status validation
export const isValidPaymentStatus = (status: string): boolean => {
  const validStatuses = ['pending', 'succeeded', 'failed', 'canceled', 'refunded']
  return validStatuses.includes(status.toLowerCase())
}

// Refund calculations
export const calculateRefund = (totalPaid: number, refundPercentage: number = 100): number => {
  return Math.round(totalPaid * (refundPercentage / 100))
}

export const getRefundReason = (reason: string): string => {
  const reasons: Record<string, string> = {
    'user-request': 'Solicitud del usuario',
    'insufficient-service': 'Servicio insuficiente',
    'duplicate-charge': 'Cargo duplicado',
    'technical-error': 'Error técnico',
    'other': 'Otra razón',
  }
  return reasons[reason] || 'Desconocido'
}

// Consultation status
export const isValidConsultationStatus = (status: string): boolean => {
  const validStatuses = ['pending', 'in-progress', 'completed', 'archived']
  return validStatuses.includes(status.toLowerCase())
}

// Question categorization
export const categorizeQuestion = (question: string): string => {
  const lowerQuestion = question.toLowerCase()

  if (
    lowerQuestion.includes('employment') ||
    lowerQuestion.includes('trabajo') ||
    lowerQuestion.includes('dismissal') ||
    lowerQuestion.includes('wage') ||
    lowerQuestion.includes('employer') ||
    lowerQuestion.includes('employee') ||
    lowerQuestion.includes('labor') ||
    lowerQuestion.includes('working') ||
    lowerQuestion.includes('rights')
  ) {
    return 'Derecho Laboral'
  }

  if (
    lowerQuestion.includes('divorce') ||
    lowerQuestion.includes('custody') ||
    lowerQuestion.includes('matrimonio') ||
    lowerQuestion.includes('familia')
  ) {
    return 'Derecho Familia'
  }

  if (
    lowerQuestion.includes('criminal') ||
    lowerQuestion.includes('crime') ||
    lowerQuestion.includes('penal') ||
    lowerQuestion.includes('delito')
  ) {
    return 'Derecho Penal'
  }

  if (
    lowerQuestion.includes('business') ||
    lowerQuestion.includes('contract') ||
    lowerQuestion.includes('empresa') ||
    lowerQuestion.includes('comercial')
  ) {
    return 'Derecho Comercial'
  }

  return 'Derecho Civil'
}

// Lawyer assignment
export const selectLawyerByExperience = (
  category: string,
  lawyers: Array<{ id: string; specialization: string; experience: number }>
): string | null => {
  const specialists = lawyers.filter((l) => l.specialization === category)
  if (specialists.length === 0) return null

  // Return lawyer with most experience
  return specialists.reduce((best, current) => (current.experience > best.experience ? current : best)).id
}

// Time estimations (in hours)
export const estimateResponseTime = (category: string): number => {
  const estimates: Record<string, number> = {
    'Derecho Laboral': 2,
    'Derecho Familia': 3,
    'Derecho Penal': 4,
    'Derecho Comercial': 3,
    'Derecho Civil': 2,
  }
  return estimates[category] || 2
}

export const estimateCompletionTime = (category: string): number => {
  const estimates: Record<string, number> = {
    'Derecho Laboral': 8,
    'Derecho Familia': 12,
    'Derecho Penal': 16,
    'Derecho Comercial': 10,
    'Derecho Civil': 6,
  }
  return estimates[category] || 8
}

// Client validation
export const isValidClientAge = (age: number): boolean => {
  return age >= 18 && age <= 120
}

export const validateSpanishID = (id: string): boolean => {
  // Simplified DNI validation
  const dniRegex = /^[0-9]{8}[A-Z]$/
  return dniRegex.test(id)
}

describe('Business Logic Utilities', () => {
  describe('Consultation Pricing', () => {
    it('should return correct price for labor law', () => {
      const price = calculateConsultationPrice('Derecho Laboral')
      expect(price).toBe(5000) // 50 EUR
    })

    it('should return correct price for family law', () => {
      const price = calculateConsultationPrice('Derecho Familia')
      expect(price).toBe(6000) // 60 EUR
    })

    it('should return default price for unknown category', () => {
      const price = calculateConsultationPrice('Unknown Category')
      expect(price).toBe(5000) // Default 50 EUR
    })
  })

  describe('Tax Calculation', () => {
    it('should calculate 21% tax (IVA)', () => {
      const tax = calculateTax(5000)
      expect(tax).toBe(1050) // 21% of 5000
    })

    it('should handle custom tax rates', () => {
      const tax = calculateTax(10000, 0.1)
      expect(tax).toBe(1000) // 10% of 10000
    })

    it('should calculate zero tax for zero amount', () => {
      const tax = calculateTax(0)
      expect(tax).toBe(0)
    })
  })

  describe('Total Price Calculation', () => {
    it('should calculate total with tax', () => {
      const basePrice = 5000
      const tax = calculateTax(basePrice)
      const total = calculateTotal(basePrice, tax)
      expect(total).toBe(6050) // 5000 + 1050
    })

    it('should subtract discount from total', () => {
      const basePrice = 5000
      const tax = calculateTax(basePrice)
      const discount = 500
      const total = calculateTotal(basePrice, tax, discount)
      expect(total).toBe(5550) // 5000 + 1050 - 500
    })
  })

  describe('Discount Calculation', () => {
    it('should calculate 10% discount', () => {
      const discount = calculateDiscount(5000)
      expect(discount).toBe(500)
    })

    it('should handle custom discount rates', () => {
      const discount = calculateDiscount(5000, 0.2)
      expect(discount).toBe(1000) // 20% of 5000
    })
  })

  describe('Price Display Formatting', () => {
    it('should format price for display', () => {
      expect(formatPriceForDisplay(5000)).toBe('€50.00')
      expect(formatPriceForDisplay(6050)).toBe('€60.50')
      expect(formatPriceForDisplay(1000)).toBe('€10.00')
    })

    it('should pad cents with zero', () => {
      expect(formatPriceForDisplay(5005)).toBe('€50.05')
      expect(formatPriceForDisplay(5099)).toBe('€50.99')
    })
  })

  describe('Payment Status Validation', () => {
    it('should validate correct payment statuses', () => {
      const validStatuses = ['pending', 'succeeded', 'failed', 'canceled', 'refunded']
      validStatuses.forEach((status) => {
        expect(isValidPaymentStatus(status)).toBe(true)
      })
    })

    it('should be case insensitive', () => {
      expect(isValidPaymentStatus('SUCCEEDED')).toBe(true)
      expect(isValidPaymentStatus('Failed')).toBe(true)
    })

    it('should reject invalid statuses', () => {
      expect(isValidPaymentStatus('processing')).toBe(false)
      expect(isValidPaymentStatus('unknown')).toBe(false)
    })
  })

  describe('Refund Calculations', () => {
    it('should calculate full refund (100%)', () => {
      const refund = calculateRefund(6050)
      expect(refund).toBe(6050)
    })

    it('should calculate partial refund', () => {
      const refund = calculateRefund(6050, 50)
      expect(refund).toBe(3025) // 50% of 6050
    })

    it('should calculate zero refund for 0%', () => {
      const refund = calculateRefund(6050, 0)
      expect(refund).toBe(0)
    })
  })

  describe('Refund Reasons', () => {
    it('should translate refund reasons', () => {
      expect(getRefundReason('user-request')).toBe('Solicitud del usuario')
      expect(getRefundReason('insufficient-service')).toBe('Servicio insuficiente')
    })

    it('should return Unknown for unknown reasons', () => {
      expect(getRefundReason('unknown-reason')).toBe('Desconocido')
    })
  })

  describe('Consultation Status Validation', () => {
    it('should validate correct consultation statuses', () => {
      const validStatuses = ['pending', 'in-progress', 'completed', 'archived']
      validStatuses.forEach((status) => {
        expect(isValidConsultationStatus(status)).toBe(true)
      })
    })

    it('should reject invalid statuses', () => {
      expect(isValidConsultationStatus('reviewing')).toBe(false)
    })
  })

  describe('Question Categorization', () => {
    it('should categorize employment questions', () => {
      expect(categorizeQuestion('What about employment rights?')).toBe('Derecho Laboral')
      expect(categorizeQuestion('Can my employer dismiss me?')).toBe('Derecho Laboral')
    })

    it('should categorize family questions', () => {
      expect(categorizeQuestion('How do I get a divorce?')).toBe('Derecho Familia')
    })

    it('should categorize criminal questions', () => {
      expect(categorizeQuestion('What is a crime?')).toBe('Derecho Penal')
    })

    it('should categorize commercial questions', () => {
      expect(categorizeQuestion('How to start a business?')).toBe('Derecho Comercial')
    })

    it('should default to civil law', () => {
      expect(categorizeQuestion('Random question')).toBe('Derecho Civil')
    })
  })

  describe('Lawyer Selection', () => {
    it('should select lawyer with most experience', () => {
      const lawyers = [
        { id: 'lawyer1', specialization: 'Derecho Laboral', experience: 5 },
        { id: 'lawyer2', specialization: 'Derecho Laboral', experience: 10 },
        { id: 'lawyer3', specialization: 'Derecho Laboral', experience: 3 },
      ]
      const selected = selectLawyerByExperience('Derecho Laboral', lawyers)
      expect(selected).toBe('lawyer2')
    })

    it('should return null if no specialist', () => {
      const lawyers = [
        { id: 'lawyer1', specialization: 'Derecho Familia', experience: 5 },
      ]
      const selected = selectLawyerByExperience('Derecho Laboral', lawyers)
      expect(selected).toBeNull()
    })
  })

  describe('Time Estimations', () => {
    it('should estimate response time for each category', () => {
      expect(estimateResponseTime('Derecho Laboral')).toBe(2)
      expect(estimateResponseTime('Derecho Familia')).toBe(3)
    })

    it('should estimate completion time for each category', () => {
      expect(estimateCompletionTime('Derecho Laboral')).toBe(8)
      expect(estimateCompletionTime('Derecho Familia')).toBe(12)
    })
  })

  describe('Client Age Validation', () => {
    it('should validate legal age (18+)', () => {
      expect(isValidClientAge(18)).toBe(true)
      expect(isValidClientAge(25)).toBe(true)
    })

    it('should reject minors', () => {
      expect(isValidClientAge(17)).toBe(false)
      expect(isValidClientAge(10)).toBe(false)
    })

    it('should allow reasonable maximum age', () => {
      expect(isValidClientAge(100)).toBe(true)
    })

    it('should reject unrealistic ages', () => {
      expect(isValidClientAge(150)).toBe(false)
      expect(isValidClientAge(-1)).toBe(false)
    })
  })

  describe('Spanish ID Validation', () => {
    it('should validate correct DNI format', () => {
      expect(validateSpanishID('12345678A')).toBe(true)
      expect(validateSpanishID('87654321Z')).toBe(true)
    })

    it('should reject invalid format', () => {
      expect(validateSpanishID('1234567')).toBe(false)
      expect(validateSpanishID('123456789')).toBe(false)
      expect(validateSpanishID('1234567a')).toBe(false)
    })
  })

  describe('Integration: Full Consultation Pricing', () => {
    it('should calculate complete pricing with all components', () => {
      const basePrice = calculateConsultationPrice('Derecho Laboral')
      const tax = calculateTax(basePrice)
      const discount = calculateDiscount(basePrice)
      const total = calculateTotal(basePrice, tax, discount)

      expect(basePrice).toBe(5000)
      expect(tax).toBe(1050)
      expect(discount).toBe(500)
      expect(total).toBe(5550)
    })

    it('should format complete pricing', () => {
      const basePrice = calculateConsultationPrice('Derecho Familia')
      const tax = calculateTax(basePrice)
      const total = calculateTotal(basePrice, tax)

      expect(formatPriceForDisplay(basePrice)).toBe('€60.00')
      expect(formatPriceForDisplay(total)).toBe('€72.60')
    })
  })
})
