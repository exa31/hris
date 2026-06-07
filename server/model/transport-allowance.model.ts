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

export const transportSettingSchema = z.object({
  base_fare: z.number().positive("Base fare harus berupa angka positif"),
  is_active: z.boolean(),
})

export type TransportSettingInput = z.infer<typeof transportSettingSchema>

export const transportGenerateSchema = z.object({
  month: z.number().int().min(1, "Bulan harus antara 1-12").max(12, "Bulan harus antara 1-12"),
  year: z.number().int().min(2000, "Tahun tidak valid").max(2100, "Tahun tidak valid"),
  force: z.boolean().optional().default(false),
})

export type TransportGenerateInput = z.infer<typeof transportGenerateSchema>
