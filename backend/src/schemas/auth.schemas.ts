import { z } from 'zod'
import { EmailSchema, PasswordSchema, NameSchema } from './common.schemas.js'

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
    password: PasswordSchema,
  }),
})

// Schema for OAuth callback from frontend (after code exchange)
export const OAuthCallbackSchema = z.object({
  body: z.object({
    // Google uses 'sub', Microsoft uses 'oid' - both accepted
    sub: z.string().min(1).optional(),
    oid: z.string().min(1).optional(),
    email: z.string().email('Email inválido'),
    name: z.string().optional(),
    picture: z.string().url().optional(),
  }).refine(
    (data) => data.sub || data.oid,
    { message: 'Se requiere sub (Google) o oid (Microsoft)' }
  ),
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
