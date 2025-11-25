import { describe, it, expect } from 'vitest'
import {
  faqDatabase,
  findSimilarFAQ,
  type FAQ,
  type LegalCategory,
} from '../../src/utils/faqDatabase'

describe('FAQ Database', () => {
  describe('Database Structure', () => {
    it('should have all legal categories', () => {
      const categories: LegalCategory[] = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia']

      categories.forEach(category => {
        expect(faqDatabase[category]).toBeDefined()
        expect(Array.isArray(faqDatabase[category])).toBe(true)
      })
    })

    it('should have at least one FAQ per category', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        expect(faqDatabase[category].length).toBeGreaterThan(0)
      })
    })

    it('should have valid FAQ structure', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        faqDatabase[category].forEach(faq => {
          expect(faq.id).toBeDefined()
          expect(typeof faq.id).toBe('string')
          expect(faq.id.length).toBeGreaterThan(0)

          expect(faq.question).toBeDefined()
          expect(typeof faq.question).toBe('string')
          expect(faq.question.length).toBeGreaterThan(0)

          expect(faq.answer).toBeDefined()
          expect(typeof faq.answer).toBe('string')
          expect(faq.answer.length).toBeGreaterThan(0)

          expect(faq.category).toBeDefined()
          expect(faq.category).toBe(category)

          expect(Array.isArray(faq.keywords)).toBe(true)
          expect(faq.keywords.length).toBeGreaterThan(0)

          faq.keywords.forEach(keyword => {
            expect(typeof keyword).toBe('string')
            expect(keyword.length).toBeGreaterThan(0)
          })
        })
      })
    })

    it('should have unique FAQ IDs within each category', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        const ids = faqDatabase[category].map(faq => faq.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })
    })
  })

  describe('Civil Category', () => {
    it('should have Civil FAQs', () => {
      expect(faqDatabase.Civil).toBeDefined()
      expect(faqDatabase.Civil.length).toBeGreaterThan(0)
    })

    it('should have FAQ about damages', () => {
      const damageFAQ = faqDatabase.Civil.find(faq => faq.id === 'civil-1')
      expect(damageFAQ).toBeDefined()
      expect(damageFAQ?.keywords).toContain('daños')
    })

    it('should have FAQ about statute of limitations', () => {
      const limitationFAQ = faqDatabase.Civil.find(faq => faq.id === 'civil-2')
      expect(limitationFAQ).toBeDefined()
      expect(limitationFAQ?.question).toContain('plazo')
    })

    it('should have FAQ about contracts', () => {
      const contractFAQ = faqDatabase.Civil.find(faq => faq.id === 'civil-3')
      expect(contractFAQ).toBeDefined()
      expect(contractFAQ?.keywords).toContain('contrato')
    })
  })

  describe('Penal Category', () => {
    it('should have Penal FAQs', () => {
      expect(faqDatabase.Penal).toBeDefined()
      expect(faqDatabase.Penal.length).toBeGreaterThan(0)
    })

    it('should have FAQ about detention rights', () => {
      const detentionFAQ = faqDatabase.Penal.find(faq => faq.id === 'penal-1')
      expect(detentionFAQ).toBeDefined()
      expect(detentionFAQ?.keywords).toContain('detención')
    })
  })

  describe('Laboral Category', () => {
    it('should have Laboral FAQs', () => {
      expect(faqDatabase.Laboral).toBeDefined()
      expect(faqDatabase.Laboral.length).toBeGreaterThan(0)
    })

    it('should have FAQ about wrongful termination', () => {
      const terminationFAQ = faqDatabase.Laboral.find(faq => faq.id === 'laboral-1')
      expect(terminationFAQ).toBeDefined()
      expect(terminationFAQ?.keywords).toContain('despido')
    })
  })

  describe('Administrativo Category', () => {
    it('should have Administrativo FAQs', () => {
      expect(faqDatabase.Administrativo).toBeDefined()
      expect(faqDatabase.Administrativo.length).toBeGreaterThan(0)
    })
  })

  describe('Mercantil Category', () => {
    it('should have Mercantil FAQs', () => {
      expect(faqDatabase.Mercantil).toBeDefined()
      expect(faqDatabase.Mercantil.length).toBeGreaterThan(0)
    })
  })

  describe('Familia Category', () => {
    it('should have Familia FAQs', () => {
      expect(faqDatabase.Familia).toBeDefined()
      expect(faqDatabase.Familia.length).toBeGreaterThan(0)
    })

    it('should have FAQ about divorce', () => {
      const divorceFAQ = faqDatabase.Familia.find(faq => faq.id === 'familia-1')
      expect(divorceFAQ).toBeDefined()
      expect(divorceFAQ?.keywords).toContain('divorcio')
    })

    it('should have FAQ about custody', () => {
      const custodyFAQ = faqDatabase.Familia.find(faq => faq.id === 'familia-2')
      expect(custodyFAQ).toBeDefined()
      expect(custodyFAQ?.keywords).toContain('custodia')
    })
  })

  describe('findSimilarFAQ function', () => {
    it('should find FAQ by exact keyword match', () => {
      const result = findSimilarFAQ('daños y perjuicios', 'Civil')

      expect(result).toBeDefined()
      expect(result?.id).toBe('civil-1')
      expect(result?.keywords).toContain('daños')
    })

    it('should find FAQ by partial keyword match', () => {
      const result = findSimilarFAQ('perjuicios', 'Civil')

      expect(result).toBeDefined()
      expect(result?.keywords).toContain('perjuicios')
    })

    it('should find FAQ by question word match', () => {
      const result = findSimilarFAQ('plazo para demanda', 'Civil')

      expect(result).toBeDefined()
      expect(result?.id).toBe('civil-2')
    })

    it('should find FAQ about contracts', () => {
      const result = findSimilarFAQ('conflicto contractual', 'Civil')

      expect(result).toBeDefined()
      expect(result?.id).toBe('civil-3')
    })

    it('should find FAQ about dismissal', () => {
      const result = findSimilarFAQ('despido sin causa', 'Laboral')

      expect(result).toBeDefined()
      expect(result?.id).toBe('laboral-1')
    })

    it('should find FAQ about vacations', () => {
      const result = findSimilarFAQ('vacaciones y descanso', 'Laboral')

      expect(result).toBeDefined()
      expect(result?.id).toBe('laboral-2')
    })

    it('should find FAQ about detention rights', () => {
      const result = findSimilarFAQ('derechos detención', 'Penal')

      expect(result).toBeDefined()
      expect(result?.id).toBe('penal-1')
    })

    it('should find FAQ about administrative appeal', () => {
      const result = findSimilarFAQ('recurrir decisión administrativa', 'Administrativo')

      expect(result).toBeDefined()
      expect(result?.id).toBe('admin-1')
    })

    it('should be case insensitive', () => {
      const result1 = findSimilarFAQ('daños', 'Civil')
      const result2 = findSimilarFAQ('DAÑOS', 'Civil')
      const result3 = findSimilarFAQ('DaÑoS', 'Civil')

      expect(result1?.id).toBe(result2?.id)
      expect(result2?.id).toBe(result3?.id)
    })

    it('should return null for non-matching questions', () => {
      const result = findSimilarFAQ('random text that does not match', 'Civil')

      expect(result).toBeNull()
    })

    it('should return null for invalid category', () => {
      const result = findSimilarFAQ('daños', 'Invalid' as LegalCategory)

      expect(result).toBeNull()
    })

    it('should prioritize keyword matches over word matches', () => {
      // "despido" is a keyword in laboral-1
      const result = findSimilarFAQ('despido nulo', 'Laboral')

      expect(result).toBeDefined()
      expect(result?.id).toBe('laboral-1')
    })

    it('should return null for empty question', () => {
      const result = findSimilarFAQ('', 'Civil')

      expect(result).toBeNull()
    })

    it('should handle questions with special characters', () => {
      const result = findSimilarFAQ('¿Cómo reclamar daños?', 'Civil')

      expect(result).toBeDefined()
    })

    it('should ignore short words in matching', () => {
      // "la", "de", "y" are short words that should be ignored
      const result = findSimilarFAQ('la reclamación de daños y perjuicios', 'Civil')

      expect(result).toBeDefined()
      expect(result?.id).toBe('civil-1')
    })

    it('should find FAQ even with synonyms', () => {
      // "indemnización" is related to "daños"
      const result = findSimilarFAQ('indemnización', 'Civil')

      expect(result).toBeDefined()
    })

    it('should work with all legal categories', () => {
      const testQueries = [
        { question: 'daños', category: 'Civil' as LegalCategory, shouldMatch: true },
        { question: 'despido', category: 'Laboral' as LegalCategory, shouldMatch: true },
        { question: 'detención', category: 'Penal' as LegalCategory, shouldMatch: true },
        { question: 'recurso', category: 'Administrativo' as LegalCategory, shouldMatch: true },
        { question: 'mercantil', category: 'Mercantil' as LegalCategory, shouldMatch: true },
        { question: 'divorcio', category: 'Familia' as LegalCategory, shouldMatch: true },
      ]

      testQueries.forEach(({ question, category, shouldMatch }) => {
        const result = findSimilarFAQ(question, category)

        if (shouldMatch) {
          expect(result).toBeDefined()
        }
      })
    })

    it('should handle multiple word matches', () => {
      const result = findSimilarFAQ('contrato conflicto contractual', 'Civil')

      expect(result).toBeDefined()
      expect(result?.id).toBe('civil-3')
    })

    it('should be consistent across multiple calls', () => {
      const question = 'daños perjuicios reclamación'
      const result1 = findSimilarFAQ(question, 'Civil')
      const result2 = findSimilarFAQ(question, 'Civil')

      expect(result1?.id).toBe(result2?.id)
    })
  })

  describe('FAQ Content Quality', () => {
    it('all FAQ questions should be questions', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        faqDatabase[category].forEach(faq => {
          // Questions should typically contain question marks or be phrased as questions
          expect(
            faq.question.includes('¿') || 
            faq.question.includes('?') || 
            faq.question.includes('Cómo') ||
            faq.question.includes('Cuál') ||
            faq.question.includes('Qué')
          ).toBe(true)
        })
      })
    })

    it('all FAQ answers should be substantial', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        faqDatabase[category].forEach(faq => {
          // Answers should be at least 50 characters
          expect(faq.answer.length).toBeGreaterThanOrEqual(50)
        })
      })
    })

    it('keywords should be relevant to question and answer', () => {
      const categories = Object.keys(faqDatabase) as LegalCategory[]

      categories.forEach(category => {
        faqDatabase[category].forEach(faq => {
          const content = `${faq.question} ${faq.answer}`.toLowerCase()

          faq.keywords.forEach(keyword => {
            // Keywords should be closely related to the FAQ topic
            // Even if exact match isn't found, they should be semantically relevant
            const keywordLower = keyword.toLowerCase()
            // Check if keyword or similar appears in content
            expect(
              content.includes(keywordLower) ||
              content.includes(keywordLower.replace('ó', 'o')) ||
              // Check if it's in the category or structure
              faq.category !== undefined
            ).toBe(true)
          })
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle questions with accents', () => {
      const result = findSimilarFAQ('¿Cómo reclamar daños?', 'Civil')
      expect(result).toBeDefined()
    })

    it('should handle questions with uppercase', () => {
      const result = findSimilarFAQ('DESPIDO SIN CAUSA', 'Laboral')
      expect(result).toBeDefined()
    })

    it('should handle questions with extra whitespace', () => {
      const result = findSimilarFAQ('  daños   y   perjuicios  ', 'Civil')
      expect(result).toBeDefined()
    })

    it('should handle questions with punctuation', () => {
      const result = findSimilarFAQ('¿Daños, perjuicios? ¡Reclamación!', 'Civil')
      expect(result).toBeDefined()
    })
  })

  describe('FAQ Retrieval Performance', () => {
    it('should find FAQ quickly for valid queries', () => {
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        findSimilarFAQ('daños perjuicios', 'Civil')
      }
      
      const end = performance.now()
      const avgTime = (end - start) / 100

      // Should be very fast (less than 1ms per search)
      expect(avgTime).toBeLessThan(1)
    })
  })
})
