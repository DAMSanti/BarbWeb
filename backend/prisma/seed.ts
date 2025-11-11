import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Limpiar FAQs existentes
  await prisma.fAQ.deleteMany()
  console.log('✓ FAQs anteriores eliminadas')

  // FAQ data
  const faqs = [
    {
      category: 'Civil',
      question: '¿Cuál es el plazo para presentar una demanda civil?',
      answer:
        'El plazo para presentar una demanda civil generalmente es de 5 años para la mayoría de acciones, aunque hay excepciones como contratos (1 año) u obligaciones de pagar dinero (5 años). Es importante actuar dentro del plazo para no perder el derecho.',
      keywords: ['demanda', 'plazo', 'civil', '5 años'],
    },
    {
      category: 'Civil',
      question: '¿Qué necesito para hacer un contrato válido?',
      answer:
        'Para que un contrato sea válido necesita: (1) consentimiento libre y voluntario de las partes, (2) objeto lícito y determinado, (3) causa lícita, y (4) capacidad legal de los contratantes. Se recomienda hacerlo por escrito para tener prueba.',
      keywords: ['contrato', 'válido', 'requisitos', 'consentimiento'],
    },
    {
      category: 'Penal',
      question: '¿Cuál es el plazo de prescripción de un delito?',
      answer:
        'El plazo de prescripción depende del tipo de delito: delitos leves (1 año), delitos menos graves (3 años), delitos graves (5 años) y delitos muy graves (10-15 años). La prescripción comienza a contar desde que se cometió el delito.',
      keywords: ['prescripción', 'delito', 'plazo', 'penal'],
    },
    {
      category: 'Penal',
      question: '¿Qué hacer si soy víctima de un delito?',
      answer:
        'Si eres víctima de un delito debes: (1) llamar a la policía (091 para policía nacional), (2) denunciar formalmente en comisaría, (3) conservar pruebas, (4) solicitar copia de la denuncia, (5) considerar asesoramiento legal. Tienes derecho a protección y compensación.',
      keywords: ['víctima', 'delito', 'denuncia', 'policía'],
    },
    {
      category: 'Laboral',
      question: '¿Cuántos días de vacaciones anuales me corresponden?',
      answer:
        'En España, todo trabajador tiene derecho a un mínimo de 30 días naturales de vacaciones anuales (o 22 días laborales). El empleador no puede impedir que disfrutes de ellas. Se pueden negociar condiciones pero respetando siempre los mínimos legales.',
      keywords: ['vacaciones', 'días', 'laboral', 'trabajador', '30 días'],
    },
    {
      category: 'Laboral',
      question: '¿Puedo ser despedido sin causa?',
      answer:
        'En España, no. El despido debe tener una causa justa (rendimiento, conducta, etc.) y comunicarse por escrito. El despido sin causa se considera improcedente y tienes derecho a indemnización. Si crees que ha sido injusto, puedes reclamar ante el juzgado.',
      keywords: ['despido', 'causa', 'improcedente', 'indemnización'],
    },
    {
      category: 'Administrativo',
      question: '¿Cómo recurrir una resolución administrativa?',
      answer:
        'Para recurrir una resolución administrativa: (1) presentar recurso de alzada ante el órgano superior en 30 días, (2) si lo rechaza, recurso contencioso-administrativo ante juzgado en 2 meses. Es importante respetar los plazos y fundamentar bien los motivos del recurso.',
      keywords: ['recurso', 'administrativo', 'alzada', '30 días'],
    },
    {
      category: 'Administrativo',
      question: '¿Cuál es el plazo para que una Administración resuelva mi solicitud?',
      answer:
        'El plazo general es de 3 meses. Si no responden en ese tiempo, se considera desestimada por silencio administrativo. Algunos procedimientos tienen plazos especiales. Siempre solicita acuse de recibo y conserva toda documentación.',
      keywords: ['plazo', 'resolución', 'administración', '3 meses', 'silencio'],
    },
    {
      category: 'Mercantil',
      question: '¿Qué diferencia hay entre una sociedad limitada y una autónomo?',
      answer:
        'La Sociedad Limitada (SL) es una entidad legal separada de sus dueños, con responsabilidad limitada al capital aportado. El autónomo es una persona física con responsabilidad ilimitada. La SL tiene más complejidad fiscal pero mejor protección de patrimonio personal.',
      keywords: ['SL', 'autónomo', 'responsabilidad', 'sociedad'],
    },
    {
      category: 'Mercantil',
      question: '¿Cómo protejo la propiedad intelectual de mi idea?',
      answer:
        'Puedes proteger tu idea mediante: (1) Derechos de autor (automático al crear), (2) Patentes (OEPM), (3) Marcas, (4) Secreto comercial. El proceso depende del tipo de propiedad. Se recomienda asesoramiento de experto antes de divulgar públicamente.',
      keywords: ['propiedad intelectual', 'patente', 'idea', 'derechos de autor'],
    },
    {
      category: 'Familia',
      question: '¿Cuál es el proceso de divorcio en España?',
      answer:
        'El divorcio puede ser de mutuo acuerdo (más rápido, 2-3 meses) o contencioso (con litigio, 1-2 años). Requiere resolver: custodia de menores, pensión alimenticia, reparto de bienes. Se recomienda acuerdo previo para agilizar. Necesitas presentar demanda ante juzgado.',
      keywords: ['divorcio', 'custodia', 'pensión', 'proceso'],
    },
    {
      category: 'Familia',
      question: '¿Cómo se calcula la pensión alimenticia?',
      answer:
        'La pensión alimenticia se calcula considerando: (1) ingresos del progenitor obligado, (2) necesidades del menor, (3) capacidad económica, (4) estándares de vida anterior. No existe cantidad fija. El juez la establece según cada caso. Puede modificarse si cambian circunstancias.',
      keywords: ['pensión', 'alimenticia', 'cálculo', 'menor'],
    },
  ]

  // Insertar FAQs
  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    })
  }

  console.log(`✓ ${faqs.length} FAQs creadas exitosamente`)
  console.log('✅ Seed completado')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
