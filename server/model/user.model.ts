/**
 * User Model
 * Represents user accounts in the system
 */

import z from 'zod'
import { type Role } from './role.model'

export const userModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    username: z.string().min(1).max(255),
    password_hash: z.string().min(1),
    role_id: z.number(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type UserModel = z.infer<typeof userModel>

export const createUserSchema = z.object({
    employee_id: z.number(),
    username: z.string().min(6).max(255),
    password_hash: z.string().min(8),
    role_id: z.number(),
    is_active: z.boolean().default(true),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
    id: z.number(),
    username: z.string().min(6).max(255).optional(),
    password_hash: z.string().min(8).optional(),
    role_id: z.number().optional(),
    is_active: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

/**
 * Login schemas
 */
export const loginSchema = z.object({
    username: z.string().min(6).max(255),
    password: z.string().min(8),
    rememberMe: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>

export const loginRequestModel = z.object({
    code: z.string().min(1),
})

export type LoginRequest = z.infer<typeof loginRequestModel>