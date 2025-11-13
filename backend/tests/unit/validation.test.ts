import { describe, it, expect } from 'vitest'

/**
 * Data Validation & Transformation Utilities - Pure functions for input validation
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Name validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
}

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s+()-]{9,}$/
  return phoneRegex.test(phone)
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Sanitize name (remove special characters)
export const sanitizeName = (name: string): string => {
  return name.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]/g, '')
}

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

// Sanitize phone (remove spaces and special characters except +)
export const sanitizePhone = (phone: string): string => {
  return phone.trim().replace(/\s/g, '')
}

// String utilities
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export const capitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalize = (str: string): string => {
  return str
    .split(' ')
    .map((word) => capitalizeString(word))
    .join(' ')
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Number utilities
export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100
}

export const clampNumber = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max)
}

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  }
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return roundToTwoDecimals((value / total) * 100)
}

// Array utilities
export const deduplicateArray = <T>(arr: T[]): T[] => {
  return [...new Set(arr)]
}

export const groupByProperty = <T extends Record<string, any>>(
  arr: T[],
  property: keyof T
): Record<string, T[]> => {
  return arr.reduce(
    (groups, item) => {
      const key = String(item[property])
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

export const flattenArray = <T>(arr: T[][]): T[] => {
  return arr.reduce((flat, item) => [...flat, ...item], [])
}

export const sortByProperty = <T extends Record<string, any>>(
  arr: T[],
  property: keyof T,
  ascending: boolean = true
): T[] => {
  return [...arr].sort((a, b) => {
    const valueA = a[property]
    const valueB = b[property]
    const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0
    return ascending ? comparison : -comparison
  })
}

// Date utilities
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export const formatDate = (date: Date, format: string = 'DD/MM/YYYY'): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  return date.toISOString().split('T')[0]
}

export const isDateInPast = (date: Date): boolean => {
  return date < new Date()
}

// State utilities
export const isValidState = (state: string, validStates: string[]): boolean => {
  return validStates.includes(state)
}

export const transitionState = (
  currentState: string,
  targetState: string,
  validTransitions: Record<string, string[]>
): boolean => {
  return validTransitions[currentState]?.includes(targetState) ?? false
}

// Validation helpers for common scenarios
export const validateUserInput = (input: string, minLength: number = 1, maxLength: number = 500): boolean => {
  const trimmed = input.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

export const validatePaymentAmount = (amount: number, minAmount: number = 0.01, maxAmount: number = 999999.99): boolean => {
  return amount >= minAmount && amount <= maxAmount
}

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['EUR', 'USD', 'GBP']
  return validCurrencies.includes(currency)
}

describe('Data Validation & Transformation', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
    })
  })

  describe('Name Validation', () => {
    it('should validate correct names', () => {
      expect(isValidName('John Doe')).toBe(true)
      expect(isValidName('María García')).toBe(true)
    })

    it('should reject names that are too short', () => {
      expect(isValidName('A')).toBe(false)
      expect(isValidName('')).toBe(false)
    })

    it('should reject names that are too long', () => {
      expect(isValidName('A'.repeat(101))).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+34 123 456 789')).toBe(true)
      expect(isValidPhone('123456789')).toBe(true)
      expect(isValidPhone('(123) 456-7890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('abc')).toBe(false)
    })
  })

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://www.example.org')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
    })
  })

  describe('Name Sanitization', () => {
    it('should remove special characters', () => {
      expect(sanitizeName('John@Doe#!')).toBe('JohnDoe')
    })

    it('should preserve accents', () => {
      expect(sanitizeName('María José')).toBe('María José')
    })

    it('should preserve hyphens', () => {
      expect(sanitizeName('Jean-Pierre')).toBe('Jean-Pierre')
    })
  })

  describe('Email Sanitization', () => {
    it('should lowercase and trim email', () => {
      expect(sanitizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com')
    })
  })

  describe('Phone Sanitization', () => {
    it('should remove spaces', () => {
      expect(sanitizePhone('+34 123 456 789')).toBe('+34123456789')
    })
  })

  describe('String Utilities', () => {
    it('should truncate long strings', () => {
      expect(truncateString('This is a long string', 10)).toBe('This is a ...')
      expect(truncateString('Short', 10)).toBe('Short')
    })

    it('should capitalize first letter', () => {
      expect(capitalizeString('hello')).toBe('Hello')
      expect(capitalizeString('HELLO')).toBe('Hello')
    })

    it('should capitalize all words', () => {
      expect(capitalize('hello world')).toBe('Hello World')
    })

    it('should slugify strings', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Hello  Multiple  Spaces')).toBe('hello-multiple-spaces')
      expect(slugify('Special!@#$Characters')).toBe('specialcharacters')
    })
  })

  describe('Number Utilities', () => {
    it('should round to two decimals', () => {
      expect(roundToTwoDecimals(1.234)).toBe(1.23)
      expect(roundToTwoDecimals(1.999)).toBe(2)
    })

    it('should clamp numbers', () => {
      expect(clampNumber(5, 1, 10)).toBe(5)
      expect(clampNumber(-5, 1, 10)).toBe(1)
      expect(clampNumber(15, 1, 10)).toBe(10)
    })

    it('should format currency', () => {
      expect(formatCurrency(50)).toBe('€50.00')
      expect(formatCurrency(100, 'USD')).toBe('$100.00')
    })

    it('should calculate percentages', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(1, 3)).toBe(33.33)
      expect(calculatePercentage(0, 100)).toBe(0)
    })

    it('should handle divide by zero', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
    })
  })

  describe('Array Utilities', () => {
    it('should deduplicate arrays', () => {
      expect(deduplicateArray([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('should group by property', () => {
      const arr = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ]
      const grouped = groupByProperty(arr, 'type')
      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped['A']).toHaveLength(2)
    })

    it('should flatten nested arrays', () => {
      expect(flattenArray([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5])
    })

    it('should sort by property', () => {
      const arr = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ]
      const sorted = sortByProperty(arr, 'age')
      expect(sorted[0].name).toBe('Alice')
      expect(sorted[2].name).toBe('Bob')
    })

    it('should sort descending', () => {
      const arr = [{ value: 1 }, { value: 3 }, { value: 2 }]
      const sorted = sortByProperty(arr, 'value', false)
      expect(sorted[0].value).toBe(3)
    })
  })

  describe('Date Utilities', () => {
    it('should validate date strings', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('2024/01/15')).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false)
    })

    it('should format dates', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2024')
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
    })

    it('should check if date is in past', () => {
      const pastDate = new Date('2020-01-01')
      const futureDate = new Date(Date.now() + 86400000) // Tomorrow

      expect(isDateInPast(pastDate)).toBe(true)
      expect(isDateInPast(futureDate)).toBe(false)
    })
  })

  describe('State Utilities', () => {
    it('should validate state', () => {
      const validStates = ['pending', 'approved', 'rejected']
      expect(isValidState('pending', validStates)).toBe(true)
      expect(isValidState('unknown', validStates)).toBe(false)
    })

    it('should validate state transitions', () => {
      const transitions = {
        pending: ['approved', 'rejected'],
        approved: ['completed'],
        rejected: ['pending'],
      }

      expect(transitionState('pending', 'approved', transitions)).toBe(true)
      expect(transitionState('pending', 'completed', transitions)).toBe(false)
      expect(transitionState('unknown', 'pending', transitions)).toBe(false)
    })
  })

  describe('User Input Validation', () => {
    it('should validate input length', () => {
      expect(validateUserInput('hello')).toBe(true)
      expect(validateUserInput('')).toBe(false)
      expect(validateUserInput('a'.repeat(501))).toBe(false)
    })

    it('should allow custom min/max lengths', () => {
      expect(validateUserInput('hi', 2, 10)).toBe(true)
      expect(validateUserInput('h', 2, 10)).toBe(false)
    })
  })

  describe('Payment Validation', () => {
    it('should validate payment amounts', () => {
      expect(validatePaymentAmount(50)).toBe(true)
      expect(validatePaymentAmount(0.01)).toBe(true)
    })

    it('should reject zero and negative amounts', () => {
      expect(validatePaymentAmount(0)).toBe(false)
      expect(validatePaymentAmount(-10)).toBe(false)
    })

    it('should allow custom min/max amounts', () => {
      expect(validatePaymentAmount(100, 50, 200)).toBe(true)
      expect(validatePaymentAmount(30, 50, 200)).toBe(false)
    })
  })

  describe('Currency Validation', () => {
    it('should validate currency codes', () => {
      expect(validateCurrency('EUR')).toBe(true)
      expect(validateCurrency('USD')).toBe(true)
    })

    it('should reject invalid currencies', () => {
      expect(validateCurrency('XXX')).toBe(false)
    })
  })

  describe('Integration: Full Validation Chain', () => {
    it('should validate complete user registration', () => {
      const name = 'John Doe'
      const email = 'john@example.com'
      const phone = '+34 123 456 789'

      expect(isValidName(name)).toBe(true)
      expect(isValidEmail(email)).toBe(true)
      expect(isValidPhone(phone)).toBe(true)

      const sanitizedName = sanitizeName(name)
      const sanitizedEmail = sanitizeEmail(email)
      const sanitizedPhone = sanitizePhone(phone)

      expect(sanitizedName).toBe('John Doe')
      expect(sanitizedEmail).toBe('john@example.com')
      expect(sanitizedPhone).toBe('+34123456789')
    })

    it('should validate complete consultation data', () => {
      const amount = 75.5
      const currency = 'EUR'
      const status = 'pending'
      const validStatuses = ['pending', 'in-progress', 'completed']

      expect(validatePaymentAmount(amount)).toBe(true)
      expect(validateCurrency(currency)).toBe(true)
      expect(isValidState(status, validStatuses)).toBe(true)
    })
  })
})
