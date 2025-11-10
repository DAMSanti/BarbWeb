export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  keywords: string[]
}

export type LegalCategory = 'Civil' | 'Penal' | 'Laboral' | 'Administrativo' | 'Mercantil' | 'Familia'

export const faqDatabase: Record<LegalCategory, FAQ[]> = {
  Civil: [
    {
      id: 'civil-1',
      question: '¿Cómo puedo reclamar daños y perjuicios?',
      answer:
        'Para reclamar daños y perjuicios debe demostrar: 1) El daño sufrido cuantificable, 2) La responsabilidad del demandado (culpa o negligencia), 3) El nexo causal entre la acción y el daño. Puede presentar una demanda ante los juzgados civiles. El plazo general es de 5 años desde el evento dañoso.',
      category: 'Civil',
      keywords: ['daños', 'perjuicios', 'reclamación', 'indemnización', 'responsabilidad civil'],
    },
    {
      id: 'civil-2',
      question: '¿Cuál es el plazo para presentar una demanda civil?',
      answer:
        'El plazo general de prescripción para acciones civiles es de 5 años desde que el titular conoce o debería conocer el daño y quién es responsable. Sin embargo, existen plazos especiales: accidentes de tráfico (1 año), daños en edificios (3 años), etc. Es crucial actuar rápido para no perder derechos.',
      category: 'Civil',
      keywords: ['plazo', 'prescripción', 'demanda', 'límite de tiempo'],
    },
    {
      id: 'civil-3',
      question: '¿Qué debo hacer si tengo un conflicto contractual?',
      answer:
        'Ante un conflicto contractual: 1) Revisar el contrato íntegramente, 2) Contactar al otro parte por escrito (email, burofax), 3) Intentar resolver amistosamente, 4) Si falla, iniciar arbitraje o mediación, 5) En último caso, demanda civil. Conserva toda la documentación y correspondencia.',
      category: 'Civil',
      keywords: ['contrato', 'conflicto', 'incumplimiento', 'obligaciones'],
    },
  ],
  Penal: [
    {
      id: 'penal-1',
      question: '¿Cuáles son mis derechos si me detienen?',
      answer:
        'Si te detienen tienes derecho a: 1) Ser informado de tus derechos en idioma que entiendas, 2) Guardar silencio (no estás obligado a confesar), 3) Tener un abogado designado gratuitamente, 4) No ser torturado ni tratado inhumanamente, 5) Contactar con familiares. La detención máxima es de 72 horas, después debe haber orden judicial.',
      category: 'Penal',
      keywords: ['detención', 'derechos', 'abogado', 'interrogatorio', 'custodia'],
    },
    {
      id: 'penal-2',
      question: '¿Qué diferencia hay entre falta y delito?',
      answer:
        'Las faltas (infracciones leves) se sancionan con multa o trabajos en beneficio de la comunidad (máximo 6 meses). Los delitos son infracciones graves con penas de prisión, multa o ambas. Las faltas se juzgan en juzgados de lo penal, los delitos en audiencias provinciales. Los delitos prescriben entre 2 y 20 años según su gravedad.',
      category: 'Penal',
      keywords: ['falta', 'delito', 'pena', 'prisión', 'multa', 'infracción'],
    },
  ],
  Laboral: [
    {
      id: 'laboral-1',
      question: '¿Puede mi empleador despedirme sin justa causa?',
      answer:
        'No. El despido debe tener causa justificada (desempeño deficiente, conducta indebida, etc.). Un despido sin causa es nulo. Tienes derecho a: 1) Ser readmitido en tu puesto, 2) Recibir salarios de tramitación (desde el despido hasta sentencia), 3) Indemnización adicional. Debes recurrir ante los juzgados en 20 días naturales desde la comunicación del despido.',
      category: 'Laboral',
      keywords: ['despido', 'causa', 'nulo', 'readmisión', 'indemnización', 'trabajador'],
    },
    {
      id: 'laboral-2',
      question: '¿Cuál es mi derecho a vacaciones y descanso?',
      answer:
        'Por ley tienes derecho a: 1) Mínimo 30 días hábiles de vacaciones anuales, 2) Dos días de descanso semanal, 3) 14 festivos al año, 4) Permisos para circunstancias especiales (enfermedad, boda, fallecimiento de familiar). El empleador debe respetar estos derechos. Si no te los concede, es una violación laboral.',
      category: 'Laboral',
      keywords: ['vacaciones', 'descanso', 'días', 'festivos', 'permiso'],
    },
  ],
  Administrativo: [
    {
      id: 'admin-1',
      question: '¿Cómo recurro una decisión administrativa?',
      answer:
        'Ante una decisión administrativa desfavorable: 1) Presenta un recurso de reposición ante la misma administración (30 días), 2) Si lo desestima, recurso de alzada ante autoridad superior (30 días), 3) Si agota recursos administrativos, puedes demandar ante los juzgados contencioso-administrativos. En algunos casos urgentes puedes solicitar medidas cautelares.',
      category: 'Administrativo',
      keywords: ['recurso', 'administración', 'reposición', 'alzada', 'decisión'],
    },
  ],
  Mercantil: [
    {
      id: 'mercantil-1',
      question: '¿Qué es un contrato mercantil y cuáles son mis obligaciones?',
      answer:
        'Un contrato mercantil es un acuerdo entre comerciantes para realizar operaciones comerciales. Se rige por el Código de Comercio. Obligaciones: 1) Cumplir los términos acordados, 2) Pagar en plazo, 3) Mantener calidad de producto/servicio, 4) Resolver disputas según lo pactado. Incumplimiento puede resultar en demanda.',
      category: 'Mercantil',
      keywords: ['contrato', 'mercantil', 'comercio', 'obligaciones', 'acuerdo'],
    },
  ],
  Familia: [
    {
      id: 'familia-1',
      question: '¿Cómo divorciarse? ¿Cuál es el proceso?',
      answer:
        'Hay dos vías: 1) Divorcio de mutuo acuerdo: más rápido y económico (trámite en juzgado sin litigio), 2) Divorcio contencioso: si hay desacuerdo sobre custodia, pensión, bienes (requiere juicio). Ambos casos necesitan trámite judicial. En divorcio contencioso el plazo es de 2-3 años. Se reparten bienes gananciales equitativamente.',
      category: 'Familia',
      keywords: ['divorcio', 'matrimonio', 'custodia', 'pensión', 'bienes'],
    },
    {
      id: 'familia-2',
      question: '¿Cómo funciona la custodia de menores?',
      answer:
        'La custodia puede ser: 1) Conjunta (ambos padres comparten decisiones), 2) Exclusiva (un padre tiene custodia principal). El juez decide según el interés superior del menor. Se establece régimen de visitas. El padre sin custodia generalmente paga pensión de alimentos. Los menores pueden expresar preferencias (mayores de 12 años generalmente).',
      category: 'Familia',
      keywords: ['custodia', 'menores', 'hijos', 'padres', 'visitas', 'pensión'],
    },
  ],
}

/**
 * Busca una pregunta en la base de datos por similitud
 * Retorna la FAQ más cercana o null
 */
export function findSimilarFAQ(question: string, category: LegalCategory): FAQ | null {
  const categoryFAQs = faqDatabase[category] || []

  if (categoryFAQs.length === 0) return null

  const questionLower = question.toLowerCase()
  let bestMatch: FAQ | null = null
  let bestScore = 0

  for (const faq of categoryFAQs) {
    let score = 0

    // Buscar palabras clave exactas
    for (const keyword of faq.keywords) {
      if (questionLower.includes(keyword)) {
        score += 2
      }
    }

    // Palabras de la pregunta original
    const questionWords = questionLower.split(/\s+/)
    const faqWords = faq.question.toLowerCase().split(/\s+/)

    for (const word of questionWords) {
      if (faqWords.includes(word) && word.length > 3) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = faq
    }
  }

  // Solo retorna si hay una puntuación mínima
  return bestScore >= 2 ? bestMatch : null
}
