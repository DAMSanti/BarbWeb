import { describe, it, expect } from 'vitest'
import {
  CreateFAQSchema,
  UpdateFAQSchema,
  GetFAQSchema,
  DeleteFAQSchema,
  ListFAQSchema,
  SearchFAQSchema,
  FilterQuestionSchema,
  GenerateDetailedResponseSchema,
} from '../../src/schemas/faq.schemas.js'

describe('FAQ Schemas', () => {
  describe('CreateFAQSchema', () => {
    it('should validate valid FAQ creation data', () => {
      const validData = {
        body: {
          category: 'Legal',
          question: 'What are my rights as a tenant?',
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: ['tenant', 'rights', 'housing'],
        },
      }

      const result = CreateFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject category shorter than 2 characters', () => {
      const invalidData = {
        body: {
          category: 'L',
          question: 'What are my rights as a tenant?',
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject question shorter than 10 characters', () => {
      const invalidData = {
        body: {
          category: 'Legal',
          question: 'Short?',
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject answer shorter than 20 characters', () => {
      const invalidData = {
        body: {
          category: 'Legal',
          question: 'What are my rights as a tenant?',
          answer: 'Short answer.',
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty keywords array', () => {
      const invalidData = {
        body: {
          category: 'Legal',
          question: 'What are my rights as a tenant?',
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: [],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject category longer than 100 characters', () => {
      const invalidData = {
        body: {
          category: 'A'.repeat(101),
          question: 'What are my rights as a tenant?',
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject question longer than 1000 characters', () => {
      const invalidData = {
        body: {
          category: 'Legal',
          question: 'Q'.repeat(1001),
          answer: 'As a tenant, you have the right to a habitable dwelling...',
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject answer longer than 5000 characters', () => {
      const invalidData = {
        body: {
          category: 'Legal',
          question: 'What are my rights as a tenant?',
          answer: 'A'.repeat(5001),
          keywords: ['tenant'],
        },
      }

      const result = CreateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateFAQSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        body: {
          category: 'Updated Category',
        },
      }

      const result = UpdateFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate empty body (no updates)', () => {
      const validData = {
        body: {},
      }

      const result = UpdateFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate full update data', () => {
      const validData = {
        body: {
          category: 'Updated Category',
          question: 'Updated question with at least 10 chars',
          answer: 'Updated answer with at least 20 characters',
          keywords: ['updated', 'keywords'],
        },
      }

      const result = UpdateFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject short category if provided', () => {
      const invalidData = {
        body: {
          category: 'A',
        },
      }

      const result = UpdateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short question if provided', () => {
      const invalidData = {
        body: {
          question: 'Short',
        },
      }

      const result = UpdateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short answer if provided', () => {
      const invalidData = {
        body: {
          answer: 'Short answer',
        },
      }

      const result = UpdateFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('GetFAQSchema', () => {
    it('should validate valid UUID', () => {
      const validData = {
        params: {
          faqId: '123e4567-e89b-12d3-a456-426614174000',
        },
      }

      const result = GetFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const invalidData = {
        params: {
          faqId: 'not-a-valid-uuid',
        },
      }

      const result = GetFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty faqId', () => {
      const invalidData = {
        params: {
          faqId: '',
        },
      }

      const result = GetFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('DeleteFAQSchema', () => {
    it('should validate valid UUID', () => {
      const validData = {
        params: {
          faqId: '123e4567-e89b-12d3-a456-426614174000',
        },
      }

      const result = DeleteFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const invalidData = {
        params: {
          faqId: 'invalid-uuid',
        },
      }

      const result = DeleteFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('ListFAQSchema', () => {
    it('should validate with all query params', () => {
      const validData = {
        query: {
          category: 'Legal',
          page: 1,
          limit: 10,
        },
      }

      const result = ListFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should apply default values for page and limit', () => {
      const validData = {
        query: {},
      }

      const result = ListFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(1)
        expect(result.data.query.limit).toBe(10)
      }
    })

    it('should coerce string page to number', () => {
      const validData = {
        query: {
          page: '5',
          limit: '20',
        },
      }

      const result = ListFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(5)
        expect(result.data.query.limit).toBe(20)
      }
    })

    it('should reject limit greater than 100', () => {
      const invalidData = {
        query: {
          limit: 150,
        },
      }

      const result = ListFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative page', () => {
      const invalidData = {
        query: {
          page: -1,
        },
      }

      const result = ListFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject zero page', () => {
      const invalidData = {
        query: {
          page: 0,
        },
      }

      const result = ListFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('SearchFAQSchema', () => {
    it('should validate search query', () => {
      const validData = {
        body: {
          query: 'tenant rights',
        },
      }

      const result = SearchFAQSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject query shorter than 2 characters', () => {
      const invalidData = {
        body: {
          query: 'a',
        },
      }

      const result = SearchFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject query longer than 500 characters', () => {
      const invalidData = {
        body: {
          query: 'Q'.repeat(501),
        },
      }

      const result = SearchFAQSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('FilterQuestionSchema', () => {
    it('should validate question and apply transform', () => {
      const validData = {
        body: {
          question: '   What are my legal rights?   ',
        },
      }

      const result = FilterQuestionSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.body.question).toBe('What are my legal rights?')
      }
    })

    it('should trim whitespace from question', () => {
      const validData = {
        body: {
          question: '\n\t  How do I file for divorce?  \n\t',
        },
      }

      const result = FilterQuestionSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.body.question).toBe('How do I file for divorce?')
      }
    })

    it('should reject question shorter than 10 characters after trim', () => {
      const invalidData = {
        body: {
          question: '   Short?   ',
        },
      }

      const result = FilterQuestionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject question longer than 1000 characters', () => {
      const invalidData = {
        body: {
          question: 'Q'.repeat(1001),
        },
      }

      const result = FilterQuestionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept question at exactly 10 characters', () => {
      const validData = {
        body: {
          question: '1234567890',
        },
      }

      const result = FilterQuestionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept question at exactly 1000 characters', () => {
      const validData = {
        body: {
          question: 'Q'.repeat(1000),
        },
      }

      const result = FilterQuestionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('GenerateDetailedResponseSchema', () => {
    it('should validate question and category with transforms', () => {
      const validData = {
        body: {
          question: '   What are my options?   ',
          category: '   Laboral   ',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.body.question).toBe('What are my options?')
        expect(result.data.body.category).toBe('Laboral')
      }
    })

    it('should trim whitespace from both fields', () => {
      const validData = {
        body: {
          question: '\n  How do I handle this?  \t',
          category: '\t  Familiar  \n',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.body.question).toBe('How do I handle this?')
        expect(result.data.body.category).toBe('Familiar')
      }
    })

    it('should reject short question', () => {
      const invalidData = {
        body: {
          question: 'Short',
          category: 'Legal',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short category', () => {
      const invalidData = {
        body: {
          question: 'What are my legal rights in this case?',
          category: 'L',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject category longer than 100 characters', () => {
      const invalidData = {
        body: {
          question: 'What are my legal rights in this case?',
          category: 'C'.repeat(101),
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept category at exactly 2 characters', () => {
      const validData = {
        body: {
          question: 'What are my legal rights?',
          category: 'AB',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept category at exactly 100 characters', () => {
      const validData = {
        body: {
          question: 'What are my legal rights?',
          category: 'C'.repeat(100),
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing question', () => {
      const invalidData = {
        body: {
          category: 'Legal',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing category', () => {
      const invalidData = {
        body: {
          question: 'What are my legal rights in this case?',
        },
      }

      const result = GenerateDetailedResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
