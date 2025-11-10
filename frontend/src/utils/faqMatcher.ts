import { FAQ, LegalCategory } from '../types'

// Base de datos simulada de FAQs por categoría
export const faqDatabase: Record<LegalCategory, FAQ[]> = {
  Civil: [
    {
      id: '1',
      question: '¿Cómo puedo reclamar daños y perjuicios?',
      answer: 'Para reclamar daños y perjuicios debe demostrar: 1) El daño sufrido, 2) La responsabilidad del demandado, 3) El nexo causal. Puede realizarlo mediante demanda ante los juzgados.',
      category: 'Civil',
    },
    {
      id: '2',
      question: '¿Qué plazo tengo para presentar una demanda?',
      answer: 'El plazo general es de 5 años desde que se produjo el daño. Sin embargo, existen plazos especiales según el tipo de reclamación.',
      category: 'Civil',
    },
  ],
  Penal: [
    {
      id: '3',
      question: '¿Cuáles son mis derechos si me detienen?',
      answer: 'Tiene derecho a: ser informado de los derechos, guardar silencio, tener un abogado, y a no confesar. La detención tiene límite de 72 horas.',
      category: 'Penal',
    },
    {
      id: '4',
      question: '¿Qué diferencia hay entre falta y delito?',
      answer: 'Las faltas son infracciones leves sancionadas con multa o trabajos en beneficio de la comunidad. Los delitos tienen penas más graves.',
      category: 'Penal',
    },
  ],
  Laboral: [
    {
      id: '5',
      question: '¿Cuál es el salario mínimo interprofesional?',
      answer: 'El SMI se actualiza anualmente. Puede consultar la última cifra en el Boletín Oficial del Estado (BOE).',
      category: 'Laboral',
    },
    {
      id: '6',
      question: '¿Puede despedirme sin justa causa?',
      answer: 'No. El despido debe tener causa justificada. Un despido sin causa es nulo y tiene derecho a reincoporación o indemnización.',
      category: 'Laboral',
    },
  ],
  Administrativo: [
    {
      id: '7',
      question: '¿Cómo recurro una decisión administrativa?',
      answer: 'Puede presentar recursos administrativos (reposición, alzada) antes de acudir a los juzgados contencioso-administrativos.',
      category: 'Administrativo',
    },
  ],
  Mercantil: [
    {
      id: '8',
      question: '¿Qué es un contrato mercantil?',
      answer: 'Es un acuerdo entre comerciantes para realizar operaciones comerciales. Se rige por el Código de Comercio.',
      category: 'Mercantil',
    },
  ],
  Familia: [
    {
      id: '9',
      question: '¿Cómo divorciarme?',
      answer: 'Puede divorciarse de mutuo acuerdo mediante proceso de común acuerdo, o contenciosamente si existe desacuerdo. Requiere procedimiento judicial.',
      category: 'Familia',
    },
  ],
}

// Palabras clave para detectar categorías automáticamente
export const categoryKeywords: Record<LegalCategory, string[]> = {
  Civil: ['daños', 'perjuicios', 'responsabilidad civil', 'indemnización', 'accidente', 'contrato'],
  Penal: ['delito', 'crimen', 'robo', 'fraude', 'detención', 'acusación', 'antecedentes'],
  Laboral: ['despido', 'salario', 'contrato laboral', 'horas', 'vacaciones', 'trabajador'],
  Administrativo: ['ayuntamiento', 'administración', 'recurso', 'licencia', 'permiso'],
  Mercantil: ['empresa', 'comercio', 'negocio', 'proveedor', 'cliente', 'factura'],
  Familia: ['divorcio', 'custodia', 'pensión', 'herencia', 'matrimonio', 'hijos'],
}

// Función para detectar la categoría de una pregunta
export const detectCategory = (question: string): LegalCategory | null => {
  const lowerQuestion = question.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return category as LegalCategory
    }
  }

  return null
}

// Función para buscar respuestas automáticas en la base de datos
export const findAutoResponse = (question: string, category: LegalCategory): FAQ | null => {
  const faqList = faqDatabase[category] || []
  const lowerQuestion = question.toLowerCase()

  // Buscar coincidencias parciales
  return faqList.find(faq => {
    const faqWords = faq.question.toLowerCase().split(' ')
    const questionWords = lowerQuestion.split(' ')
    const matches = faqWords.filter(word => questionWords.includes(word))
    return matches.length >= 2
  }) || null
}

// Función para calcular similitud entre preguntas (implementación simple)
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 100
  const editDistance = getEditDistance(longer, shorter)
  return ((longer.length - editDistance) / longer.length) * 100
}

// Distancia de edición (Levenshtein)
const getEditDistance = (s1: string, s2: string): number => {
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}
