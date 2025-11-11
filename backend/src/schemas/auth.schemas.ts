import { z } from 'zod'
import { EmailSchema, PasswordSchema, NameSchema } from './common.schemas'

export const RegisterSchema = z.object({
  body: z.object({
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
    name: NameSchema,
  }),
})

export const LoginSchema = z.object({
  body: z.object({
    email: EmailSchema,
    password: z.string().min(1, 'Contraseña requerida'),
  }),
})

export const OAuthCallbackSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token requerido'),
    provider: z.enum(['google', 'microsoft']),
  }),
})

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
  }),
})

export const PasswordResetRequestSchema = z.object({
  body: z.object({
    email: EmailSchema,
  }),
})

export const PasswordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
  }),
})

// Tipos exportados para uso en controladores
export type RegisterPayload = z.infer<typeof RegisterSchema>['body']
export type LoginPayload = z.infer<typeof LoginSchema>['body']
export type OAuthCallbackPayload = z.infer<typeof OAuthCallbackSchema>['body']
export type RefreshTokenPayload = z.infer<typeof RefreshTokenSchema>['body']
export type PasswordResetRequestPayload = z.infer<typeof PasswordResetRequestSchema>['body']
export type PasswordResetPayload = z.infer<typeof PasswordResetSchema>['body']
