/**
 * Transport Allowance Model
 * Represents employee transport allowances
 */

import z from 'zod'

export const transportAllowanceModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
    distance_km: z.number().nonnegative(),
    working_days: z.number().nonnegative(),
    total_allowance: z.number().nonnegative(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type TransportAllowance = z.infer<typeof transportAllowanceModel>

export const createTransportAllowanceSchema = z.object({
    employee_id: z.number(),
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
    distance_km: z.number().nonnegative(),
    working_days: z.number().nonnegative(),
    total_allowance: z.number().nonnegative(),
})

export type CreateTransportAllowanceInput = z.infer<typeof createTransportAllowanceSchema>

export const updateTransportAllowanceSchema = z.object({
    id: z.number(),
    employee_id: z.number().optional(),
    month: z.number().min(1).max(12).optional(),
    year: z.number().min(2000).optional(),
    distance_km: z.number().nonnegative().optional(),
    working_days: z.number().nonnegative().optional(),
    total_allowance: z.number().nonnegative().optional(),
})

export type UpdateTransportAllowanceInput = z.infer<typeof updateTransportAllowanceSchema>
