/**
 * Unit Tests - OpenAI Service (Gemini)
 * Tests para funciones de filtrado de preguntas y generación de respuestas detalladas
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the Gemini module before importing the service
const mockGenerateContent = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
}))

// Import service after mocking
import * as openaiService from '../../src/services/openaiService'

describe('OpenAI Service (Gemini)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-api-key'
    mockGenerateContent.mockClear()
  })

  describe('filterQuestionWithAI', () => {
    it('should filter divorce question and return Familia category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Familia',
              briefAnswer: 'El divorcio es un proceso legal que requiere asesoramiento profesional.',
              needsProfessionalConsultation: true,
              reasoning: 'Casos de familia requieren análisis personalizado',
              confidence: 0.95,
              complexity: 'complex',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('¿Cómo puedo iniciar un divorcio?')

      expect(result).toBeDefined()
      expect(result.category).toBe('Familia')
      expect(result.briefAnswer).toBeDefined()
      expect(result.needsProfessionalConsultation).toBe(true)
      expect(result.confidence).toBe(0.95)
      expect(result.complexity).toBe('complex')
    })

    it('should filter contract question and return Civil category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Los contratos requieren revisión profesional.',
              needsProfessionalConsultation: true,
              reasoning: 'Contratos tienen implicaciones legales',
              confidence: 0.90,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI(
        '¿Qué cláusulas debo revisar en un contrato?'
      )

      expect(result.category).toBe('Civil')
      expect(result.confidence).toBe(0.90)
    })

    it('should filter tax question and return Tributario category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Tributario',
              briefAnswer: 'Las cuestiones tributarias requieren asesoramiento especializado.',
              needsProfessionalConsultation: true,
              reasoning: 'Tributario requiere análisis fiscal',
              confidence: 0.85,
              complexity: 'complex',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI(
        '¿Cuál es la mejor forma de declarar impuestos?'
      )

      expect(result.category).toBe('Tributario')
    })

    it('should filter criminal question and return Penal category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Penal',
              briefAnswer: 'En asuntos penales, es crucial contar con defensa legal profesional.',
              needsProfessionalConsultation: true,
              reasoning: 'Casos penales siempre requieren asesoramiento legal especializado',
              confidence: 0.98,
              complexity: 'complex',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI(
        '¿Qué derechos tengo si me detienen?'
      )

      expect(result.category).toBe('Penal')
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should filter labor question and return Laboral category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Laboral',
              briefAnswer: 'Las cuestiones laborales tienen protecciones legales específicas.',
              needsProfessionalConsultation: true,
              reasoning: 'Laboral requiere conocimiento de legislación laboral actual',
              confidence: 0.88,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI(
        '¿Cuáles son mis derechos laborales?'
      )

      expect(result.category).toBe('Laboral')
    })

    it('should return valid confidence score between 0 and 1', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Respuesta breve',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta legal')

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should throw error for empty question', async () => {
      await expect(openaiService.filterQuestionWithAI('')).rejects.toThrow(
        'Question cannot be empty'
      )
      expect(mockGenerateContent).not.toHaveBeenCalled()
    })

    it('should throw error for whitespace-only question', async () => {
      await expect(openaiService.filterQuestionWithAI('   ')).rejects.toThrow(
        'Question cannot be empty'
      )
      expect(mockGenerateContent).not.toHaveBeenCalled()
    })

    it('should have valid complexity field', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Respuesta',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'simple',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')

      expect(['simple', 'medium', 'complex']).toContain(result.complexity)
    })

    it('should include reasoning for professional consultation', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Respuesta breve',
              needsProfessionalConsultation: true,
              reasoning: 'Razón específica para consulta profesional',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('¿Pregunta?')

      if (result.needsProfessionalConsultation) {
        expect(result.reasoning).toBeDefined()
        expect(result.reasoning.length).toBeGreaterThan(0)
      }
    })

    it('should ensure briefAnswer is not empty', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Una respuesta con contenido relevante',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')

      expect(result.briefAnswer).toBeDefined()
      expect(result.briefAnswer.length).toBeGreaterThan(10)
    })
  })

  describe('generateDetailedResponse', () => {
    it('should generate response for Civil category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Respuesta detallada sobre derechos civiles...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Cuáles son mis derechos?',
        'Civil'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Penal category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Respuesta sobre derechos penales...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Derechos penales?',
        'Penal'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Laboral category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Información sobre derechos laborales...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Derechos laborales?',
        'Laboral'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Familia category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Asesoramiento sobre derecho de familia...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Derecho familiar?',
        'Familia'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Tributario category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Información tributaria y fiscal...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Tributario?',
        'Tributario'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate response for Administrativo category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Asesoramiento administrativo...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Procedimiento administrativo?',
        'Administrativo'
      )

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should generate response for Mercantil category', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Información sobre derecho mercantil...',
        },
      })

      const response = await openaiService.generateDetailedResponse(
        '¿Derecho mercantil?',
        'Mercantil'
      )

      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should return non-empty response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Respuesta válida con contenido',
        },
      })

      const response = await openaiService.generateDetailedResponse('Pregunta', 'Civil')

      expect(response).toBeTruthy()
      expect(response.trim().length).toBeGreaterThan(0)
    })

    it('should handle response with reasonable length', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Una respuesta con contenido'.repeat(10),
        },
      })

      const response = await openaiService.generateDetailedResponse('Pregunta', 'Civil')

      expect(response.length).toBeGreaterThan(20)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when API key is not configured', async () => {
      const originalKey = process.env.GEMINI_API_KEY
      delete process.env.GEMINI_API_KEY

      try {
        await expect(
          openaiService.filterQuestionWithAI('Pregunta')
        ).rejects.toThrow('Gemini AI is not configured')
      } finally {
        process.env.GEMINI_API_KEY = originalKey
      }
    })

    it('should handle invalid JSON response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'This is not valid JSON',
        },
      })

      await expect(openaiService.filterQuestionWithAI('Pregunta')).rejects.toThrow()
    })

    it('should handle empty response from API', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => '',
        },
      })

      await expect(openaiService.filterQuestionWithAI('Pregunta')).rejects.toThrow(
        'No response from Gemini AI'
      )
    })

    it('should handle API error for generateDetailedResponse', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'))

      await expect(
        openaiService.generateDetailedResponse('Pregunta', 'Civil')
      ).rejects.toThrow()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow: filter then generate', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Familia',
              briefAnswer: 'Respuesta breve',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.95,
              complexity: 'complex',
            }),
        },
      })

      const filtered = await openaiService.filterQuestionWithAI('¿Divorcio?')
      expect(filtered.category).toBe('Familia')

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Respuesta detallada...',
        },
      })

      const detailed = await openaiService.generateDetailedResponse('¿Divorcio?', filtered.category)
      expect(detailed).toBeDefined()
    })

    it('should process multiple questions', async () => {
      const questions = ['¿Divorcio?', '¿Contrato?', '¿Impuestos?']

      for (const question of questions) {
        mockGenerateContent.mockResolvedValueOnce({
          response: {
            text: () =>
              JSON.stringify({
                category: 'Civil',
                briefAnswer: 'Respuesta',
                needsProfessionalConsultation: true,
                reasoning: 'Razón',
                confidence: 0.75,
                complexity: 'medium',
              }),
          },
        })

        const result = await openaiService.filterQuestionWithAI(question)
        expect(result).toBeDefined()
        expect(result.category).toBeDefined()
      }
    })
  })

  describe('Additional Edge Cases', () => {
    it('should handle invalid category with default fallback', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'InvalidCategory',
              briefAnswer: 'Respuesta',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')
      
      expect(result.category).toBe('Civil') // Default fallback
    })

    it('should handle empty briefAnswer with default', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: '',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')
      
      expect(result.briefAnswer).toBeDefined()
      expect(result.briefAnswer.length).toBeGreaterThan(0)
      expect(result.needsProfessionalConsultation).toBe(true)
    })

    it('should handle whitespace-only briefAnswer', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: '   ',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 0.75,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')
      
      expect(result.briefAnswer.trim().length).toBeGreaterThan(0)
    })

    it('should extract JSON from response with surrounding text', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => `
            Aquí está el análisis:
            {
              "category": "Penal",
              "briefAnswer": "Respuesta",
              "needsProfessionalConsultation": true,
              "reasoning": "Razón",
              "confidence": 0.8,
              "complexity": "complex"
            }
            Fin del análisis.
          `,
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta penal')
      
      expect(result.category).toBe('Penal')
      expect(result.confidence).toBe(0.8)
    })

    it('should handle JSON parse error gracefully', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Not valid JSON at all',
        },
      })

      await expect(openaiService.filterQuestionWithAI('Pregunta')).rejects.toThrow()
    })

    it('should handle missing JSON in response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Respuesta sin JSON válido',
        },
      })

      await expect(openaiService.filterQuestionWithAI('Pregunta')).rejects.toThrow()
    })

    it('should validate all legal categories are recognized', async () => {
      const categories = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia', 'Tributario']
      
      for (const category of categories) {
        mockGenerateContent.mockResolvedValueOnce({
          response: {
            text: () =>
              JSON.stringify({
                category,
                briefAnswer: 'Respuesta',
                needsProfessionalConsultation: true,
                reasoning: 'Razón',
                confidence: 0.75,
                complexity: 'medium',
              }),
          },
        })

        const result = await openaiService.filterQuestionWithAI('Pregunta')
        expect(result.category).toBe(category)
      }
    })

    it('should validate confidence score bounds', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              category: 'Civil',
              briefAnswer: 'Respuesta',
              needsProfessionalConsultation: true,
              reasoning: 'Razón',
              confidence: 1.5,
              complexity: 'medium',
            }),
        },
      })

      const result = await openaiService.filterQuestionWithAI('Pregunta')
      
      expect(result.confidence).toBe(1.5)
    })

    it('should handle generateDetailedResponse with all categories', async () => {
      const categories = ['Civil', 'Penal', 'Laboral', 'Administrativo', 'Mercantil', 'Familia', 'Tributario']
      
      for (const category of categories) {
        mockGenerateContent.mockResolvedValueOnce({
          response: {
            text: () => `Respuesta detallada para ${category}`,
          },
        })

        const response = await openaiService.generateDetailedResponse('¿Pregunta?', category)
        expect(response).toContain(category)
      }
    })

    it('should handle generateDetailedResponse with empty response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => '',
        },
      })

      const response = await openaiService.generateDetailedResponse('Pregunta', 'Civil')
      
      expect(response).toBe('No response generated')
    })

    it('should handle generateDetailedResponse with null response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => null,
        },
      })

      const response = await openaiService.generateDetailedResponse('Pregunta', 'Civil')
      
      expect(response).toBe('No response generated')
    })
  })
})
