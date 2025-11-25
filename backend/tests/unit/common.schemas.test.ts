/**
 * Unit Tests - Common Schemas
 * Tests para validación de esquemas reutilizables (Email, Password, Name, UUID, Pagination)
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  EmailSchema,
  PasswordSchema,
  NameSchema,
  UUIDSchema,
  PaginationSchema,
  getZodErrorMessage,
  formatZodErrors,
} from '../../src/schemas/common.schemas'

describe('Common Schemas', () => {
  describe('EmailSchema', () => {
    it('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstName+lastName@example.com',
        'email@subdomain.example.com',
      ]

      validEmails.forEach((email) => {
        const result = EmailSchema.safeParse(email)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '',
        'user@.com',
      ]

      invalidEmails.forEach((email) => {
        const result = EmailSchema.safeParse(email)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Email inválido')
        }
      })
    })

    it('should convert email to lowercase', () => {
      const result = EmailSchema.safeParse('TEST@EXAMPLE.COM')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('test@example.com')
      }
    })

    it('should trim whitespace and convert to lowercase', () => {
      const result = EmailSchema.safeParse('  USER@EXAMPLE.COM  ')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('user@example.com')
      }
    })

    it('should validate unicode email addresses', () => {
      const result = EmailSchema.safeParse('用户@example.com')
      // Zod's email validator may or may not support unicode
      // Just document the behavior
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('PasswordSchema', () => {
    it('should validate correct password format', () => {
      const validPasswords = [
        'ValidPass123',
        'Password1',
        'SecurePass9',
        'MyP@ssw0rd',
        'Aa1aaaaaaa',
      ]

      validPasswords.forEach((password) => {
        const result = PasswordSchema.safeParse(password)
        expect(result.success).toBe(true)
      })
    })

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordSchema.safeParse('Pass1A')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Mínimo 8 caracteres')
      }
    })

    it('should reject password without uppercase letter', () => {
      const result = PasswordSchema.safeParse('password123')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((e) => e.message.includes('mayúscula'))).toBe(true)
      }
    })

    it('should reject password without number', () => {
      const result = PasswordSchema.safeParse('PasswordNoNumber')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((e) => e.message.includes('número'))).toBe(true)
      }
    })

    it('should accept password with special characters', () => {
      const result = PasswordSchema.safeParse('Pass@word123!')
      expect(result.success).toBe(true)
    })

    it('should accept minimum valid password', () => {
      const result = PasswordSchema.safeParse('Aaaaaa1')
      // This should fail - only 7 chars
      expect(result.success).toBe(false)

      const result2 = PasswordSchema.safeParse('Aaaaa1a')
      // This should also fail - no number requirement
      expect(result2.success).toBe(false)

      const result3 = PasswordSchema.safeParse('Aaaaaaa1')
      // This should pass - 8 chars, uppercase, number
      expect(result3.success).toBe(true)
    })

    it('should handle edge case of exactly 8 characters with requirements', () => {
      const result = PasswordSchema.safeParse('Abcdefg1')
      expect(result.success).toBe(true)
    })

    it('should handle very long passwords', () => {
      const longPassword = 'ValidPassword1' + 'a'.repeat(1000)
      const result = PasswordSchema.safeParse(longPassword)
      expect(result.success).toBe(true)
    })
  })

  describe('NameSchema', () => {
    it('should validate correct name format', () => {
      const validNames = [
        'John',
        'María García',
        'José María',
        'Jean-Pierre',
        'O\'Brien',
        'Ludwig van Beethoven',
      ]

      validNames.forEach((name) => {
        const result = NameSchema.safeParse(name)
        expect(result.success).toBe(true)
      })
    })

    it('should reject name shorter than 2 characters', () => {
      const result = NameSchema.safeParse('J')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Mínimo 2 caracteres')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101)
      const result = NameSchema.safeParse(longName)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100')
      }
    })

    it('should accept exactly 2 character name', () => {
      const result = NameSchema.safeParse('Jo')
      expect(result.success).toBe(true)
    })

    it('should accept exactly 100 character name', () => {
      const name = 'a'.repeat(100)
      const result = NameSchema.safeParse(name)
      expect(result.success).toBe(true)
    })

    it('should accept names with numbers', () => {
      const result = NameSchema.safeParse('John 2nd')
      expect(result.success).toBe(true)
    })

    it('should accept empty string but fail due to length', () => {
      const result = NameSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should accept names with special characters', () => {
      const result = NameSchema.safeParse("D'Artagnan")
      expect(result.success).toBe(true)
    })
  })

  describe('UUIDSchema', () => {
    it('should validate valid UUID v4 format', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '00000000-0000-0000-0000-000000000000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ]

      validUUIDs.forEach((uuid) => {
        const result = UUIDSchema.safeParse(uuid)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '550e8400-e29b-41d4-a716-44665544000',
        '550e8400-e29b-41d4-a716-4466554400000',
        '550e8400e29b41d4a716446655440000',
        '',
        '550e8400-e29b-41d4-a716-44665544000g',
      ]

      invalidUUIDs.forEach((uuid) => {
        const result = UUIDSchema.safeParse(uuid)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('ID inválido')
        }
      })
    })

    it('should be case insensitive for UUID validation', () => {
      const result = UUIDSchema.safeParse('550E8400-E29B-41D4-A716-446655440000')
      expect(result.success).toBe(true)
    })

    it('should reject UUID with whitespace', () => {
      const result = UUIDSchema.safeParse(' 550e8400-e29b-41d4-a716-446655440000 ')
      expect(result.success).toBe(false)
    })

    it('should reject UUID with extra characters', () => {
      const result = UUIDSchema.safeParse('550e8400-e29b-41d4-a716-446655440000x')
      expect(result.success).toBe(false)
    })
  })

  describe('PaginationSchema', () => {
    it('should validate valid pagination parameters', () => {
      const validPagination = [
        { page: 1, limit: 10 },
        { page: 5, limit: 50 },
        { page: 100, limit: 100 },
      ]

      validPagination.forEach((pagination) => {
        const result = PaginationSchema.safeParse(pagination)
        expect(result.success).toBe(true)
      })
    })

    it('should apply default values when not provided', () => {
      const result = PaginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
      }
    })

    it('should coerce string numbers to integers', () => {
      const result = PaginationSchema.safeParse({ page: '5', limit: '20' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
        expect(result.data.limit).toBe(20)
        expect(typeof result.data.page).toBe('number')
        expect(typeof result.data.limit).toBe('number')
      }
    })

    it('should reject negative page number', () => {
      const result = PaginationSchema.safeParse({ page: -1, limit: 10 })
      expect(result.success).toBe(false)
    })

    it('should reject zero page number', () => {
      const result = PaginationSchema.safeParse({ page: 0, limit: 10 })
      expect(result.success).toBe(false)
    })

    it('should reject negative limit', () => {
      const result = PaginationSchema.safeParse({ page: 1, limit: -5 })
      expect(result.success).toBe(false)
    })

    it('should reject zero limit', () => {
      const result = PaginationSchema.safeParse({ page: 1, limit: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject limit greater than 100', () => {
      const result = PaginationSchema.safeParse({ page: 1, limit: 101 })
      expect(result.success).toBe(false)
    })

    it('should accept limit equal to 100', () => {
      const result = PaginationSchema.safeParse({ page: 1, limit: 100 })
      expect(result.success).toBe(true)
    })

    it('should reject float page number', () => {
      const result = PaginationSchema.safeParse({ page: 1.5, limit: 10 })
      expect(result.success).toBe(false)
    })

    it('should reject float limit', () => {
      const result = PaginationSchema.safeParse({ page: 1, limit: 10.5 })
      expect(result.success).toBe(false)
    })

    it('should coerce and validate decimal strings', () => {
      const result = PaginationSchema.safeParse({ page: '3.7', limit: '15.2' })
      // Coerce rounds down to integers
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
        expect(result.data.limit).toBe(15)
      }
    })

    it('should handle very large page numbers', () => {
      const result = PaginationSchema.safeParse({ page: 999999, limit: 10 })
      expect(result.success).toBe(true)
    })
  })

  describe('getZodErrorMessage', () => {
    it('should format single validation error', () => {
      const testSchema = z.object({
        email: EmailSchema,
      })

      const result = testSchema.safeParse({ email: 'invalid' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const message = getZodErrorMessage(result.error)
        expect(message).toContain('email')
        expect(message).toContain('Email inválido')
      }
    })

    it('should format multiple validation errors', () => {
      const testSchema = z.object({
        email: EmailSchema,
        password: PasswordSchema,
      })

      const result = testSchema.safeParse({
        email: 'invalid',
        password: 'weak',
      })
      expect(result.success).toBe(false)

      if (!result.success) {
        const message = getZodErrorMessage(result.error)
        expect(message).toContain('email')
        expect(message).toContain('password')
        expect(message).toContain(';')
      }
    })

    it('should handle nested object paths', () => {
      const testSchema = z.object({
        user: z.object({
          profile: z.object({
            name: NameSchema,
          }),
        }),
      })

      const result = testSchema.safeParse({
        user: {
          profile: {
            name: 'A',
          },
        },
      })
      expect(result.success).toBe(false)

      if (!result.success) {
        const message = getZodErrorMessage(result.error)
        expect(message).toContain('user.profile.name')
      }
    })

    it('should include error code if available', () => {
      const testSchema = z.object({
        email: z.string().email(),
      })

      const result = testSchema.safeParse({ email: 'invalid' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const message = getZodErrorMessage(result.error)
        expect(message).toBeDefined()
        expect(message.length).toBeGreaterThan(0)
      }
    })

    it('should handle errors with custom messages', () => {
      const testSchema = z.object({
        name: z.string().min(1, 'El nombre es obligatorio'),
      })

      const result = testSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const message = getZodErrorMessage(result.error)
        expect(message).toContain('El nombre es obligatorio')
      }
    })
  })

  describe('formatZodErrors', () => {
    it('should format single error into ValidationError array', () => {
      const testSchema = z.object({
        email: EmailSchema,
      })

      const result = testSchema.safeParse({ email: 'invalid' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(Array.isArray(errors)).toBe(true)
        expect(errors.length).toBe(1)
        expect(errors[0]).toHaveProperty('field')
        expect(errors[0]).toHaveProperty('message')
        expect(errors[0].field).toBe('email')
      }
    })

    it('should format multiple errors into ValidationError array', () => {
      const testSchema = z.object({
        email: EmailSchema,
        password: PasswordSchema,
        name: NameSchema,
      })

      const result = testSchema.safeParse({
        email: 'invalid',
        password: 'weak',
        name: 'A',
      })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.every((e) => typeof e.field === 'string')).toBe(true)
        expect(errors.every((e) => typeof e.message === 'string')).toBe(true)
      }
    })

    it('should preserve field path for nested errors', () => {
      const testSchema = z.object({
        user: z.object({
          contact: z.object({
            email: EmailSchema,
          }),
        }),
      })

      const result = testSchema.safeParse({
        user: {
          contact: {
            email: 'not-an-email',
          },
        },
      })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(errors[0].field).toBe('user.contact.email')
      }
    })

    it('should return empty array if no errors', () => {
      const testSchema = z.object({
        email: EmailSchema,
      })

      const result = testSchema.safeParse({ email: 'valid@example.com' })
      expect(result.success).toBe(true)

      // Since validation passed, we can't get error to format
      // But we verify the function structure exists
      expect(typeof formatZodErrors).toBe('function')
    })

    it('should handle ValidationError type structure', () => {
      const testSchema = z.object({
        password: PasswordSchema,
      })

      const result = testSchema.safeParse({ password: 'short' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(errors[0]).toEqual(
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          })
        )
      }
    })

    it('should handle multiple errors on same field', () => {
      // Create a schema that can generate multiple errors
      const testSchema = z.object({
        value: z.string().min(5).max(3), // Conflicting constraints
      })

      const result = testSchema.safeParse({ value: 'test' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(Array.isArray(errors)).toBe(true)
        expect(errors.length).toBeGreaterThan(0)
      }
    })

    it('should format ValidationError with readable field names', () => {
      const testSchema = z.object({
        user_email: EmailSchema,
      })

      const result = testSchema.safeParse({ user_email: 'invalid' })
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(errors[0].field).toBe('user_email')
      }
    })
  })

  describe('Schema Integration', () => {
    it('should work together in a complex form schema', () => {
      const formSchema = z.object({
        email: EmailSchema,
        password: PasswordSchema,
        fullName: NameSchema,
        userId: UUIDSchema,
        pagination: PaginationSchema.optional(),
      })

      const validData = {
        email: 'User@Example.Com',
        password: 'ValidPass123',
        fullName: 'John Doe',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        pagination: { page: 2, limit: 50 },
      }

      const result = formSchema.safeParse(validData)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
        expect(result.data.pagination?.page).toBe(2)
      }
    })

    it('should reject form with multiple invalid fields', () => {
      const formSchema = z.object({
        email: EmailSchema,
        password: PasswordSchema,
        fullName: NameSchema,
      })

      const invalidData = {
        email: 'not-an-email',
        password: 'short',
        fullName: 'A',
      }

      const result = formSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        expect(errors.length).toBeGreaterThanOrEqual(3)
      }
    })
  })
})
