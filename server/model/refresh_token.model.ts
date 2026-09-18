/**
 * Token Model
 * Represents refresh tokens for authentication
 */

import { JwtPayload } from 'jsonwebtoken'
import z from 'zod'

export const refreshTokenModel = z.object({
    id: z.number(),
    user_id: z.number(),
    token: z.string().min(1),
    expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    created_at: z.string(),
    updated_at: z.string(),
})

export type RefreshToken = z.infer<typeof refreshTokenModel>

export const createRefreshTokenSchema = z.object({
    user_id: z.number(),
    token: z.string().min(1),
    expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
})

export type CreateRefreshTokenInput = z.infer<typeof createRefreshTokenSchema>

export const updateRefreshTokenSchema = z.object({
    token: z.string().min(1).optional(),
    expires_at: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
})

export type UpdateRefreshTokenInput = z.infer<typeof updateRefreshTokenSchema>

export interface TokenPayload extends JwtPayload {
    id?: number
    typ?: string
    sub?: string
    user_id?: number
    username?: string
    name?: string
    email?: string
    role_id?: number
    role?: string
    roles?: string[]
    employee_id?: number
}