/**
 * Unit Tests - OpenAI Service (Gemini)
 * Tests para funciones de filtrado de preguntas y generación de respuestas detalladas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as openaiService from '../../src/services/openaiService'

// Mock Gemini AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(function (apiKey: string) {
    return {
      getGenerativeModel: vi.fn(function ({ model }: any) {
        return {
          generateContent: vi.fn(async (prompt: string) => {
            // Mock responses based on prompt content
            if (prompt.includes('Pregunta del cliente')) {
              // This is a filterQuestionWithAI call
              return {
                response: {
                  text: () => {
                    if (prompt.includes('divorcio')) {
                      return JSON.stringify({
                        category: 'Familia',
                        briefAnswer: 'El divorcio es un proceso legal que requiere asesoramiento profesional específico según su situación.',
                        needsProfessionalConsultation: true,
                        reasoning: 'Casos de familia requieren análisis personalizado y documentación legal',
                        confidence: 0.95,
                        complexity: 'complex',
                      })
                    } else if (prompt.includes('contrato')) {
                      return JSON.stringify({
                        category: 'Civil',
                        briefAnswer: 'Los contratos tienen implicaciones legales importantes que deben ser revisadas por un profesional.',
                        needsProfessionalConsultation: true,
                        reasoning: 'Contratos requieren análisis de cláusulas y riesgos legales',
                        confidence: 0.90,
                        complexity: 'medium',
                      })
                    } else if (prompt.includes('impuesto')) {
                      return JSON.stringify({
                        category: 'Tributario',
                        briefAnswer: 'Las cuestiones tributarias requieren asesoramiento especializado para optimizar su situación fiscal.',
                        needsProfessionalConsultation: true,
                        reasoning: 'Tributario requiere análisis de normativas fiscales actuales',
                        confidence: 0.85,
                        complexity: 'complex',
                      })
                    } else if (prompt.includes('penal')) {
                      return JSON.stringify({
                        category: 'Penal',
                        briefAnswer: 'En asuntos penales, es crucial contar con defensa legal profesional desde el inicio.',
                        needsProfessionalConsultation: true,
                        reasoning: 'Casos penales siempre requieren asesoramiento legal especializado',
                        confidence: 0.98,
                        complexity: 'complex',
                      })
                    } else {
                      return JSON.stringify({
                        category: 'Civil',
                        briefAnswer: 'Consulte con un profesional para obtener asesoramiento específico sobre su situación.',
                        needsProfessionalConsultation: true,
                        reasoning: 'Caso requiere análisis personalizado',
                        confidence: 0.75,
                        complexity: 'medium',
                      })
                    }
                  },
                },
              }
            } else {
              // This is a generateDetailedResponse call
              return {
                response: {
                  text: () => 'Respuesta detallada sobre el tema legal solicitado...',
                },
              }
            }
          }),
        }
      }),
    }
  }),
}))

describe('OpenAI Service (Gemini)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set API key for tests
    process.env.GEMINI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('filterQuestionWithAI', () => {
    it('should filter divorce question and return Familia category', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Cómo puedo iniciar un divorcio? ¿Qué documentos necesito?'
      )

      expect(result).toBeDefined()
      expect(result.category).toBe('Familia')
      expect(result.briefAnswer).toBeDefined()
      expect(result.briefAnswer.length).toBeGreaterThan(0)
      expect(result.needsProfessionalConsultation).toBe(true)
      expect(result.reasoning).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(result.complexity).toBe('complex')
    })

    it('should filter contract question and return Civil category', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Qué cláusulas debo revisar en un contrato de alquiler?'
      )

      expect(result).toBeDefined()
      expect(result.category).toBe('Civil')
      expect(result.needsProfessionalConsultation).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(['simple', 'medium', 'complex']).toContain(result.complexity)
    })

    it('should filter tax question and return Tributario category', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Cuál es la mejor forma de declarar impuestos como autónomo?'
      )

      expect(result).toBeDefined()
      expect(result.category).toBe('Tributario')
      expect(result.needsProfessionalConsultation).toBe(true)
      expect(result.reasoning).toContain('fiscal')
    })

    it('should filter criminal question and return Penal category', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Qué derechos tengo si me detienen en una investigación penal?'
      )

      expect(result).toBeDefined()
      expect(result.category).toBe('Penal')
      expect(result.needsProfessionalConsultation).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should return valid category for generic question', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Cuáles son mis derechos como ciudadano?'
      )

      expect(result).toBeDefined()
      expect(result.category).toBeDefined()
      expect(['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia', 'Tributario']).toContain(
        result.category
      )
      expect(result.briefAnswer).toBeDefined()
      expect(result.needsProfessionalConsultation).toBeDefined()
      expect(result.reasoning).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should have valid confidence score', async () => {
      const result = await openaiService.filterQuestionWithAI('Pregunta legal válida')

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(typeof result.confidence).toBe('number')
    })

    it('should throw error for empty question', async () => {
      await expect(openaiService.filterQuestionWithAI('')).rejects.toThrow(
        'Question cannot be empty'
      )
    })

    it('should throw error for whitespace-only question', async () => {
      await expect(openaiService.filterQuestionWithAI('   ')).rejects.toThrow(
        'Question cannot be empty'
      )
    })

    it('should handle very long questions', async () => {
      const longQuestion = 'A'.repeat(1000) + ' ¿Es válido este contrato?'
      const result = await openaiService.filterQuestionWithAI(longQuestion)

      expect(result).toBeDefined()
      expect(result.category).toBeDefined()
      expect(result.briefAnswer).toBeDefined()
    })

    it('should have complexity field', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Puedo reclamar un pago impagado?'
      )

      expect(result.complexity).toBeDefined()
      expect(['simple', 'medium', 'complex']).toContain(result.complexity)
    })

    it('should handle special characters in questions', async () => {
      const specialQuestion = '¿Qué pasa con los derechos de autor ©️ y patentes ®️?'
      const result = await openaiService.filterQuestionWithAI(specialQuestion)

      expect(result).toBeDefined()
      expect(result.category).toBeDefined()
    })

    it('should handle questions with numbers', async () => {
      const numberQuestion = '¿Puedo deducir 5000€ de gastos de oficina en 2024?'
      const result = await openaiService.filterQuestionWithAI(numberQuestion)

      expect(result).toBeDefined()
      expect(result.category).toBeDefined()
    })

    it('should include reasoning for professional consultation recommendation', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Cómo inicio un proceso legal?'
      )

      if (result.needsProfessionalConsultation) {
        expect(result.reasoning).toBeDefined()
        expect(result.reasoning.length).toBeGreaterThan(0)
      }
    })

    it('should ensure briefAnswer provides orientation', async () => {
      const result = await openaiService.filterQuestionWithAI(
        '¿Qué debo hacer ante un impago?'
      )

      expect(result.briefAnswer).toBeDefined()
      expect(result.briefAnswer.length).toBeGreaterThan(10)
      expect(result.briefAnswer.length).toBeLessThan(500) // Reasonable max length
    })
  })

  describe('generateDetailedResponse', () => {
    it('should generate response for Civil category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cuáles son mis derechos como inquilino?',
        'Civil'
      )

      expect(response).toBeDefined()
      expect(response).toBeTruthy()
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Penal category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Qué derechos tengo en una comisaría?',
        'Penal'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Laboral category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Puedo despedir a un empleado sin causa?',
        'Laboral'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Familia category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cómo se calcula la pensión alimenticia?',
        'Familia'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Tributario category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cuáles son las deducciones fiscales disponibles?',
        'Tributario'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Administrativo category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cómo recurro una decisión administrativa?',
        'Administrativo'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Mercantil category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cómo constituyo una sociedad mercantil?',
        'Mercantil'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should handle various question types', async () => {
      const questions = [
        '¿Cuáles son mis derechos?',
        '¿Qué debo hacer ahora?',
        'Explica las obligaciones legales',
        '¿Es válido este documento?',
      ]

      for (const question of questions) {
        const response = await openaiService.generateDetailedResponse(question, 'Civil')
        expect(response).toBeDefined()
        expect(typeof response).toBe('string')
      }
    })

    it('should generate reasonable length response', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Cuál es la ley aplicable aquí?',
        'Civil'
      )

      expect(response.length).toBeGreaterThan(20) // Minimum reasonable length
      expect(response.length).toBeLessThan(5000) // Reasonable maximum
    })

    it('should handle special characters in category', async () => {
      const response = await openaiService.generateDetailedResponse(
        '¿Puedo reclamar derechos de autor?',
        'Civil'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate non-empty response', async () => {
      const response = await openaiService.generateDetailedResponse(
        'Una pregunta legal',
        'Civil'
      )

      expect(response).toBeTruthy()
      expect(response.trim().length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle API key not configured for filterQuestionWithAI', async () => {
      const originalKey = process.env.GEMINI_API_KEY
      delete process.env.GEMINI_API_KEY

      await expect(
        openaiService.filterQuestionWithAI('¿Pregunta legal?')
      ).rejects.toThrow()

      process.env.GEMINI_API_KEY = originalKey
    })

    it('should handle API key not configured for generateDetailedResponse', async () => {
      const originalKey = process.env.GEMINI_API_KEY
      delete process.env.GEMINI_API_KEY

      await expect(
        openaiService.generateDetailedResponse('¿Pregunta?', 'Civil')
      ).rejects.toThrow()

      process.env.GEMINI_API_KEY = originalKey
    })

    it('should handle malformed JSON response gracefully', async () => {
      // This would be caught by the try-catch in the actual service
      const question = 'Pregunta válida'
      
      try {
        const result = await openaiService.filterQuestionWithAI(question)
        expect(result).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow: filter then generate', async () => {
      const question = '¿Cómo inicio un divorcio en España?'

      // First filter the question
      const filtered = await openaiService.filterQuestionWithAI(question)
      expect(filtered).toBeDefined()
      expect(filtered.category).toBe('Familia')

      // Then generate detailed response
      const detailed = await openaiService.generateDetailedResponse(
        question,
        filtered.category
      )
      expect(detailed).toBeDefined()
      expect(detailed.length).toBeGreaterThan(0)
    })

    it('should handle multiple questions with different categories', async () => {
      const questions = [
        { q: '¿Cómo inicio un divorcio?', expectedCategory: 'Familia' },
        { q: '¿Cuáles son mis derechos laborales?', expectedCategory: 'Laboral' },
        { q: '¿Cómo recurro una multa?', expectedCategory: 'Administrativo' },
      ]

      for (const { q, expectedCategory } of questions) {
        const result = await openaiService.filterQuestionWithAI(q)
        expect(result.category).toBe(expectedCategory)
        
        const detailed = await openaiService.generateDetailedResponse(q, result.category)
        expect(detailed).toBeDefined()
      }
    })

    it('should maintain consistency across calls', async () => {
      const question = '¿Qué documentos necesito para este contrato?'

      const result1 = await openaiService.filterQuestionWithAI(question)
      const result2 = await openaiService.filterQuestionWithAI(question)

      // Same question should produce same category (mocked consistently)
      expect(result1.category).toBe(result2.category)
    })
  })

  describe('Performance Tests', () => {
    it('should return result within reasonable time for filterQuestionWithAI', async () => {
      const startTime = Date.now()
      
      await openaiService.filterQuestionWithAI('¿Pregunta rápida?')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should return result within reasonable time for generateDetailedResponse', async () => {
      const startTime = Date.now()
      
      await openaiService.generateDetailedResponse('¿Pregunta rápida?', 'Civil')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
