import { describe, it, expect } from 'vitest'

/**
 * Pure utility functions for testing - no external dependencies
 */

// Validators
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  return /^\+?[\d\s\-()]{10,}$/.test(phone)
}

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// String utilities
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export const capitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Number utilities
export const roundToDecimal = (num: number, decimals: number): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return `${(amount / 100).toFixed(2)} ${currency}`
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return roundToDecimal((value / total) * 100, 2)
}

// Array utilities
export const removeDuplicates = <T>(arr: T[]): T[] => {
  return [...new Set(arr)]
}

export const groupBy = <T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> => {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key])
      if (!acc[groupKey]) acc[groupKey] = []
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

export const flatten = <T>(arr: T[][]): T[] => {
  return arr.reduce((acc, val) => acc.concat(val), [])
}

describe('Utility Functions', () => {
  describe('Email Validation', () => {
    it('should validate correct emails', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
      ]
      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        'user@',
        '@example.com',
        'user @example.com',
      ]
      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePass123',
        'MyPassword456',
        'Test1234Pass',
      ]
      strongPasswords.forEach((pwd) => {
        expect(isValidPassword(pwd)).toBe(true)
      })
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'weak',
        '12345678',
        'nouppercase123',
        'NOUUMBER',
      ]
      weakPasswords.forEach((pwd) => {
        expect(isValidPassword(pwd)).toBe(false)
      })
    })
  })

  describe('Phone Number Validation', () => {
    it('should validate valid phone numbers', () => {
      const validPhones = [
        '+34 123 456 7890',
        '123-456-7890',
        '+1 (123) 456-7890',
      ]
      validPhones.forEach((phone) => {
        expect(isValidPhoneNumber(phone)).toBe(true)
      })
    })

    it('should reject short numbers', () => {
      const invalidPhones = ['123', '12345']
      invalidPhones.forEach((phone) => {
        expect(isValidPhoneNumber(phone)).toBe(false)
      })
    })
  })

  describe('URL Validation', () => {
    it('should validate valid URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://localhost:3000',
        'https://sub.example.co.uk',
      ]
      validURLs.forEach((url) => {
        expect(isValidURL(url)).toBe(true)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not a url',
        'example',
      ]
      invalidURLs.forEach((url) => {
        expect(isValidURL(url)).toBe(false)
      })
    })
  })

  describe('String Truncation', () => {
    it('should truncate long strings', () => {
      const result = truncateString('This is a very long string', 10)
      expect(result).toBe('This is a ...')
      expect(result.length).toBeLessThanOrEqual(13)
    })

    it('should not truncate short strings', () => {
      const result = truncateString('Short', 20)
      expect(result).toBe('Short')
    })

    it('should handle exact length', () => {
      const result = truncateString('Exact', 5)
      expect(result).toBe('Exact')
    })
  })

  describe('String Capitalization', () => {
    it('should capitalize strings', () => {
      expect(capitalizeString('hello world')).toBe('Hello world')
      expect(capitalizeString('HELLO WORLD')).toBe('Hello world')
      expect(capitalizeString('hELLO')).toBe('Hello')
    })

    it('should handle single character', () => {
      expect(capitalizeString('a')).toBe('A')
      expect(capitalizeString('Z')).toBe('Z')
    })
  })

  describe('Slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('My Blog Post Title')).toBe('my-blog-post-title')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello@World#123')).toBe('helloworld123')
    })

    it('should remove leading/trailing hyphens', () => {
      const result = slugify('---hello---')
      expect(result).not.toMatch(/^-+|-+$/)
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(5000, 'EUR')).toBe('50.00 EUR')
      expect(formatCurrency(1000, 'USD')).toBe('10.00 USD')
    })

    it('should default to EUR', () => {
      expect(formatCurrency(2500)).toBe('25.00 EUR')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('0.00 EUR')
    })
  })

  describe('Rounding', () => {
    it('should round to decimal places', () => {
      expect(roundToDecimal(3.14159, 2)).toBe(3.14)
      expect(roundToDecimal(10.555, 2)).toBe(10.56)
    })

    it('should handle zero decimals', () => {
      expect(roundToDecimal(3.7, 0)).toBe(4)
    })
  })

  describe('Percentage Calculation', () => {
    it('should calculate percentage', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(50, 200)).toBe(25)
    })

    it('should handle zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0)
    })

    it('should round to 2 decimals', () => {
      expect(calculatePercentage(33, 100)).toBe(33)
    })
  })

  describe('Remove Duplicates', () => {
    it('should remove duplicate values', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4]
      const result = removeDuplicates(arr)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('should work with strings', () => {
      const arr = ['a', 'b', 'a', 'c', 'b']
      const result = removeDuplicates(arr)
      expect(result.length).toBe(3)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
    })
  })

  describe('Group By', () => {
    it('should group array by key', () => {
      const arr = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ]
      const grouped = groupBy(arr, 'category')
      expect(grouped['A'].length).toBe(2)
      expect(grouped['B'].length).toBe(1)
    })

    it('should create groups for each unique key', () => {
      const arr = [
        { type: 'legal', name: 'Lawyer' },
        { type: 'medical', name: 'Doctor' },
        { type: 'legal', name: 'Attorney' },
      ]
      const grouped = groupBy(arr, 'type')
      expect(Object.keys(grouped).length).toBe(2)
    })
  })

  describe('Flatten', () => {
    it('should flatten nested arrays', () => {
      const arr = [[1, 2], [3, 4], [5]]
      const result = flatten(arr)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle empty subarrays', () => {
      const arr = [[1, 2], [], [3]]
      const result = flatten(arr)
      expect(result).toEqual([1, 2, 3])
    })

    it('should preserve order', () => {
      const arr = [['a', 'b'], ['c'], ['d', 'e', 'f']]
      const result = flatten(arr)
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })
  })
})
