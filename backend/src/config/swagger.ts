import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Barbara & Abogados API',
      version: '1.0.0',
      description: `
## API de Consultas Legales

Esta API permite gestionar consultas legales en línea con las siguientes características:

- **Autenticación**: JWT + OAuth2 (Google, Microsoft)
- **Pagos**: Integración con Stripe
- **IA**: Filtrado inteligente de preguntas con Gemini AI
- **Admin**: Panel de administración completo

### Autenticación

La mayoría de endpoints requieren autenticación via Bearer token:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Rate Limiting

- **General**: 100 requests / 15 minutos
- **Auth**: 5 requests / 15 minutos
- **Payments**: 10 requests / minuto
      `,
      contact: {
        name: 'Barbara & Abogados',
        email: 'soporte@barbaraabogados.com',
      },
    },
    servers: [
      {
        url: process.env.APP_DOMAIN || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtenido de /auth/login o /auth/register',
        },
      },
      schemas: {
        // Common schemas
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            details: { type: 'object', additionalProperties: true },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            fields: {
              type: 'object',
              additionalProperties: { type: 'string' },
              example: { email: 'Invalid email format' },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Auth schemas
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
            password: { type: 'string', minLength: 8, example: 'password123' },
            name: { type: 'string', minLength: 2, example: 'Juan Pérez' },
          },
        },
        // Payment schemas
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', example: 50.0 },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            consultationSummary: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePaymentIntentRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 10, example: 50 },
            currency: { type: 'string', default: 'usd', example: 'usd' },
            consultationId: { type: 'string' },
            description: { type: 'string' },
          },
        },
        // FAQ schemas
        FilterQuestionRequest: {
          type: 'object',
          required: ['question'],
          properties: {
            question: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              example: '¿Cuántos días de vacaciones me corresponden por ley?',
            },
          },
        },
        FilterQuestionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                category: { type: 'string', example: 'Derecho Laboral' },
                briefAnswer: { type: 'string' },
                needsProfessionalConsultation: { type: 'boolean' },
                reasoning: { type: 'string' },
                confidence: { type: 'number', example: 0.85 },
                complexity: { type: 'string', enum: ['simple', 'medium', 'complex'] },
              },
            },
          },
        },
        // Analytics schemas
        Analytics: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                newThisMonth: { type: 'integer' },
                activeThisMonth: { type: 'integer' },
              },
            },
            payments: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                completed: { type: 'integer' },
                totalRevenue: { type: 'number' },
                averageAmount: { type: 'number' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de usuarios' },
      { name: 'FAQ', description: 'Filtrado de preguntas legales con IA' },
      { name: 'Payments', description: 'Gestión de pagos con Stripe' },
      { name: 'Admin', description: 'Panel de administración (requiere rol admin)' },
      { name: 'Health', description: 'Endpoints de salud y monitoreo' },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)
